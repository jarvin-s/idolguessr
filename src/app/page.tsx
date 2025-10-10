'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function Home() {
    const [currentGuess, setCurrentGuess] = useState('')
    const timer = '18:36:05'

    const blurImageStyle = {
        filter: 'blur(20px) contrast(200%) brightness(1.2)',
        imageRendering: 'pixelated' as const,
        transform: 'scale(0.5)',
        transformOrigin: 'center',
    }

    const handleKeyPress = (key: string) => {
        if (key === 'ENTER') {
            // Handle enter logic here
            console.log('Enter pressed, current guess:', currentGuess)
        } else if (key === '✕') {
            // Handle backspace
            setCurrentGuess((prev) => prev.slice(0, -1))
        } else {
            // Handle letter input
            setCurrentGuess((prev) => prev + key)
        }
    }

    // Physical keyboard support
    useEffect(() => {
        const handlePhysicalKeyPress = (event: KeyboardEvent) => {
            const key = event.key.toUpperCase()

            // Prevent default behavior for keys we handle
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

        // Add event listener
        window.addEventListener('keydown', handlePhysicalKeyPress)

        // Cleanup
        return () => {
            window.removeEventListener('keydown', handlePhysicalKeyPress)
        }
    }, [currentGuess])

    return (
        <div className='flex h-screen flex-col overflow-hidden bg-white'>
            {/* Header */}
            <div className='mb-2 flex w-full flex-shrink-0 items-center justify-between p-3'>
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
                        <div className='flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-gray-200'>
                            <Image
                                src={'/idols/d29ueW91bmc-001.png'}
                                alt='Blurred idol'
                                width={400}
                                height={400}
                                className='h-full w-full object-cover'
                                style={blurImageStyle}
                            />
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
                <div className='w-full pb-4'>
                    {/* Top Row */}
                    <div className='mb-1 flex gap-1'>
                        {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map(
                            (key) => (
                                <button
                                    key={key}
                                    className='flex h-12 flex-1 items-center justify-center rounded bg-gray-300 text-sm font-semibold text-black transition-colors hover:bg-gray-400'
                                    onClick={() => handleKeyPress(key)}
                                >
                                    {key}
                                </button>
                            )
                        )}
                    </div>

                    {/* Middle Row */}
                    <div className='mb-1 flex justify-center gap-1'>
                        {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map(
                            (key) => (
                                <button
                                    key={key}
                                    className='flex h-12 w-8 items-center justify-center rounded bg-gray-300 text-sm font-semibold text-black transition-colors hover:bg-gray-400'
                                    onClick={() => handleKeyPress(key)}
                                >
                                    {key}
                                </button>
                            )
                        )}
                    </div>

                    {/* Bottom Row */}
                    <div className='flex gap-1'>
                        <button
                            className='flex h-12 flex-[1.5] items-center justify-center rounded bg-gray-300 text-sm font-semibold text-black transition-colors hover:bg-gray-400'
                            onClick={() => handleKeyPress('ENTER')}
                        >
                            ENTER
                        </button>
                        {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((key) => (
                            <button
                                key={key}
                                className='flex h-12 flex-1 items-center justify-center rounded bg-gray-300 text-sm font-semibold text-black transition-colors hover:bg-gray-400'
                                onClick={() => handleKeyPress(key)}
                            >
                                {key}
                            </button>
                        ))}
                        <button
                            className='flex h-12 flex-[1.2] items-center justify-center rounded bg-gray-300 text-sm font-bold text-black transition-colors hover:bg-gray-400'
                            onClick={() => handleKeyPress('✕')}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
