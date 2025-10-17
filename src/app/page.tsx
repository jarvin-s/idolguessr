'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Confetti from 'react-confetti'
import PixelatedImage from '@/components/PixelatedImage'
import OnScreenKeyboard from '@/components/OnScreenKeyboard'
import UserStats from '@/components/UserStats'
import {
    getDailyImage,
    insertNewFeedback,
    type DailyImage as DailyRow,
} from '@/lib/supabase'
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
    const [showFeedback, setShowFeedback] = useState(false)
    const [feedbackForm, setFeedbackForm] = useState({
        name: '',
        category: 'general',
        message: '',
    })
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
    }, [clearTimers, setGuesses, setGameWon, scheduleCountdownAndFlip])

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

    const handleFeedbackSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault()
            if (!feedbackForm.name.trim() || !feedbackForm.message.trim())
                return

            setIsSubmittingFeedback(true)
            try {
                await insertNewFeedback({
                    id: 0,
                    message: feedbackForm.message.trim(),
                    category: feedbackForm.category,
                })
                setFeedbackSubmitted(true)
                setTimeout(() => {
                    setFeedbackForm({
                        name: '',
                        category: 'general',
                        message: '',
                    })
                    setFeedbackSubmitted(false)
                    setShowFeedback(false)
                }, 2000)
            } catch (error) {
                console.error('Error submitting feedback:', error)
            } finally {
                setIsSubmittingFeedback(false)
            }
        },
        [feedbackForm]
    )

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

    return (
        <div className='fixed inset-0 flex flex-col overflow-hidden bg-white'>
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
                <div className='flex min-h-0 w-full flex-1 flex-col px-4'>
                    <div className='flex min-h-0 w-full flex-1 flex-col items-center'>
                        <div className='relative mb-3 min-h-0 w-full flex-1 sm:mx-auto sm:max-w-md'>
                            <div className='relative h-full w-full overflow-hidden rounded-lg'>
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

                                {todayCompleted && todayCompletionData ? (
                                    <div className='absolute inset-0 flex items-center justify-center'>
                                        <h1 className='text-4xl font-bold tracking-wider text-green-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'>
                                            {correctAnswer}
                                        </h1>
                                    </div>
                                ) : (
                                    showGuessText && (
                                        <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
                                            <div
                                                className={`text-4xl font-bold tracking-wider ${
                                                    gameWon
                                                        ? 'text-green-500'
                                                        : 'text-white'
                                                } drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${isAnimating && !gameWon ? 'shake-animation fade-out-animation' : ''}`}
                                            >
                                                {gameWon && !todayCompleted
                                                    ? correctAnswer
                                                    : currentGuess}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Guess Indicators */}
                        <div className='mb-3 grid w-full flex-shrink-0 grid-cols-6 gap-2 sm:mx-auto sm:max-w-md'>
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

                    {/* Virtual Keyboard */}
                    <OnScreenKeyboard
                        onKeyPress={handleKeyPress}
                        className='flex-shrink-0 pb-4'
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
                <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
                    <div className='relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-10'>
                        <h1
                            className={`${proximaNovaBold.className} text-3xl uppercase`}
                        >
                            How to play
                        </h1>
                        <p className='text-xl'>Guess the Idol in 6 tries!</p>

                        <ul className='mt-4 space-y-2 font-bold'>
                            <li className='flex items-start gap-2 text-[16px]'>
                                <span>•</span>
                                <span>
                                    Each guess must be a valid K-pop idol name
                                </span>
                            </li>
                            <li className='flex items-start gap-2 text-[16px]'>
                                <span>•</span>
                                <span>
                                    The image will become clearer with each
                                    wrong guess
                                </span>
                            </li>
                        </ul>
                        <div className='mt-6 grid grid-cols-3 gap-2'>
                            <div className='flex flex-col gap-2'>
                                <div
                                    className='aspect-square w-full rounded bg-gray-100'
                                    style={{
                                        backgroundImage: `url('/images/how-to-play-1.png')`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                />
                                <div className='flex h-6 w-6 items-center justify-center rounded bg-black'>
                                    <span className='text-[10px] font-bold text-white'>
                                        ✕
                                    </span>
                                </div>
                            </div>
                            <div className='flex flex-col gap-2'>
                                <div
                                    className='aspect-square w-full rounded bg-gray-100'
                                    style={{
                                        backgroundImage: `url('/images/how-to-play-2.png')`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                />
                                <div className='flex gap-1'>
                                    <div className='flex h-6 w-6 items-center justify-center rounded bg-black'>
                                        <span className='text-[10px] font-bold text-white'>
                                            ✕
                                        </span>
                                    </div>
                                    <div className='flex h-6 w-6 items-center justify-center rounded bg-black'>
                                        <span className='text-[10px] font-bold text-white'>
                                            ✕
                                        </span>
                                    </div>
                                    <div className='flex h-6 w-6 items-center justify-center rounded bg-black'>
                                        <span className='text-[10px] font-bold text-white'>
                                            ✕
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className='flex flex-col gap-2'>
                                <div
                                    className='aspect-square w-full rounded bg-gray-100'
                                    style={{
                                        backgroundImage: `url('/images/how-to-play-3.png')`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                />
                                <div className='h-6 w-6 rounded bg-green-400' />
                            </div>
                        </div>

                        <p className='mt-6 text-[16px]'>
                            Every day at midnight a new idol appears.
                        </p>

                        <button
                            onClick={() => {
                                setShowFeedback(true)
                                setShowHelp(false)
                            }}
                            className='mt-6 w-full rounded bg-black px-4 py-2 text-white'
                        >
                            Submit feedback
                        </button>

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

            {/* Feedback Modal */}
            {showFeedback && (
                <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
                    <div className='relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6'>
                        <div className='mb-6 flex items-center justify-between'>
                            <button
                                onClick={() => {
                                    setShowFeedback(false)
                                    setShowHelp(true)
                                }}
                                className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200'
                            >
                                <ArrowLeftIcon />
                            </button>
                            <button
                                onClick={() => setShowFeedback(false)}
                                className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200'
                                aria-label='Close Feedback'
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

                        {feedbackSubmitted ? (
                            <div className='text-center'>
                                <div className='mb-4 text-6xl'>✅</div>
                                <h1
                                    className={`${proximaNovaBold.className} text-2xl text-green-600 uppercase`}
                                >
                                    Thank you!
                                </h1>
                                <p className='mt-2 text-gray-600'>
                                    Your feedback has been submitted
                                    successfully.
                                </p>
                            </div>
                        ) : (
                            <>
                                <h1
                                    className={`${proximaNovaBold.className} text-2xl uppercase`}
                                >
                                    Submit your feedback
                                </h1>
                                <p className='mt-2 text-gray-600'>
                                    We&apos;re always looking for ways to
                                    improve the game. Please share your thoughts
                                    with us.
                                </p>

                                <form
                                    onSubmit={handleFeedbackSubmit}
                                    className='mt-6 space-y-4'
                                >
                                    <div>
                                        <label
                                            htmlFor='feedback-category'
                                            className='mb-1 block text-sm font-medium text-gray-700'
                                        >
                                            Category
                                        </label>
                                        <select
                                            id='feedback-category'
                                            value={feedbackForm.category}
                                            onChange={(e) =>
                                                setFeedbackForm((prev) => ({
                                                    ...prev,
                                                    category: e.target.value,
                                                }))
                                            }
                                            className='w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-black focus:outline-none'
                                        >
                                            <option value='general'>
                                                General
                                            </option>
                                            <option value='bug'>
                                                Bug Report
                                            </option>
                                            <option value='feature'>
                                                Feature Request
                                            </option>
                                            <option value='improvement'>
                                                Improvement
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor='feedback-message'
                                            className='mb-1 block text-sm font-medium text-gray-700'
                                        >
                                            Message *
                                        </label>
                                        <textarea
                                            id='feedback-message'
                                            value={feedbackForm.message}
                                            onChange={(e) =>
                                                setFeedbackForm((prev) => ({
                                                    ...prev,
                                                    message: e.target.value,
                                                }))
                                            }
                                            rows={4}
                                            className='w-full resize-none rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-black focus:outline-none'
                                            placeholder='Tell us what you think...'
                                            required
                                        />
                                    </div>

                                    <button
                                        type='submit'
                                        disabled={
                                            isSubmittingFeedback ||
                                            !feedbackForm.message.trim()
                                        }
                                        className='w-full cursor-pointer rounded-md bg-black px-4 py-2 font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400'
                                    >
                                        {isSubmittingFeedback
                                            ? 'Submitting...'
                                            : 'Submit feedback'}
                                    </button>
                                </form>
                            </>
                        )}
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
            className='h-5 w-5 text-gray-600'
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
            className='h-5 w-5 text-gray-600'
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

export function ArrowLeftIcon() {
    return (
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
                d='M10 19l-7-7m0 0l7-7m-7 7h18'
            />
        </svg>
    )
}
