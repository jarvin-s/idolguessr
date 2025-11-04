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
        }, 2000)
        return () => clearTimeout(timer)
    }, [onComplete])

    const fireEmojis = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 80 + 10}%`,
        delay: `${-Math.random() * 2.5}s`,
        rotation: Math.random() * 720 + 360,
        size: Math.random() * 2 + 2,
    }))

    return (
        <div
            className={`pointer-events-none absolute inset-0 z-[250] flex flex-col items-center justify-center transition-opacity duration-500 ${
                isVisible ? 'opacity-100' : 'opacity-0'
            }`}
        >
            <style jsx global>{`
                @keyframes number-pop {
                    0% {
                        transform: scale(0) rotate(-180deg);
                        opacity: 0;
                    }
                    60% {
                        transform: scale(1.2) rotate(10deg);
                        opacity: 1;
                    }
                    80% {
                        transform: scale(0.95) rotate(-5deg);
                    }
                    100% {
                        transform: scale(1) rotate(0deg);
                        opacity: 1;
                    }
                }
                @keyframes streak-bounce {
                    0% {
                        transform: translateY(20px) scale(0.8);
                        opacity: 0;
                    }
                    40% {
                        transform: translateY(-10px) scale(1.1);
                        opacity: 1;
                    }
                    60% {
                        transform: translateY(5px) scale(0.95);
                    }
                    80% {
                        transform: translateY(-3px) scale(1.02);
                    }
                    100% {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                }
                @keyframes rain-down {
                    0% {
                        transform: translateY(-150px) scale(0.5) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) scale(1)
                            rotate(var(--rotation-end));
                        opacity: 0.5;
                    }
                }
            `}</style>

            <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' />

            <div className='relative z-10 flex items-center justify-center'>
                <div
                    className='text-[15rem] opacity-40'
                    style={{
                        animation:
                            'number-pop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                        animationDelay: '0.2s',
                        opacity: 0,
                    }}
                >
                    🔥
                </div>
                <div className='absolute flex flex-col items-center gap-0'>
                    <div
                        className='text-9xl leading-none font-black text-white'
                        style={{
                            animation:
                                'number-pop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                            animationDelay: '0.3s',
                            opacity: 0,
                            textShadow:
                                '0 4px 20px rgba(0, 0, 0, 0.8), 0 2px 8px rgba(0, 0, 0, 0.9)',
                        }}
                    >
                        {streak}
                    </div>
                    <div
                        className='text-5xl leading-none font-black tracking-wider text-white uppercase'
                        style={{
                            animation:
                                'streak-bounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                            animationDelay: '0.6s',
                            opacity: 0,
                            textShadow:
                                '0 4px 20px rgba(0, 0, 0, 0.8), 0 2px 8px rgba(0, 0, 0, 0.9)',
                        }}
                    >
                        Streak!
                    </div>
                </div>
            </div>

            <div className='absolute inset-0 overflow-hidden'>
                {fireEmojis.map((emoji) => (
                    <div
                        key={emoji.id}
                        className='absolute top-0'
                        style={{
                            left: emoji.left,
                            fontSize: `${emoji.size}rem`,
                            animation: 'rain-down 2.5s linear infinite',
                            animationDelay: emoji.delay,
                            // @ts-expect-error - CSS custom property
                            '--rotation-end': `${emoji.rotation}deg`,
                        }}
                    >
                        🔥
                    </div>
                ))}
            </div>
        </div>
    )
}
