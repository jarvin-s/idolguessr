'use client'

import { DailyImage, getDailyImage } from '@/lib/supabase'
import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import PixelatedImage from '@/components/PixelatedImage'
import OnScreenKeyboard from '@/components/OnScreenKeyboard'

export default function Home() {
    const [currentGuess, setCurrentGuess] = useState('')
    const [dailyImage, setDailyImage] = useState<DailyImage | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [pixelationLevel, setPixelationLevel] = useState(6) // Start with heavy pixelation
    const timer = '18:36:05'

    const handleKeyPress = useCallback(
        (key: string) => {
            if (key === 'ENTER') {
                console.log('Enter pressed, current guess:', currentGuess)
            } else if (key === '✕') {
                setCurrentGuess((prev) => prev.slice(0, -1))
            } else {
                setCurrentGuess((prev) => prev + key)
            }
        },
        [currentGuess]
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

        return () => {
            window.removeEventListener('keydown', handlePhysicalKeyPress)
        }
    }, [handleKeyPress])

    useEffect(() => {
        const fetchDailyImage = async () => {
            setIsLoading(true)
            try {
                const image = await getDailyImage()
                setDailyImage(image)
            } catch (error) {
                console.error('Failed to fetch daily image:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchDailyImage()
    }, [])

    return (
        <div className='flex h-screen flex-col overflow-hidden bg-white'>
            {/* Header */}
            <div className='mb-2 flex w-full flex-shrink-0 items-center justify-between p-4'>
                {/* Logo */}
                <div className='flex items-center'>
                    <Image
                        src='/images/idolguessr-logo.png'
                        alt='IdolGuessr Logo'
                        width={150}
                        height={50}
                        className='h-12 w-auto'
                    />
                </div>

                {/* Timer */}
                <div className='flex flex-col items-end justify-end text-right'>
                    <div className='mb-[-5px] text-sm font-medium text-gray-400'>
                        NEXT IDOL
                    </div>
                    <div className='font-mono text-2xl font-bold text-black'>
                        {timer}
                    </div>
                </div>
            </div>

            {/* Main Game Area */}
            <div className='flex w-full flex-1 flex-col px-4'>
                <div className='flex w-full flex-col items-center'>
                    {/* Pixelated Image */}
                    <div className='relative mb-3 w-full max-w-sm'>
                        <div className='flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg'>
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
                                    width={350}
                                    height={350}
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

                    {/* Pixelation Level Controls */}
                    <div className='mb-3 flex w-full max-w-sm items-center justify-center gap-2'>
                        <span className='text-sm font-medium text-gray-600'>
                            Pixelation:
                        </span>
                        <div className='flex gap-1'>
                            {[1, 2, 3, 4, 5, 6].map((level) => (
                                <button
                                    key={level}
                                    className={`h-8 w-8 rounded text-xs font-medium transition-colors ${
                                        pixelationLevel === level
                                            ? 'bg-black text-white'
                                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                    }`}
                                    onClick={() => setPixelationLevel(level)}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Guess Indicators */}
                    <div className='grid w-full max-w-sm grid-cols-6 gap-2'>
                        <div className='flex aspect-square items-center justify-center rounded-[5px] bg-black'>
                            <span className='text-base font-bold text-white'>
                                ✕
                            </span>
                        </div>
                        <div className='flex aspect-square items-center justify-center rounded-[5px] bg-black'>
                            <span className='text-base font-bold text-white'>
                                ✕
                            </span>
                        </div>
                        <div className='flex aspect-square items-center justify-center rounded-[5px] bg-black'>
                            <span className='text-base font-bold text-white'>
                                ✕
                            </span>
                        </div>
                        <div
                            className='aspect-square rounded-[5px]'
                            style={{ backgroundColor: '#93DF84' }}
                        ></div>
                        <div
                            className='aspect-square rounded-[5px]'
                            style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                        ></div>
                        <div
                            className='aspect-square rounded-[5px]'
                            style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                        ></div>
                    </div>
                </div>

                {/* Current Guess - Takes remaining space */}
                <div className='flex flex-1 items-center justify-center'>
                    <div className='text-4xl font-bold tracking-wider text-black'>
                        {currentGuess}
                    </div>
                </div>

                {/* Virtual Keyboard */}
                <OnScreenKeyboard
                    onKeyPress={handleKeyPress}
                    className='pb-4'
                />
            </div>
        </div>
    )
}
