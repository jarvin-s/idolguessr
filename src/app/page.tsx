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
    const [guesses, setGuesses] = useState<Array<'correct' | 'incorrect' | 'empty'>>(['empty', 'empty', 'empty', 'empty', 'empty', 'empty'])
    const [isAnimating, setIsAnimating] = useState(false)
    const [showGuessText, setShowGuessText] = useState(true)
    const timer = '18:36:05'
    const correctAnswer = 'WONYOUNG'

    const handleKeyPress = useCallback(
        (key: string) => {
            if (key === 'ENTER') {
                // Only process guess if we have a current guess and haven't used all attempts
                if (currentGuess.trim() && guesses.some(guess => guess === 'empty') && !isAnimating) {
                    const normalizedGuess = currentGuess.toUpperCase().trim()
                    const isCorrect = normalizedGuess === correctAnswer
                    
                    // Start animation
                    setIsAnimating(true)
                    
                    if (!isCorrect) {
                        // Wrong guess - let shake animation play first
                        
                        // After shake animation completes, start fade out and update square
                        setTimeout(() => {
                            setShowGuessText(false) // Start fade out
                            
                            const emptyIndex = guesses.findIndex(guess => guess === 'empty')
                            setGuesses(prev => {
                                const newGuesses = [...prev]
                                newGuesses[emptyIndex] = 'incorrect'
                                return newGuesses
                            })
                            
                            // Reset states after fade out completes
                            setTimeout(() => {
                                setCurrentGuess('')
                                setShowGuessText(true)
                                setIsAnimating(false)
                            }, 300) // Match fadeOut duration
                        }, 500) // Let shake animation complete first
                    } else {
                        // Correct guess - just update the square
                        const emptyIndex = guesses.findIndex(guess => guess === 'empty')
                        setGuesses(prev => {
                            const newGuesses = [...prev]
                            newGuesses[emptyIndex] = 'correct'
                            return newGuesses
                        })
                        
                        // Clear guess and reset animation state
                        setTimeout(() => {
                            setCurrentGuess('')
                            setIsAnimating(false)
                        }, 100)
                    }
                    
                    console.log('Guess submitted:', normalizedGuess, 'Correct:', isCorrect)
                }
            } else if (key === '✕') {
                setCurrentGuess((prev) => prev.slice(0, -1))
            } else {
                if (guesses.some(guess => guess === 'empty') && !isAnimating) {
                    setCurrentGuess((prev) => prev + key)
                }
            }
        },
        [currentGuess, guesses, correctAnswer, isAnimating]
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
            {/* Container that constrains width on larger screens */}
            <div className='mx-auto flex h-full w-full max-w-none flex-col sm:max-w-md sm:shadow-lg'>
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
                        <div className='aspect-square w-full overflow-hidden rounded-lg'>
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
                                    width={400}
                                    height={400}
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
                        {guesses.map((guess, index) => (
                            <div
                                key={index}
                                className={`flex aspect-square items-center justify-center rounded-[5px] transition-all duration-300 ${
                                    guess === 'correct'
                                        ? 'bg-green-400 square-pop-animation' // Green for correct
                                        : guess === 'incorrect'
                                        ? 'bg-black square-pop-animation' // Black for incorrect
                                        : 'bg-gray-200' // Gray for empty
                                }`}
                            >
                                {guess === 'incorrect' && (
                                    <span className='text-base font-bold text-white'>
                                        ✕
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Current Guess - Takes remaining space */}
                <div className='flex flex-1 items-center justify-center'>
                    {showGuessText && (
                        <div className={`text-4xl font-bold tracking-wider text-black ${
                            isAnimating ? 'shake-animation fade-out-animation' : ''
                        }`}>
                            {currentGuess}
                        </div>
                    )}
                </div>

                {/* Virtual Keyboard */}
                <OnScreenKeyboard
                    onKeyPress={handleKeyPress}
                    className='pb-4'
                />
                </div>
            </div>
        </div>
    )
}
