import { DailyCompletion } from './UserStats'
import { getImageUrl } from '@/lib/supabase'
import StreakPopup from './StreakPopup'
import GameOverModal from './GameOverModal'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface GameImageProps {
    isLoading: boolean
    dailyImage: {
        group_type: string
        img_bucket: string
        group_category?: string
        base64_group?: string
        base64_idol?: string
    } | null
    remainingGuesses: number
    currentGuess: string
    lastIncorrectGuess: string
    correctAnswer: string
    gameWon: boolean
    gameLost: boolean
    todayCompleted: boolean
    todayCompletionData: DailyCompletion | null
    isAnimating: boolean
    gameMode: 'daily' | 'unlimited'
    onPass?: () => void
    skipsRemaining?: number
    showStreakPopup?: boolean
    streakMilestone?: number
    onStreakPopupComplete?: () => void
    currentStreak?: number
    showGameOver?: boolean
    highestStreak?: number
    onPlayAgain?: () => void
}

export default function GameImage({
    isLoading,
    dailyImage,
    remainingGuesses,
    currentGuess,
    lastIncorrectGuess,
    correctAnswer,
    gameWon,
    gameLost,
    todayCompleted,
    todayCompletionData,
    isAnimating,
    gameMode,
    onPass,
    skipsRemaining = 3,
    showStreakPopup,
    streakMilestone,
    onStreakPopupComplete,
    currentStreak = 0,
    showGameOver = false,
    highestStreak = 0,
    onPlayAgain,
}: GameImageProps) {
    const [isEntering, setIsEntering] = useState(false)
    const [showMinusOne, setShowMinusOne] = useState(false)

    useEffect(() => {
        // Trigger entering animation when idol changes
        if (dailyImage?.img_bucket) {
            setIsEntering(true)
            const timer = setTimeout(() => setIsEntering(false), 50)
            return () => clearTimeout(timer)
        }
    }, [dailyImage?.img_bucket])

    const truncateText = (text: string, maxLength: number = 20) => {
        return text.length > maxLength ? text.slice(0, maxLength) : text
    }

    const getImageNumber = (): number | 'clear' => {
        if (
            gameWon ||
            gameLost ||
            remainingGuesses === 0 ||
            remainingGuesses === 1
        ) {
            return 'clear'
        }

        if (remainingGuesses === 6) return 1
        if (remainingGuesses === 5) return 2
        if (remainingGuesses === 4) return 3
        if (remainingGuesses === 3) return 4
        if (remainingGuesses === 2) return 5

        return 1
    }

    const imageNumber = getImageNumber()

    // Safety check: In unlimited mode, verify we have all required fields
    const hasValidData = 
        !dailyImage || 
        gameMode === 'daily' || 
        (dailyImage.group_category && dailyImage.base64_group)

    // Emergency recovery: Notify parent to reload from saved state
    useEffect(() => {
        if (!hasValidData && dailyImage && gameMode === 'unlimited') {
            console.error('[GameImage] CRITICAL: Invalid data detected! Will trigger emergency recovery...', {
                gameMode,
                img_bucket: dailyImage.img_bucket,
                group_category: dailyImage.group_category,
                base64_group: dailyImage.base64_group,
            })
            
            // Trigger a custom event that parent can listen to
            const emergencyTimer = setTimeout(() => {
                if (!hasValidData && dailyImage && gameMode === 'unlimited') {
                    console.error('[GameImage] Triggering emergency recovery event')
                    window.dispatchEvent(new CustomEvent('idol-guessr-emergency-recovery'))
                }
            }, 500) // Quick recovery - 500ms
            
            return () => clearTimeout(emergencyTimer)
        }
    }, [hasValidData, dailyImage, gameMode])

    // Generate all image URLs for preloading and layering
    const allImageUrls = dailyImage && hasValidData
        ? [1, 2, 3, 4, 5, 'clear'].map((num) =>
              getImageUrl(
                  dailyImage.group_type,
                  dailyImage.img_bucket,
                  num as number | 'clear',
                  gameMode,
                  dailyImage.group_category,
                  dailyImage.base64_group
              )
          )
        : []

    return (
        <div className='relative mb-3 min-h-0 w-full flex-1 sm:mx-auto sm:max-w-md'>
            <div className='relative h-full w-full overflow-hidden rounded-lg'>
                {isLoading || !hasValidData ? (
                    <div className='flex h-full w-full items-center justify-center'>
                        <div className='text-gray-400'>Loading...</div>
                    </div>
                ) : dailyImage ? (
                    <div 
                        className='absolute inset-0 transition-transform duration-[1500ms] ease-out'
                        style={{
                            transform: isEntering ? 'translateY(-100%)' : 'translateY(0)',
                            zIndex: isEntering ? 100 : 10,
                        }}
                        key={dailyImage.img_bucket}
                    >
                        {/* Layer all 6 images on top of each other */}
                        {allImageUrls.map((url, index) => {
                            const imageNum =
                                index === 5 ? 'clear' : (index + 1)
                            const isVisible = imageNumber === imageNum
                            
                            // Determine if this image is "ahead" or "behind" the current one
                            const currentIndex = typeof imageNumber === 'number' ? imageNumber - 1 : 5
                            const isPastImage = index < currentIndex // Already swiped left
                            
                            return (
                                <div
                                    key={url}
                                    className='absolute inset-0 overflow-hidden rounded-lg transition-all duration-500 ease-out'
                                    style={{
                                        opacity: isVisible ? 1 : 0,
                                        transform: isVisible
                                            ? 'translateX(0) rotate(0deg)'
                                            : isPastImage
                                              ? 'translateX(-150%) rotate(-15deg)'
                                              : 'translateX(150%) rotate(15deg)',
                                        pointerEvents: isVisible
                                            ? 'auto'
                                            : 'none',
                                    }}
                                >
                                    <Image
                                        src={url}
                                        alt='Daily idol'
                                        width={600}
                                        height={600}
                                        className='rounded-lg object-cover'
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                        }}
                                        unoptimized
                                        priority={index === 0} // Prioritize first image
                                    />
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className='flex h-full w-full items-center justify-center'>
                        <div className='text-gray-400'>No image available</div>
                    </div>
                )}

                {gameMode === 'unlimited' && !gameWon && !gameLost && (
                    <>
                        {currentStreak >= 5 && (
                            <div className='absolute top-3 left-3 z-10 flex items-center gap-1.5'>
                                <span className='text-2xl'>🔥</span>
                                <span
                                    className='text-2xl font-bold text-white'
                                    style={{
                                        textShadow:
                                            '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.5)',
                                    }}
                                >
                                    {currentStreak}
                                </span>
                            </div>
                        )}
                        {onPass && (
                            <div className='absolute top-3 right-3 z-10'>
                                <button
                                    onClick={() => {
                                        setShowMinusOne(true)
                                        setTimeout(() => setShowMinusOne(false), 1000)
                                        onPass()
                                    }}
                                    className='relative flex cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-black transition-transform hover:bg-gray-100 hover:scale-105 active:scale-95'
                                >
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        width='16'
                                        height='16'
                                        viewBox='0 0 512 512'
                                    >
                                        <path
                                            d='M64 64v384l277.3-192L64 64z'
                                            fill='currentColor'
                                        />
                                        <path
                                            d='M384 64h64v384h-64z'
                                            fill='currentColor'
                                        />
                                    </svg>
                                    SKIP ({skipsRemaining})
                                </button>
                                {showMinusOne && (
                                    <div
                                        className='pointer-events-none absolute right-1/2 top-0 translate-x-1/2 text-2xl font-bold text-red-500'
                                        style={{
                                            animation: 'float-up 1s ease-out forwards',
                                        }}
                                    >
                                        -1
                                    </div>
                                )}
                            </div>
                        )}
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

                {(todayCompleted &&
                    todayCompletionData &&
                    todayCompletionData.won) ||
                gameWon ? (
                    <div className='pointer-events-none absolute inset-0 z-[200] flex items-end justify-center pb-8'>
                        <div className='rounded-full bg-green-400 px-4 py-2 text-lg font-bold tracking-wider text-white'>
                            {truncateText(correctAnswer)}
                        </div>
                    </div>
                ) : (todayCompleted &&
                      todayCompletionData &&
                      !todayCompletionData.won) ||
                  gameLost ? (
                    <div className='pointer-events-none absolute inset-0 z-[200] flex items-end justify-center pb-8'>
                        <div className='rounded-full bg-red-500 px-4 py-2 text-lg font-bold tracking-wider text-white'>
                            {truncateText(correctAnswer)}
                        </div>
                    </div>
                ) : (
                    <div className='pointer-events-none absolute inset-0 z-[200] flex items-end justify-center pb-8'>
                        <div
                            className={`rounded-full bg-black px-4 py-2 font-bold tracking-wider ${
                                lastIncorrectGuess || currentGuess
                                    ? 'text-lg'
                                    : 'text-base'
                            } ${
                                lastIncorrectGuess
                                    ? 'text-red-500'
                                    : currentGuess
                                      ? 'text-white'
                                      : ''
                            } ${isAnimating && !gameWon ? 'shake-animation' : ''}`}
                            style={
                                !lastIncorrectGuess && !currentGuess
                                    ? { color: '#FFFFFF50' }
                                    : undefined
                            }
                        >
                            {lastIncorrectGuess
                                ? truncateText(lastIncorrectGuess)
                                : currentGuess
                                  ? truncateText(currentGuess)
                                  : 'YOUR GUESS WILL APPEAR HERE!'}
                        </div>
                    </div>
                )}

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
