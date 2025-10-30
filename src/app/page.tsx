'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Confetti from 'react-confetti'
import OnScreenKeyboard from '@/components/OnScreenKeyboard'
import GameHeader from '@/components/GameHeader'
import GameImage from '@/components/GameImage'
import GuessIndicators from '@/components/GuessIndicators'
import StatsModal from '@/components/StatsModal'
import HelpModal from '@/components/HelpModal'
import FeedbackModal from '@/components/FeedbackModal'
import WinModal from '@/components/WinModal'
import {
    getDailyImage,
    getMultipleRandomUnlimitedImages,
    type DailyImage as DailyRow,
    getImageUrl,
    trackGuess,
    resetGuessTimer,
    addSeenIdol,
    clearSeenIdols,
} from '@/lib/supabase'
import { useGameProgress } from '@/hooks/useGameProgress'
import { useUnlimitedStats } from '@/components/UserStats'

function encodeIdolName(name: string): string {
    const reversed = name.split('').reverse().join('')
    return btoa(reversed)
}

function decodeIdolName(encoded: string): string {
    try {
        const decoded = atob(encoded)
        return decoded.split('').reverse().join('')
    } catch {
        return ''
    }
}

export default function Home() {
    const [gameMode, setGameMode] = useState<'daily' | 'unlimited'>('daily')
    const [currentGuess, setCurrentGuess] = useState('')
    const [lastIncorrectGuess, setLastIncorrectGuess] = useState('')
    const [dailyImage, setDailyImage] = useState<DailyRow | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isAnimating, setIsAnimating] = useState(false)
    const [correctAnswer, setCorrectAnswer] = useState('')
    const [showConfetti, setShowConfetti] = useState(false)
    const [showStats, setShowStats] = useState(false)
    const [showHelp, setShowHelp] = useState(false)
    const [showFeedback, setShowFeedback] = useState(false)
    const [showWinModal, setShowWinModal] = useState(false)
    const [windowDimensions, setWindowDimensions] = useState({
        width: 0,
        height: 0,
    })
    const [prefetchedImages, setPrefetchedImages] = useState<DailyRow[]>([])
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [showStreakPopup, setShowStreakPopup] = useState(false)
    const [streakMilestone, setStreakMilestone] = useState(0)
    const lastStreakMilestoneRef = useRef(0)
    const [showGameOver, setShowGameOver] = useState(false)
    const isSwitchingModeRef = useRef(false)

    const {
        guesses,
        setGuesses,
        gameWon,
        setGameWon,
        gameLost,
        setGameLost,
        todayCompleted,
        todayCompletionData,
        stats,
        statsLoaded,
        handleGameWin,
        handleGameLoss,
        saveProgress,
        saveGuessAttempt,
        loadGuessAttempts,
    } = useGameProgress(dailyImage, correctAnswer)

    const unlimitedStats = useUnlimitedStats()

    const [timer, setTimer] = useState('00:00:00')
    const serverOffsetRef = useRef<number>(0)
    const tickIntervalRef = useRef<number | null>(null)
    const flipTimeoutRef = useRef<number | null>(null)

    const remainingGuesses = guesses.filter((g) => g === 'empty').length

    function formatMs(ms: number) {
        const clamped = Math.max(0, ms)
        const s = Math.floor(clamped / 1000)
        const hh = String(Math.floor(s / 3600)).padStart(2, '0')
        const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
        const ss = String(s % 60).padStart(2, '0')
        return `${hh}:${mm}:${ss}`
    }

    const clearTimers = useCallback(() => {
        if (tickIntervalRef.current) {
            clearInterval(tickIntervalRef.current)
            tickIntervalRef.current = null
        }
        if (flipTimeoutRef.current) {
            clearTimeout(flipTimeoutRef.current)
            flipTimeoutRef.current = null
        }
    }, [])

    const flipNow = useCallback(async () => {
        clearTimers()

        setCurrentGuess('')
        setLastIncorrectGuess('')
        setGuesses(['empty', 'empty', 'empty', 'empty', 'empty', 'empty'])
        setIsAnimating(false)
        setShowConfetti(false)
        setGameWon(false)
        resetGuessTimer()

        const next = await getDailyImage()
        if (!next) return

        setDailyImage(next)
        if (next.name) setCorrectAnswer(next.name.toUpperCase())

        scheduleCountdownAndFlip(next.end_at)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clearTimers, setGuesses, setGameWon])

    const scheduleCountdownAndFlip = useCallback(
        (endAtISO: string) => {
            clearTimers()
            const endAtMs = new Date(endAtISO).getTime()

            tickIntervalRef.current = window.setInterval(() => {
                const approxServerNow = Date.now() + serverOffsetRef.current
                const remaining = endAtMs - approxServerNow
                setTimer(formatMs(remaining))
                if (remaining <= 0) {
                    void flipNow()
                }
            }, 1000)

            const delayMs = Math.max(
                0,
                endAtMs - (Date.now() + serverOffsetRef.current)
            )
            flipTimeoutRef.current = window.setTimeout(() => {
                void flipNow()
            }, delayMs)
        },
        [clearTimers, flipNow]
    )

    const loadCurrent = useCallback(async () => {
        setIsLoading(true)
        const row = await getDailyImage()
        setIsLoading(false)

        if (!row) return

        setDailyImage(row)
        if (row.name) setCorrectAnswer(row.name.toUpperCase())

        const serverNowMs = new Date(row.server_now).getTime()
        serverOffsetRef.current = serverNowMs - Date.now()

        scheduleCountdownAndFlip(row.end_at)
    }, [scheduleCountdownAndFlip])

    const loadUnlimitedRef = useRef(false)

    const loadUnlimited = useCallback(async () => {
        if (loadUnlimitedRef.current) return
        loadUnlimitedRef.current = true

        const currentStreak = unlimitedStats.stats.currentStreak
        const milestones = [1, 10, 25, 50, 75, 100]
        const lastMilestone =
            milestones.filter((m) => m <= currentStreak).pop() || 0
        lastStreakMilestoneRef.current = lastMilestone

        const savedGameState = unlimitedStats.loadGameState()

        if (savedGameState) {
            if (!savedGameState.encodedIdolName) {
                unlimitedStats.clearGameState()
                const newImages = await getMultipleRandomUnlimitedImages(5)
                setIsLoading(false)

                if (newImages.length > 0) {
                    setPrefetchedImages(newImages)
                    setCurrentImageIndex(1)
                    setDailyImage(newImages[0])
                    if (newImages[0].name)
                        setCorrectAnswer(newImages[0].name.toUpperCase())
                    // Track that we've seen this idol
                    if (newImages[0].img_bucket) {
                        addSeenIdol(newImages[0].img_bucket)
                    }
                }
                loadUnlimitedRef.current = false
                return
            }

            const decodedName = decodeIdolName(savedGameState.encodedIdolName)

            const savedImage: DailyRow = {
                id: 0,
                name: decodedName,
                group_type: savedGameState.groupType,
                img_bucket: savedGameState.imgBucket,
                group_category: savedGameState.groupCategory,
                base64_group: savedGameState.base64Group,
                base64_idol: savedGameState.base64Idol,
            }

            setDailyImage(savedImage)
            setCorrectAnswer(decodedName.toUpperCase())
            setGuesses(savedGameState.guesses)

            const hasWon = savedGameState.guesses.includes('correct')
            const hasLost =
                savedGameState.guesses.filter((g) => g === 'incorrect')
                    .length === 6
            setGameWon(hasWon)
            setGameLost(hasLost)

            // Clear UI state when restoring
            setCurrentGuess('')
            setLastIncorrectGuess('')
            setIsAnimating(false)
            setShowConfetti(false)
            setShowWinModal(false)
            setIsLoading(false)

            getMultipleRandomUnlimitedImages(5).then((newImages) => {
                setPrefetchedImages(newImages)
                setCurrentImageIndex(0)
                // Mark all prefetched idols as seen immediately
                newImages.forEach(img => {
                    if (img.img_bucket) addSeenIdol(img.img_bucket)
                })
            })
        } else {
            setIsLoading(true)
            const newImages = await getMultipleRandomUnlimitedImages(5)
            setIsLoading(false)

            if (newImages.length > 0) {
                setPrefetchedImages(newImages)
                setCurrentImageIndex(1)
                setDailyImage(newImages[0])
                if (newImages[0].name)
                    setCorrectAnswer(newImages[0].name.toUpperCase())
                // Mark all prefetched idols as seen immediately
                newImages.forEach(img => {
                    if (img.img_bucket) addSeenIdol(img.img_bucket)
                })
            }
        }

        loadUnlimitedRef.current = false
    }, [
        unlimitedStats,
        setGuesses,
        setGameWon,
        setGameLost,
        setCurrentGuess,
        setLastIncorrectGuess,
        setIsAnimating,
        setShowConfetti,
        setShowWinModal,
    ])

    const handleGameModeChange = useCallback(
        (mode: 'daily' | 'unlimited') => {
            if (mode === gameMode) return
            
            // CRITICAL: Prevent multiple simultaneous mode switches
            if (isSwitchingModeRef.current) {
                console.log('[Mode Switch] Already switching, ignoring request')
                return
            }

            isSwitchingModeRef.current = true

            if (
                gameMode === 'unlimited' &&
                dailyImage &&
                !gameWon &&
                !gameLost
            ) {
                unlimitedStats.saveGameState({
                    groupType: dailyImage.group_type,
                    imgBucket: dailyImage.img_bucket,
                    groupCategory: dailyImage.group_category,
                    base64Group: dailyImage.base64_group,
                    base64Idol: dailyImage.base64_idol,
                    encodedIdolName: encodeIdolName(dailyImage.name || ''),
                    guesses: guesses,
                    savedAt: new Date().toISOString(),
                })
            }

            localStorage.setItem('idol-guessr-game-mode', mode)

            // CRITICAL: Clear image BEFORE changing mode to prevent race condition
            // This ensures GameImage never renders with mismatched mode + data
            setDailyImage(null)
            setIsLoading(true)
            
            // Use setTimeout to ensure state updates are processed in correct order
            setTimeout(() => {
                setGameMode(mode)
                // Lock will be released after data loads in useEffect
            }, 0)

            if (mode === 'daily') {
                setCurrentGuess('')
                setLastIncorrectGuess('')
                setGuesses([
                    'empty',
                    'empty',
                    'empty',
                    'empty',
                    'empty',
                    'empty',
                ])
                setIsAnimating(false)
                setShowConfetti(false)
                setGameWon(false)
                setGameLost(false)
                setShowWinModal(false)
                void loadCurrent()
            } else {
                clearTimers()
                setPrefetchedImages([])
                setCurrentImageIndex(0)
                loadUnlimitedRef.current = false
                lastStreakMilestoneRef.current = 0
                void loadUnlimited()
            }
        },
        [
            gameMode,
            loadCurrent,
            loadUnlimited,
            clearTimers,
            setGuesses,
            setGameWon,
            setGameLost,
            dailyImage,
            guesses,
            gameWon,
            gameLost,
            unlimitedStats,
        ]
    )

    const loadNextUnlimited = useCallback(() => {
        if (!gameWon && !gameLost) {
            const hasGuesses = guesses.some(
                (g) => g === 'incorrect' || g === 'correct'
            )
            if (hasGuesses) {
                unlimitedStats.updateStats(false, true)
            }
            lastStreakMilestoneRef.current = 0
        }

        setCurrentGuess('')
        setLastIncorrectGuess('')
        const freshGuesses: Array<'correct' | 'incorrect' | 'empty'> = [
            'empty',
            'empty',
            'empty',
            'empty',
            'empty',
            'empty',
        ]
        setGuesses(freshGuesses)
        setIsAnimating(false)
        setShowConfetti(false)
        setGameWon(false)
        setGameLost(false)
        setShowWinModal(false)
        resetGuessTimer()

        if (prefetchedImages.length > currentImageIndex) {
            const row = prefetchedImages[currentImageIndex]
            setDailyImage(row)
            if (row.name) setCorrectAnswer(row.name.toUpperCase())
            setCurrentImageIndex((prev) => prev + 1)

            // No need to add to seen here - already added when fetched

            unlimitedStats.saveGameState({
                groupType: row.group_type,
                imgBucket: row.img_bucket,
                groupCategory: row.group_category,
                base64Group: row.base64_group,
                base64Idol: row.base64_idol,
                encodedIdolName: encodeIdolName(row.name || ''),
                guesses: freshGuesses,
                savedAt: new Date().toISOString(),
            })

            // Preload next idol's images into browser cache
            if (prefetchedImages.length > currentImageIndex) {
                const nextRow = prefetchedImages[currentImageIndex]
                if (nextRow) {
                    // Preload all 6 images for the next idol
                    const imagesToPreload = [1, 2, 3, 4, 5, 'clear'].map((num) =>
                        getImageUrl(
                            nextRow.group_type,
                            nextRow.img_bucket,
                            num as number | 'clear',
                            'unlimited',
                            nextRow.group_category,
                            nextRow.base64_group
                        )
                    )
                    
                    // Preload images in background
                    imagesToPreload.forEach((url) => {
                        const img = new window.Image()
                        img.src = url
                    })
                }
            }

            // Fetch more idols when running low
            if (currentImageIndex >= prefetchedImages.length - 2) {
                getMultipleRandomUnlimitedImages(5).then((newImages) => {
                    setPrefetchedImages((prev) => [...prev, ...newImages])
                    // Mark all prefetched idols as seen immediately
                    newImages.forEach(img => {
                        if (img.img_bucket) addSeenIdol(img.img_bucket)
                    })
                })
            }
        }
    }, [
        prefetchedImages,
        currentImageIndex,
        setGuesses,
        setGameWon,
        setGameLost,
        unlimitedStats,
        gameWon,
        gameLost,
        guesses,
    ])

    const handlePlayAgain = useCallback(() => {
        setShowGameOver(false)
        loadNextUnlimited()
    }, [loadNextUnlimited])

    const handleKeyPress = useCallback(
        (key: string) => {
            if (gameMode === 'daily' && todayCompleted) return

        if (key === 'ENTER') {
                if (
                    currentGuess.trim() &&
                    guesses.some((g) => g === 'empty') &&
                    !isAnimating &&
                    !gameWon &&
                    !gameLost
                ) {
                    const normalizedGuess = currentGuess.toUpperCase().trim()
                    const isCorrect = normalizedGuess === correctAnswer
                    const guessNumber = 6 - remainingGuesses + 1

                    if (gameMode === 'daily') {
                        saveGuessAttempt(normalizedGuess)

                        if (dailyImage?.id) {
                            void trackGuess(
                                dailyImage.id,
                                normalizedGuess,
                                isCorrect,
                                guessNumber
                            )
                        }
                    }

                    setIsAnimating(true)

                    if (!isCorrect) {
                        setLastIncorrectGuess(normalizedGuess)

                        setCurrentGuess('')

                        const emptyIndex = guesses.findIndex(
                            (g) => g === 'empty'
                        )
                        const newGuesses = [...guesses]
                        newGuesses[emptyIndex] = 'incorrect'

                        const remainingAfterThis = newGuesses.filter(
                            (g) => g === 'empty'
                        ).length

                        if (
                            gameMode === 'unlimited' &&
                            dailyImage &&
                            remainingAfterThis > 0
                        ) {
                            unlimitedStats.saveGameState({
                                groupType: dailyImage.group_type,
                                imgBucket: dailyImage.img_bucket,
                                groupCategory: dailyImage.group_category,
                                base64Group: dailyImage.base64_group,
                                base64Idol: dailyImage.base64_idol,
                                encodedIdolName: encodeIdolName(
                                    dailyImage.name || ''
                                ),
                                guesses: newGuesses,
                                savedAt: new Date().toISOString(),
                            })
                        }

                        setTimeout(() => {
                            setIsAnimating(false)

                            setGuesses((prev) => {
                                const newGuesses = [...prev]
                                const emptyIndex = newGuesses.findIndex(
                                    (g) => g === 'empty'
                                )
                                newGuesses[emptyIndex] = 'incorrect'

                                const remainingAfterThis = newGuesses.filter(
                                    (g) => g === 'empty'
                                ).length
                                if (remainingAfterThis === 0) {
                                    setTimeout(() => {
                                        setGameLost(true)

                                        if (gameMode === 'daily') {
                                            handleGameLoss()
                                            setTimeout(() => {
                                                setShowWinModal(true)
                                            }, 2000)
                                        } else {
                                            unlimitedStats.updateStats(
                                                false,
                                                true
                                            )
                                            unlimitedStats.clearGameState()
                                            lastStreakMilestoneRef.current = 0
                                            clearSeenIdols()
                                        }
                                    }, 300)
                                } else {
                                    if (gameMode === 'daily') {
                                        saveProgress(newGuesses)
                                    }
                                }

                                return newGuesses
                            })
                        }, 500)
                    } else {
                        const emptyIndex = guesses.findIndex(
                            (g) => g === 'empty'
                        )

                        setGameWon(true)
                        if (gameMode === 'daily') {
                            setShowConfetti(true)
                        }
                        setIsAnimating(false)
                        setCurrentGuess('')
                        setGuesses((prev) => {
                            const newGuesses = [...prev]
                            newGuesses[emptyIndex] = 'correct'
                            return newGuesses
                        })

                        if (gameMode === 'daily') {
                            handleGameWin(guessNumber)
                            setTimeout(() => {
                                setShowWinModal(true)
                            }, 2000)
                        } else {
                            const currentStreak =
                                unlimitedStats.stats.currentStreak
                            const newStreak = currentStreak + 1

                            if (newStreak % 5 === 0) {
                                setStreakMilestone(newStreak)
                                setShowStreakPopup(true)
                            }

                            unlimitedStats.updateStats(true, false)
                            unlimitedStats.clearGameState()
                        }
                    }
                }
        } else if (key === '✕') {
                if (!gameWon && !gameLost) {
            setCurrentGuess((prev) => prev.slice(0, -1))
                }
        } else {
                if (
                    guesses.some((g) => g === 'empty') &&
                    !isAnimating &&
                    !gameWon &&
                    !gameLost
                ) {
                    // Clear the last incorrect guess when starting to type a new guess
                    if (lastIncorrectGuess) {
                        setLastIncorrectGuess('')
                    }
            setCurrentGuess((prev) => prev + key)
        }
    }
        },
        [
            currentGuess,
            guesses,
            correctAnswer,
            isAnimating,
            gameWon,
            gameLost,
            remainingGuesses,
            todayCompleted,
            handleGameWin,
            handleGameLoss,
            saveProgress,
            setGameLost,
            setGameWon,
            setGuesses,
            dailyImage,
            saveGuessAttempt,
            lastIncorrectGuess,
            gameMode,
            unlimitedStats,
        ]
    )

    useEffect(() => {
        const handlePhysicalKeyPress = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.tagName === 'SELECT' ||
                target.isContentEditable
            ) {
                return
            }

            const key = event.key.toUpperCase()

            if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
                event.preventDefault()
            }

            if (key === 'ENTER') {
                handleKeyPress('ENTER')
            } else if (key === 'BACKSPACE') {
                handleKeyPress('✕')
            } else if (/^[A-Z]$/.test(key)) {
                handleKeyPress(key)
            }
        }

        window.addEventListener('keydown', handlePhysicalKeyPress)
        return () =>
            window.removeEventListener('keydown', handlePhysicalKeyPress)
    }, [handleKeyPress])

    const gameModeRef = useRef(gameMode)
    gameModeRef.current = gameMode
    const hasLoadedInitialRef = useRef(false)

    useEffect(() => {
        const savedMode = localStorage.getItem('idol-guessr-game-mode')
        if (savedMode === 'unlimited') {
            setGameMode('unlimited')
        } else {
            hasLoadedInitialRef.current = true
        }
    }, [])

    useEffect(() => {
        if (!hasLoadedInitialRef.current && gameMode === 'daily') {
            return
        }
        hasLoadedInitialRef.current = true

        let mounted = true
        const loadGame = async () => {
            if (!mounted) return
            
            // Safety: Clear any existing image data before loading
            // This prevents race conditions where old data lingers
            setDailyImage(null)
            setIsLoading(true)

            if (gameMode === 'daily') {
                await loadCurrent()
            } else {
                await loadUnlimited()
            }
            
            // Release mode switch lock after data is loaded
            if (isSwitchingModeRef.current) {
                setTimeout(() => {
                    isSwitchingModeRef.current = false
                }, 100)
            }
        }
        void loadGame()

        const onFocus = () => {
            if (gameModeRef.current === 'daily') {
                void loadCurrent()
            }
        }

        if (gameMode === 'daily') {
            window.addEventListener('focus', onFocus)
            document.addEventListener('visibilitychange', onFocus)
        }

        resetGuessTimer()
        return () => {
            mounted = false
            clearTimers()
            window.removeEventListener('focus', onFocus)
            document.removeEventListener('visibilitychange', onFocus)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameMode])

    useEffect(() => {
        const update = () =>
            setWindowDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        update()
        window.addEventListener('resize', update)
        return () => window.removeEventListener('resize', update)
    }, [])

    // Auto-open help modal for first-time visitors
    useEffect(() => {
        try {
            const hasVisited = localStorage.getItem('idol-guessr-has-visited')
            if (!hasVisited) {
                setShowHelp(true)
                localStorage.setItem('idol-guessr-has-visited', 'true')
            }
        } catch (error) {
            console.error('Error checking first visit:', error)
        }
    }, [])

    // Emergency recovery: Restore from saved game state if invalid data detected
    useEffect(() => {
        const handleEmergencyRecovery = () => {
            console.error('[Emergency Recovery] Invalid data detected, restoring from saved state...')
            
            if (gameMode === 'unlimited') {
                const savedGameState = unlimitedStats.loadGameState()
                
                if (savedGameState && savedGameState.encodedIdolName) {
                    console.log('[Emergency Recovery] Restoring saved unlimited game state:', savedGameState)
                    
                    const decodedName = decodeIdolName(savedGameState.encodedIdolName)
                    const savedImage: DailyRow = {
                        id: 0,
                        name: decodedName,
                        group_type: savedGameState.groupType,
                        img_bucket: savedGameState.imgBucket,
                        group_category: savedGameState.groupCategory,
                        base64_group: savedGameState.base64Group,
                        base64_idol: savedGameState.base64Idol,
                    }
                    
                    setDailyImage(savedImage)
                    setCorrectAnswer(decodedName.toUpperCase())
                    setGuesses(savedGameState.guesses)
                    setIsLoading(false)
                    
                    console.log('[Emergency Recovery] Successfully restored game state!')
                } else {
                    console.error('[Emergency Recovery] No valid saved state, using fallback idol (Wonyoung)')
                    
                    // Fallback to Wonyoung from IVE
                    const fallbackImage: DailyRow = {
                        id: 84,
                        name: 'Wonyoung',
                        group_type: 'girl-group',
                        img_bucket: 'V29ueW91bmc-001',
                        group_category: 'girl-group',
                        base64_group: 'SVZF',
                        base64_idol: 'V29ueW91bmc',
                    }
                    
                    setDailyImage(fallbackImage)
                    setCorrectAnswer('WONYOUNG')
                    setGuesses(['empty', 'empty', 'empty', 'empty', 'empty', 'empty'])
                    setGameWon(false)
                    setGameLost(false)
                    setCurrentGuess('')
                    setLastIncorrectGuess('')
                    setIsLoading(false)
                    
                    console.log('[Emergency Recovery] Loaded fallback idol successfully!')
                }
            }
        }
        
        window.addEventListener('idol-guessr-emergency-recovery', handleEmergencyRecovery)
        return () => window.removeEventListener('idol-guessr-emergency-recovery', handleEmergencyRecovery)
    }, [gameMode, unlimitedStats, setGuesses, setIsLoading, loadUnlimited, setGameWon, setGameLost])

    useEffect(() => {
        if (
            gameMode === 'daily' &&
            todayCompleted &&
            todayCompletionData &&
            statsLoaded
        ) {
            setTimeout(() => {
                setShowWinModal(true)
            }, 2000)
        }
    }, [todayCompleted, todayCompletionData, statsLoaded, gameMode])

    useEffect(() => {
        if (gameMode === 'unlimited' && (gameWon || gameLost)) {
            if (gameLost) {
                // Show game over modal after 2 seconds
                const timer = setTimeout(() => {
                    setShowGameOver(true)
                }, 2000)
                return () => clearTimeout(timer)
            } else {
                // For wins, continue to next idol
                const delay = showStreakPopup ? 2400 : 2000
                const timer = setTimeout(() => {
                    loadNextUnlimited()
                }, delay)
                return () => clearTimeout(timer)
            }
        }
    }, [gameMode, gameWon, gameLost, loadNextUnlimited, showStreakPopup])

    return (
        <div className='fixed inset-0 flex flex-col overflow-hidden bg-white'>
            <div className='mx-auto flex h-full w-full max-w-none flex-col sm:max-w-md sm:shadow-lg'>
                <GameHeader
                    timer={timer}
                    onShowStats={() => setShowStats(true)}
                    gameMode={gameMode}
                    onGameModeChange={handleGameModeChange}
                />

                <div className='flex min-h-0 w-full flex-1 flex-col px-4'>
                    <div className='flex min-h-0 w-full flex-1 flex-col items-center'>
                        <GameImage
                            isLoading={isLoading}
                            dailyImage={dailyImage}
                            remainingGuesses={remainingGuesses}
                            currentGuess={currentGuess}
                            lastIncorrectGuess={lastIncorrectGuess}
                            correctAnswer={correctAnswer}
                            gameWon={gameWon}
                            gameLost={gameLost}
                            todayCompleted={todayCompleted}
                            todayCompletionData={todayCompletionData}
                            isAnimating={isAnimating}
                            gameMode={gameMode}
                            onPass={
                                gameMode === 'unlimited' &&
                                !gameWon &&
                                !gameLost
                                    ? loadNextUnlimited
                                    : undefined
                            }
                            showStreakPopup={showStreakPopup}
                            streakMilestone={streakMilestone}
                            onStreakPopupComplete={() =>
                                setShowStreakPopup(false)
                            }
                            currentStreak={
                                gameMode === 'unlimited'
                                    ? unlimitedStats.stats.currentStreak
                                    : 0
                            }
                            showGameOver={showGameOver}
                            highestStreak={unlimitedStats.stats.maxStreak}
                            onPlayAgain={handlePlayAgain}
                        />

                        <GuessIndicators guesses={guesses} />
            </div>

                    <OnScreenKeyboard
                        onKeyPress={handleKeyPress}
                        className='flex-shrink-0 pb-4'
                            />
                        </div>
                    </div>

            <StatsModal
                isOpen={showStats}
                onClose={() => setShowStats(false)}
                onShowHelp={() => {
                    setShowStats(false)
                    setShowHelp(true)
                }}
                stats={gameMode === 'daily' ? stats : unlimitedStats.stats}
                statsLoaded={
                    gameMode === 'daily' ? statsLoaded : unlimitedStats.isLoaded
                }
                gameMode={gameMode}
            />

            <HelpModal
                isOpen={showHelp}
                onClose={() => setShowHelp(false)}
                onShowFeedback={() => {
                    setShowFeedback(true)
                    setShowHelp(false)
                }}
            />

            <FeedbackModal
                isOpen={showFeedback}
                onClose={() => setShowFeedback(false)}
                onBack={() => {
                    setShowFeedback(false)
                    setShowHelp(true)
                }}
            />

            {gameMode === 'daily' && (
                <WinModal
                    isOpen={showWinModal}
                    onClose={() => setShowWinModal(false)}
                    idolName={correctAnswer}
                    imageUrl={
                        dailyImage
                            ? getImageUrl(
                                  dailyImage.group_type,
                                  dailyImage.img_bucket,
                                  'clear',
                                  gameMode,
                                  dailyImage.group_category,
                                  dailyImage.base64_group
                              )
                            : ''
                    }
                    pixelatedImageUrl={
                        dailyImage
                            ? getImageUrl(
                                  dailyImage.group_type,
                                  dailyImage.img_bucket,
                                  1,
                                  gameMode,
                                  dailyImage.group_category,
                                  dailyImage.base64_group
                              )
                            : ''
                    }
                    guessCount={
                        todayCompletionData?.guessCount ||
                        6 - guesses.filter((g) => g === 'empty').length
                    }
                    isWin={
                        todayCompletionData ? todayCompletionData.won : gameWon
                    }
                    guessAttempts={
                        todayCompletionData?.guessAttempts ||
                        loadGuessAttempts()
                    }
                    stats={{
                        gamesPlayed: stats.totalGames,
                        winPercentage:
                            stats.totalGames > 0
                                ? Math.round(
                                      (stats.totalWins / stats.totalGames) * 100
                                  )
                                : 0,
                        currentStreak: stats.currentStreak,
                        maxStreak: stats.maxStreak,
                    }}
                    guessDistribution={[
                        stats.guessDistribution[1] || 0,
                        stats.guessDistribution[2] || 0,
                        stats.guessDistribution[3] || 0,
                        stats.guessDistribution[4] || 0,
                        stats.guessDistribution[5] || 0,
                        stats.guessDistribution[6] || 0,
                    ]}
                    gameMode={gameMode}
                    onNextUnlimited={loadNextUnlimited}
                />
            )}

            {showConfetti && windowDimensions.width > 0 && (
                <Confetti
                    width={windowDimensions.width}
                    height={windowDimensions.height}
                    recycle={false}
                    numberOfPieces={200}
                    gravity={0.3}
                />
            )}
        </div>
    )
}
