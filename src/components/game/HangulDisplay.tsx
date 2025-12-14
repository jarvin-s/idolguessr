import { getHangulImageUrl } from '@/lib/supabase'
import StreakPopup from './StreakPopup'
import GameOverModal from './GameOverModal'
import Image from 'next/image'
import { useEffect, useState, useRef } from 'react'

interface HangulDisplayProps {
    isLoading: boolean
    hangulName: string
    hangulImage: {
        group_type: string
        img_bucket: string
        group_category?: string
        base64_group?: string
        base64_idol?: string
        group_name?: string
    } | null
    remainingGuesses: number
    gameWon: boolean
    gameLost: boolean
    imageRevealed: boolean
    onRevealImage: () => void
    onPass?: () => void
    skipsRemaining?: number
    showStreakPopup?: boolean
    streakMilestone?: number
    onStreakPopupComplete?: () => void
    showGameOver?: boolean
    highestStreak?: number
    onPlayAgain?: () => void
    guesses?: Array<'empty' | 'correct' | 'incorrect'>
}

export default function HangulDisplay({
    isLoading,
    hangulName,
    hangulImage,
    remainingGuesses,
    gameWon,
    gameLost,
    imageRevealed,
    onRevealImage,
    onPass,
    skipsRemaining = 3,
    showStreakPopup,
    streakMilestone,
    onStreakPopupComplete,
    showGameOver = false,
    highestStreak = 0,
    onPlayAgain,
    guesses = [],
}: HangulDisplayProps) {
    const [isEntering, setIsEntering] = useState(false)
    const [showMinusOne, setShowMinusOne] = useState(false)

    const prevIdolBucketRef = useRef<string | null>(null)

    useEffect(() => {
        if (hangulImage?.img_bucket) {
            prevIdolBucketRef.current = hangulImage.img_bucket
            setIsEntering(true)
            const timer = setTimeout(() => setIsEntering(false), 50)
            return () => clearTimeout(timer)
        }
    }, [hangulImage?.img_bucket])

    // Check if image data is available (optional - game works without images)
    const hasImageData = hangulImage?.group_category && hangulImage?.base64_group && hangulImage?.img_bucket

    const clearImageUrl =
        hangulImage && hasImageData
            ? getHangulImageUrl(
                  hangulImage.group_category || '',
                  hangulImage.base64_group || '',
                  hangulImage.img_bucket,
                  'clear'
              )
            : ''

    // Determine if image should show (revealed by hint, game won, or game lost) AND image data exists
    const shouldShowImage = (imageRevealed || gameWon || gameLost) && hasImageData

    return (
        <div className='relative mb-3 min-h-0 w-full flex-1 sm:mx-auto sm:max-w-md'>
            <div className='relative h-full w-full overflow-hidden rounded-lg bg-gradient-to-br from-purple-500 to-pink-700'>
                {isLoading ? (
                    <div className='flex h-full w-full items-center justify-center'>
                        <div className='text-gray-400'>Loading...</div>
                    </div>
                ) : hangulImage ? (
                    <div
                        className='absolute inset-0 flex flex-col items-center justify-center transition-transform duration-[1500ms] ease-out'
                        style={{
                            transform: isEntering
                                ? 'translateY(-100%)'
                                : 'translateY(0)',
                            zIndex: isEntering ? 100 : 10,
                        }}
                        key={hangulImage.img_bucket}
                    >
                        {/* Hangul Name Display */}
                        {!shouldShowImage && (
                            <div className='flex flex-col items-center justify-center px-4'>
                                <h1
                                    className='text-center font-bold text-[#f3f3f3] select-none'
                                    style={{
                                        fontSize: 'clamp(3rem, 12vw, 7rem)',
                                        wordBreak: 'keep-all',
                                    }}
                                >
                                    {hangulName}
                                </h1>
                            </div>
                        )}

                        {/* Image Display (when revealed) */}
                        {shouldShowImage && clearImageUrl && (
                            <div className='absolute inset-0 overflow-hidden rounded-lg'>
                                <Image
                                    src={clearImageUrl}
                                    alt='Idol'
                                    width={600}
                                    height={600}
                                    className='pointer-events-none rounded-lg object-cover'
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                    }}
                                    unoptimized
                                    priority
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className='flex h-full w-full items-center justify-center'>
                        <div className='text-gray-400'>No data available</div>
                    </div>
                )}

                {/* Hint and Skip buttons */}
                {!gameWon && !gameLost && (
                    <>
                        <div className='absolute top-3 left-3 z-10 flex items-center gap-2'>
                            <button
                                onClick={() => {
                                    if (!imageRevealed && hasImageData) {
                                        onRevealImage()
                                    }
                                }}
                                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all md:text-sm ${
                                    imageRevealed || !hasImageData
                                        ? 'cursor-not-allowed bg-gray-200 text-gray-500'
                                        : 'text-black hover:scale-105 active:scale-95'
                                }`}
                                style={{
                                    backgroundColor: imageRevealed || !hasImageData
                                        ? 'rgb(229, 229, 229)'
                                        : 'rgb(255, 249, 127)',
                                    border: '1px solid #00000012',
                                    cursor: imageRevealed || !hasImageData
                                        ? 'not-allowed'
                                        : 'pointer',
                                }}
                                disabled={imageRevealed || !hasImageData}
                            >
                                <ImageIcon />
                                {!hasImageData
                                    ? 'NO IMAGE'
                                    : imageRevealed
                                        ? 'IMAGE REVEALED'
                                        : 'REVEAL IMAGE'}
                            </button>
                        </div>
                        <div className='absolute top-3 right-3 z-10'>
                            <button
                                onClick={() => {
                                    if (skipsRemaining > 0 && onPass) {
                                        setShowMinusOne(true)
                                        setTimeout(
                                            () => setShowMinusOne(false),
                                            1000
                                        )
                                        onPass()
                                    }
                                }}
                                className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-transform md:text-sm ${
                                    skipsRemaining === 0
                                        ? 'cursor-not-allowed bg-gray-200 text-gray-500'
                                        : 'cursor-pointer bg-white text-black hover:scale-105 hover:bg-gray-100 active:scale-95'
                                }`}
                                style={{ border: '1px solid #00000012' }}
                                disabled={skipsRemaining === 0}
                            >
                                <SkipButton />
                                SKIP (
                                {skipsRemaining === 0 ? 0 : skipsRemaining})
                            </button>
                            {showMinusOne && (
                                <div
                                    className='pointer-events-none absolute top-0 right-1/2 translate-x-1/2 text-2xl font-bold text-red-500'
                                    style={{
                                        animation:
                                            'float-up 1s ease-out forwards',
                                    }}
                                >
                                    -1
                                </div>
                            )}
                        </div>
                    </>
                )}

                {showStreakPopup &&
                    streakMilestone &&
                    onStreakPopupComplete && (
                        <StreakPopup
                            streak={streakMilestone}
                            onComplete={onStreakPopupComplete}
                        />
                    )}

                {/* Guess Progress Bar */}
                <div className='pointer-events-none absolute inset-0 z-[200] mb-4 flex items-end justify-center px-4 md:px-10'>
                    <div className='flex h-12 w-full items-center justify-evenly rounded-lg bg-black'>
                        <h1 className='text-xl font-bold text-white uppercase'>
                            Guess {guesses.length - remainingGuesses}/{guesses.length}
                        </h1>
                        <div className='flex gap-2.5'>
                            {guesses.map((guess, index) => (
                                <div
                                    key={index}
                                    className={`h-4 w-4 rounded-full ${
                                        guess === 'correct'
                                            ? 'bg-green-400'
                                            : guess === 'incorrect'
                                              ? 'bg-red-400/75'
                                              : 'bg-white'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Game Over Modal */}
                {showGameOver && onPlayAgain && (
                    <GameOverModal
                        isOpen={showGameOver}
                        highestStreak={highestStreak}
                        onPlayAgain={onPlayAgain}
                    />
                )}
            </div>
        </div>
    )
}

function ImageIcon() {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
        >
            <rect x='3' y='3' width='18' height='18' rx='2' ry='2' />
            <circle cx='8.5' cy='8.5' r='1.5' />
            <polyline points='21 15 16 10 5 21' />
        </svg>
    )
}

function SkipButton() {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width='16'
            height='16'
            viewBox='0 0 512 512'
        >
            <path d='M64 64v384l277.3-192L64 64z' fill='currentColor' />
            <path d='M384 64h64v384h-64z' fill='currentColor' />
        </svg>
    )
}
