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
                    <h2 className='mb-4 text-6xl font-black text-white uppercase'>
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
                        className='pointer-events-auto cursor-pointer rounded-xl bg-white px-6 py-3 text-lg font-bold text-black transition-transform hover:scale-105 active:scale-95'
                    >
                        PLAY AGAIN
                    </button>
                    {onChangeFilters && (
                        <button
                            onClick={onChangeFilters}
                            className='pointer-events-auto cursor-pointer rounded-xl px-6 py-3 text-lg font-bold text-white transition-transform hover:scale-105 active:scale-95'
                        >
                            CHANGE FILTERS
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
