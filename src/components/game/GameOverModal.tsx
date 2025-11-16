'use client'

import { useEffect, useState } from 'react'

interface GameOverModalProps {
    isOpen: boolean
    highestStreak: number
    onPlayAgain: () => void
    onChangeFilters?: () => void
}

export default function GameOverModal({
    isOpen,
    highestStreak,
    onPlayAgain,
    onChangeFilters,
}: GameOverModalProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => setIsVisible(true), 100)
        } else {
            setIsVisible(false)
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div
            className={`pointer-events-none absolute inset-0 z-[250] flex items-center justify-center transition-opacity duration-300 ${
                isVisible ? 'opacity-100' : 'opacity-0'
            }`}
        >
            <div className='absolute inset-0 bg-black/70 backdrop-blur-md' />
            <div className='relative z-10 flex flex-col items-center gap-6 px-8'>
                <div className='text-center'>
                    <h2 className='mb-4 text-5xl font-black text-white uppercase'>
                        Game Over
                    </h2>
                    <p className='text-2xl font-semibold text-white/90'>
                        Your streak:{' '}
                        <span className='font-black text-white'>
                            {highestStreak} 🔥
                        </span>
                    </p>
                </div>
                <div className='flex flex-col gap-3'>
                    <button
                        onClick={onPlayAgain}
                        className='pointer-events-auto cursor-pointer rounded-full bg-black px-4 py-2 text-lg font-bold text-white transition-all hover:bg-black/80'
                    >
                        PLAY AGAIN
                    </button>
                    {onChangeFilters && (
                        <button
                            onClick={onChangeFilters}
                            className='pointer-events-auto cursor-pointer rounded-full border-2 border-white px-4 py-2 text-lg font-bold text-white transition-all hover:bg-white hover:text-black'
                        >
                            CHANGE FILTERS
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
