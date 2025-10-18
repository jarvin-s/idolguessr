'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import localFont from 'next/font/local'
import ShareButton from '@/components/ShareButton'

const proximaNovaBold = localFont({
    src: '../../public/fonts/proximanova_bold.otf',
})

interface WinModalProps {
    isOpen: boolean
    onClose: () => void
    idolName: string
    imageUrl: string
    guessCount: number
    isWin: boolean
    stats: {
        gamesPlayed: number
        winPercentage: number
        currentStreak: number
        maxStreak: number
    }
    guessDistribution: number[]
}

export default function WinModal({
    isOpen,
    onClose,
    idolName,
    imageUrl,
    guessCount,
    isWin,
    stats,
    guessDistribution,
}: WinModalProps) {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!isOpen) return null

    const maxGuessCount = Math.max(...guessDistribution, 1)

    return (
        <div className='fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50'>
            {/* Modal Content */}
            <div
                className={`win-modal-slide relative w-full max-w-md bg-white shadow-xl sm:my-8 sm:rounded-2xl ${
                    isOpen ? 'win-modal-slide-in' : ''
                }`}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className='absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200'
                    aria-label='Close'
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

                {/* Content Container */}
                <div className='flex flex-col items-center p-6'>
                    {/* Message */}
                    <h1 className={`${proximaNovaBold.className} mt-8 mb-1 text-3xl font-extrabold text-black`}>
                        {isWin ? 'GOOD JOB!' : 'NICE TRY!'}
                    </h1>
                    <p className='mb-6 text-base text-gray-700'>
                        {isWin ? (
                            <>
                                You guessed{' '}
                                <span className='font-bold text-green-500'>
                                    {idolName}
                                </span>{' '}
                                in {guessCount} {guessCount === 1 ? 'guess' : 'guesses'}!
                            </>
                        ) : (
                            <>
                                You failed to guess{' '}
                                <span className='font-bold text-red-500'>
                                    {idolName}
                                </span>
                            </>
                        )}
                    </p>

                    {/* Idol Image */}
                    <div className='mb-4 w-full overflow-hidden rounded-2xl'>
                        <div className='relative aspect-square w-full'>
                            <Image
                                src={imageUrl}
                                alt={idolName}
                                fill
                                className='object-cover'
                                sizes='(max-width: 448px) 100vw, 448px'
                            />
                        </div>
                    </div>

                    {/* Share Button */}
                    <ShareButton
                        correctAnswer={idolName}
                        guessCount={guessCount}
                        pixelatedImageSrc={imageUrl}
                        className='mb-4'
                    />

                    {/* Divider */}
                    <div className='mb-8 w-full border-t border-gray-200' />

                    {/* Statistics Section */}
                    <div className='mb-3 w-full'>
                        <h2 className='mb-4 text-center text-xl font-bold text-black'>
                            STATISTICS
                        </h2>

                        {/* Stats Grid */}
                        <div className='mb-3 grid grid-cols-4 gap-4 text-center'>
                            <div>
                                <div className='text-3xl font-bold text-gray-800'>
                                    {stats.gamesPlayed}
                                </div>
                                <div className='text-xs text-gray-500'>
                                    Played
                                </div>
                            </div>
                            <div>
                                <div className='text-3xl font-bold text-gray-800'>
                                    {stats.winPercentage}%
                                </div>
                                <div className='text-xs text-gray-500'>
                                    Win %
                                </div>
                            </div>
                            <div>
                                <div className='text-3xl font-bold text-gray-800'>
                                    {stats.currentStreak}
                                </div>
                                <div className='text-xs text-gray-500'>
                                    Current streak
                                </div>
                            </div>
                            <div>
                                <div className='text-3xl font-bold text-gray-800'>
                                    {stats.maxStreak}
                                </div>
                                <div className='text-xs text-gray-500'>
                                    Max streak
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Guess Distribution */}
                    <div className='w-full'>
                        <h2 className='mb-4 text-center text-xl font-bold text-black'>
                            GUESS DISTRIBUTION
                        </h2>

                        <div className='space-y-2'>
                            {guessDistribution.map((count, index) => {
                                const percentage =
                                    maxGuessCount > 0
                                        ? (count / maxGuessCount) * 100
                                        : 0
                                const isCurrentGuess = isWin && index + 1 === guessCount

                                return (
                                    <div
                                        key={index}
                                        className='flex items-center gap-2'
                                    >
                                        <div className='w-4 text-sm font-medium text-gray-600'>
                                            {index + 1}
                                        </div>
                                        <div className='relative h-8 flex-1 overflow-hidden rounded-md bg-gray-200'>
                                            <div
                                                className={`flex h-full items-center justify-end px-2 text-sm font-bold text-white transition-all duration-500 ${
                                                    isCurrentGuess
                                                        ? 'bg-green-500'
                                                        : 'bg-green-400'
                                                }`}
                                                style={{
                                                    width: `${Math.max(percentage, count > 0 ? 15 : 0)}%`,
                                                }}
                                            >
                                                {count > 0 && count}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

