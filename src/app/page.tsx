'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Confetti from 'react-confetti'
import PixelatedImage from '@/components/PixelatedImage'
import OnScreenKeyboard from '@/components/OnScreenKeyboard'
import UserStats from '@/components/UserStats'
import ShareButton from '@/components/ShareButton'
import { getDailyImage, type DailyImage as DailyRow } from '@/lib/supabase'
import { useGameProgress } from '@/hooks/useGameProgress'
import localFont from 'next/font/local'

const proximaNovaBold = localFont({
    src: '../../public/fonts/proximanova_bold.otf',
})

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
    const gameOver = remainingGuesses === 0 && !gameWon
    const pixelationLevel = gameWon || gameOver ? 0 : remainingGuesses

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
        [clearTimers]
    )

    const flipNow = useCallback(async () => {
        clearTimers()

        setCurrentGuess('')
        setGuesses(['empty', 'empty', 'empty', 'empty', 'empty', 'empty'])
        setIsAnimating(false)
        setShowGuessText(true)
        setShowConfetti(false)
        setGameWon(false)

        const next = await getDailyImage()
        if (!next) return

        setDailyImage(next)
        if (next.name) setCorrectAnswer(next.name.toUpperCase())

        scheduleCountdownAndFlip(next.end_at)
    }, [clearTimers, scheduleCountdownAndFlip, setGuesses, setGameWon])

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
                        const guessNumber = 6 - remainingGuesses + 1

                        setGameWon(true)
                        setShowConfetti(true)
                        setIsAnimating(false)
                        setGuesses((prev) => {
                            const newGuesses = [...prev]
                            newGuesses[emptyIndex] = 'correct'
                            return newGuesses
                        })

                        handleGameWin(guessNumber)
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
        ]
    )

    useEffect(() => {
        const handlePhysicalKeyPress = (event: KeyboardEvent) => {
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
        return () => {
            mounted = false
            clearTimers()
            window.removeEventListener('focus', onFocus)
            document.removeEventListener('visibilitychange', onFocus)
        }
    }, [])

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

    return (
        <div className='flex h-screen flex-col overflow-hidden bg-white'>
            <div className='mx-auto flex h-full w-full max-w-none flex-col sm:max-w-md sm:shadow-lg'>
                {/* Header - Two 50% sections */}
                <div className='mb-2 flex w-full flex-shrink-0 items-center p-4'>
                    {/* Left Section - Logo (50%) */}
                    <div className='flex w-1/2 items-center justify-start'>
                        <Image
                            src='/images/idolguessr-logo.png'
                            alt='IdolGuessr Logo'
                            width={150}
                            height={50}
                            className='h-10 w-auto'
                        />
                    </div>

                    {/* Right Section - Timer + Stats (50%) */}
                    <div className='flex w-1/2 items-center justify-end gap-3'>
                        {/* Timer */}
                        <div className='flex flex-col items-end text-right'>
                            <div className='text-xs font-medium text-gray-400'>
                                NEXT IDOL
                            </div>
                            <div className='font-mono text-lg leading-none font-bold text-black'>
                                {timer}
                            </div>
                        </div>

                        {/* Stats Button */}
                        <button
                            onClick={() => setShowStats(true)}
                            className='flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 transition-colors hover:bg-gray-200'
                            aria-label='View Statistics'
                        >
                            <StatsIcon />
                        </button>

                        {/* Help Button */}
                        <button
                            onClick={() => setShowHelp(true)}
                            className='flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 transition-colors hover:bg-gray-200'
                            aria-label='View Help'
                        >
                            <HelpIcon />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className='flex w-full flex-1 flex-col px-4'>
                    <div className='flex w-full flex-col items-center'>
                        <div className='relative mb-3 w-full sm:mx-auto sm:max-w-md'>
                            <div className='aspect-square w-full overflow-hidden rounded-lg'>
                                {isLoading ? (
                                    <div className='flex h-full w-full items-center justify-center'>
                                        <div className='text-gray-400'>
                                            Loading...
                                        </div>
                                    </div>
                                ) : dailyImage ? (
                                    <PixelatedImage
                                        src={dailyImage.file_name}
                                        alt='Daily idol'
                                        width={500}
                                        height={500}
                                        pixelationLevel={pixelationLevel}
                                    />
                                ) : (
                                    <div className='flex h-full w-full items-center justify-center'>
                                        <div className='text-gray-400'>
                                            No image available
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Guess Indicators */}
                        <div className='grid w-full grid-cols-6 gap-2 sm:mx-auto sm:max-w-md'>
                            {guesses.map((guess, index) => (
                                <div
                                    key={`${index}-${guess}`}
                                    className={`flex aspect-square items-center justify-center rounded-[5px] ${
                                        guess === 'correct'
                                            ? 'square-pop-animation bg-green-400'
                                            : guess === 'incorrect'
                                              ? 'square-pop-animation bg-black'
                                              : 'bg-gray-200'
                                    }`}
                                >
                                    {guess === 'incorrect' && (
                                        <span className='text-base font-bold text-white'>
                                            ✕
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Current Guess */}
                    <div className='flex flex-1 flex-col items-center justify-center gap-6'>
                        {todayCompleted && todayCompletionData ? (
                            <>
                                <h1
                                    className={`${proximaNovaBold.className} text-4xl font-bold tracking-wider text-green-400`}
                                >
                                    {correctAnswer}
                                </h1>
                                <ShareButton
                                    correctAnswer={correctAnswer}
                                    guessCount={todayCompletionData.guessCount}
                                    pixelatedImageSrc={
                                        dailyImage?.file_name || ''
                                    }
                                />
                            </>
                        ) : gameWon ? (
                            <>
                                <h1
                                    className={`${proximaNovaBold.className} text-4xl font-bold tracking-wider text-green-500`}
                                >
                                    {correctAnswer}
                                </h1>
                                <ShareButton
                                    correctAnswer={correctAnswer}
                                    guessCount={6 - remainingGuesses}
                                    pixelatedImageSrc={
                                        dailyImage?.file_name || ''
                                    }
                                />
                            </>
                        ) : (
                            showGuessText && (
                                <div
                                    className={`${proximaNovaBold.className} text-4xl font-bold tracking-wider ${
                                        gameWon
                                            ? 'text-green-500'
                                            : 'text-black'
                                    } ${isAnimating && !gameWon ? 'shake-animation fade-out-animation' : ''}`}
                                >
                                    {gameWon && !todayCompleted
                                        ? correctAnswer
                                        : currentGuess}
                                </div>
                            )
                        )}
                    </div>

                    {/* Virtual Keyboard */}
                    <OnScreenKeyboard
                        onKeyPress={handleKeyPress}
                        className='pb-4'
                    />
                </div>
            </div>

            {/* Stats Modal */}
            {showStats && (
                <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
                    <div className='relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white'>
                        {/* Close button */}
                        <button
                            onClick={() => setShowStats(false)}
                            className='absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200'
                            aria-label='Close Statistics'
                        >
                            <svg
                                className='h-4 w-4 text-gray-600'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M6 18L18 6M6 6l12 12'
                                />
                            </svg>
                        </button>

                        {/* Stats Component */}
                        <UserStats
                            stats={stats}
                            isLoaded={statsLoaded}
                            className='border-0 shadow-none'
                        />
                    </div>
                </div>
            )}

            {/* Help Modal */}
            {showHelp && (
                <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-20'>
                    <div className='relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white'>
                        <h1
                            className={`${proximaNovaBold.className} text-2xl uppercase`}
                        >
                            How to play
                        </h1>
                        <p className='text-xl'>Guess the Idol in 6 tries!</p>
                        {/* Close button */}
                        <button
                            onClick={() => setShowHelp(false)}
                            className='absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200'
                            aria-label='Close Statistics'
                        >
                            <svg
                                className='h-4 w-4 text-gray-600'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M6 18L18 6M6 6l12 12'
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Confetti */}
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

export function StatsIcon() {
    return (
        <svg
            className='h-5 w-5 text-gray-800'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
        >
            <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
            />
        </svg>
    )
}

export function HelpIcon() {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5 text-gray-800'
            viewBox='0 0 15 15'
        >
            <path
                fill='currentColor'
                fillRule='evenodd'
                d='M.877 7.5a6.623 6.623 0 1 1 13.246 0a6.623 6.623 0 0 1-13.246 0M7.5 1.827a5.673 5.673 0 1 0 0 11.346a5.673 5.673 0 0 0 0-11.346m.75 8.673a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0m-2.2-4.25c0-.678.585-1.325 1.45-1.325s1.45.647 1.45 1.325c0 .491-.27.742-.736 1.025l-.176.104a5 5 0 0 0-.564.36c-.242.188-.524.493-.524.961a.55.55 0 0 0 1.1.004a.4.4 0 0 1 .1-.098c.102-.079.215-.144.366-.232q.116-.067.27-.159c.534-.325 1.264-.861 1.264-1.965c0-1.322-1.115-2.425-2.55-2.425S4.95 4.928 4.95 6.25a.55.55 0 0 0 1.1 0'
                clipRule='evenodd'
            />
        </svg>
    )
}
