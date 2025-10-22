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
import { getDailyImage, type DailyImage as DailyRow, getImageUrl, trackGuess, resetGuessTimer } from '@/lib/supabase'
import { useGameProgress } from '@/hooks/useGameProgress'

export default function Home() {
    const [currentGuess, setCurrentGuess] = useState('')
    const [dailyImage, setDailyImage] = useState<DailyRow | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isAnimating, setIsAnimating] = useState(false)
    const [showGuessText, setShowGuessText] = useState(true)
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
    } = useGameProgress(dailyImage, correctAnswer)

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
        setGuesses(['empty', 'empty', 'empty', 'empty', 'empty', 'empty'])
        setIsAnimating(false)
        setShowGuessText(true)
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

    const handleKeyPress = useCallback(
        (key: string) => {
            if (todayCompleted) return

        if (key === 'ENTER') {
                if (
                    currentGuess.trim() &&
                    guesses.some((g) => g === 'empty') &&
                    !isAnimating
                ) {
                    const normalizedGuess = currentGuess.toUpperCase().trim()
                    const isCorrect = normalizedGuess === correctAnswer
                    const guessNumber = 6 - remainingGuesses + 1

                    if (dailyImage?.id) {
                        void trackGuess(
                            dailyImage.id,
                            normalizedGuess,
                            isCorrect,
                            guessNumber
                        )
                    }

                    setIsAnimating(true)

                    if (!isCorrect) {
                        setTimeout(() => {
                            setShowGuessText(false)

                            const emptyIndex = guesses.findIndex(
                                (g) => g === 'empty'
                            )
                            setGuesses((prev) => {
                                const newGuesses = [...prev]
                                newGuesses[emptyIndex] = 'incorrect'

                                const remainingAfterThis = newGuesses.filter(
                                    (g) => g === 'empty'
                                ).length
                                if (remainingAfterThis === 0) {
                                    setTimeout(() => {
                                        setGameLost(true)
                                        handleGameLoss()
                                        
                                        setTimeout(() => {
                                            setShowWinModal(true)
                                        }, 1500)
                                    }, 300)
                                } else {
                                    saveProgress(newGuesses)
                                }

                                return newGuesses
                            })

                            setTimeout(() => {
                                setCurrentGuess('')
                                setShowGuessText(true)
                                setIsAnimating(false)
                            }, 300)
                        }, 500)
                    } else {
                        const emptyIndex = guesses.findIndex(
                            (g) => g === 'empty'
                        )

                        setGameWon(true)
                        setShowConfetti(true)
                        setIsAnimating(false)
                        setGuesses((prev) => {
                            const newGuesses = [...prev]
                            newGuesses[emptyIndex] = 'correct'
                            return newGuesses
                        })

                        handleGameWin(guessNumber)

                        setTimeout(() => {
                            setShowWinModal(true)
                        }, 1500)
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

    useEffect(() => {
        let mounted = true
        ;(async () => mounted && (await loadCurrent()))()
        const onFocus = () => {
            void loadCurrent()
        }
        window.addEventListener('focus', onFocus)
        document.addEventListener('visibilitychange', onFocus)
        resetGuessTimer()
        return () => {
            mounted = false
            clearTimers()
            window.removeEventListener('focus', onFocus)
            document.removeEventListener('visibilitychange', onFocus)
        }
    }, [loadCurrent, clearTimers])

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

    // Auto-open win modal if game was already completed today (win or loss)
    useEffect(() => {
        if (todayCompleted && todayCompletionData && statsLoaded) {
            setShowWinModal(true)
        }
    }, [todayCompleted, todayCompletionData, statsLoaded])

    return (
        <div className='fixed inset-0 flex flex-col overflow-hidden bg-white'>
            <div className='mx-auto flex h-full w-full max-w-none flex-col sm:max-w-md sm:shadow-lg'>
                <GameHeader
                    timer={timer}
                    onShowStats={() => setShowStats(true)}
                    onShowHelp={() => setShowHelp(true)}
                />

                <div className='flex w-full flex-1 flex-col px-4 min-h-0'>
                    <div className='flex w-full flex-1 flex-col items-center min-h-0'>
                        <GameImage
                            isLoading={isLoading}
                            dailyImage={dailyImage}
                            remainingGuesses={remainingGuesses}
                            currentGuess={currentGuess}
                            correctAnswer={correctAnswer}
                            gameWon={gameWon}
                            gameLost={gameLost}
                            todayCompleted={todayCompleted}
                            todayCompletionData={todayCompletionData}
                            showGuessText={showGuessText}
                            isAnimating={isAnimating}
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
                stats={stats}
                statsLoaded={statsLoaded}
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

            <WinModal
                isOpen={showWinModal}
                onClose={() => setShowWinModal(false)}
                idolName={correctAnswer}
                imageUrl={
                    dailyImage
                        ? getImageUrl(dailyImage.group_type, dailyImage.img_bucket, 'clear')
                        : ''
                }
                pixelatedImageUrl={
                    dailyImage
                        ? getImageUrl(dailyImage.group_type, dailyImage.img_bucket, 1)
                        : ''
                }
                guessCount={
                    todayCompletionData?.guessCount ||
                    6 - guesses.filter((g) => g === 'empty').length
                }
                isWin={todayCompletionData ? todayCompletionData.won : gameWon}
                stats={{
                    gamesPlayed: stats.totalGames,
                    winPercentage: stats.totalGames > 0 
                        ? Math.round((stats.totalWins / stats.totalGames) * 100)
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
            />

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
