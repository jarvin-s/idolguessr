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
                    className='opacity-40'
                    style={{
                        animation:
                            'number-pop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                        animationDelay: '0.2s',
                        opacity: 0,
                        fontSize: '15rem',
                    }}
                >
                    <FireIcon />
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
                        <FireIcon />
                    </div>
                ))}
            </div>
        </div>
    )
}

function FireIcon() {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width='1em'
            height='1em'
            viewBox='0 0 24 24'
        >
            <path
                fill='#e09200'
                d='M12.832 21.801c3.126-.626 7.168-2.875 7.168-8.69c0-5.291-3.873-8.815-6.658-10.434c-.619-.36-1.342.113-1.342.828v1.828c0 1.442-.606 4.074-2.29 5.169c-.86.559-1.79-.278-1.894-1.298l-.086-.838c-.1-.974-1.092-1.565-1.87-.971C4.461 8.46 3 10.33 3 13.11C3 20.221 8.289 22 10.933 22q.232 0 .484-.015c.446-.056 0 .099 1.415-.185'
            />
            <path
                fill='#faeb9f'
                d='M8 18.444c0 2.62 2.111 3.43 3.417 3.542c.446-.056 0 .099 1.415-.185C13.871 21.434 15 20.492 15 18.444c0-1.297-.819-2.098-1.46-2.473c-.196-.115-.424.03-.441.256c-.056.718-.746 1.29-1.215.744c-.415-.482-.59-1.187-.59-1.638v-.59c0-.354-.357-.59-.663-.408C9.495 15.008 8 16.395 8 18.445'
            />
        </svg>
    )
}
