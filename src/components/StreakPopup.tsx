'use client'

import { useEffect, useState } from 'react'

interface StreakPopupProps {
    streak: number
    onComplete: () => void
}

export default function StreakPopup({ streak, onComplete }: StreakPopupProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100)

        const timer = setTimeout(() => {
            setIsVisible(false)
            setTimeout(onComplete, 300)
        }, 3000)

        return () => clearTimeout(timer)
    }, [onComplete])

    return (
        <div
            className={`pointer-events-none absolute top-3 left-3 z-50 flex items-center justify-center transition-opacity duration-300 ${
                isVisible ? 'opacity-100' : 'opacity-0'
            }`}
        >
            <div
                className={`transform transition-all duration-500 ${
                    isVisible ? 'scale-100' : 'scale-50'
                }`}
            >
                <div className='rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 px-4 py-3 shadow-2xl'>
                    <div className='flex items-center gap-2'>
                        <div className='text-2xl'>🔥</div>
                        <div className='flex flex-col'>
                            <div className='text-xl leading-none font-bold text-white'>
                                {streak}
                            </div>
                            <div className='text-xs leading-tight font-bold tracking-wider text-white uppercase'>
                                Streak
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
