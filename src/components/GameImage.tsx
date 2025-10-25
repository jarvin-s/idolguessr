import PrePixelatedImage from './PrePixelatedImage'
import { DailyCompletion } from './UserStats'
import { getImageUrl } from '@/lib/supabase'

interface GameImageProps {
    isLoading: boolean
    dailyImage: { group_type: string; img_bucket: string } | null
    remainingGuesses: number
    currentGuess: string
    lastIncorrectGuess: string
    correctAnswer: string
    gameWon: boolean
    gameLost: boolean
    todayCompleted: boolean
    todayCompletionData: DailyCompletion | null
    isAnimating: boolean
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
}: GameImageProps) {
    // Truncate text to 20 characters
    const truncateText = (text: string, maxLength: number = 20) => {
        return text.length > maxLength ? text.slice(0, maxLength) : text
    }

    const getImageNumber = (): number | 'clear' => {
        if (gameWon || gameLost || remainingGuesses === 0 || remainingGuesses === 1) {
            return 'clear'
        }
        
        // Map remaining guesses to image numbers
        if (remainingGuesses === 6) return 1
        if (remainingGuesses === 5) return 2
        if (remainingGuesses === 4) return 3
        if (remainingGuesses === 3) return 4
        if (remainingGuesses === 2) return 5
        
        return 1 // Default
    }

    const imageNumber = getImageNumber()
    const imageUrl = dailyImage 
        ? getImageUrl(dailyImage.group_type, dailyImage.img_bucket, imageNumber)
        : ''

    return (
        <div className='relative mb-3 min-h-0 w-full flex-1 sm:mx-auto sm:max-w-md'>
            <div className='relative h-full w-full overflow-hidden rounded-lg'>
                {isLoading ? (
                    <div className='flex h-full w-full items-center justify-center'>
                        <div className='text-gray-400'>Loading...</div>
                    </div>
                ) : dailyImage ? (
                    <PrePixelatedImage
                        src={imageUrl}
                        alt='Daily idol'
                    />
                ) : (
                    <div className='flex h-full w-full items-center justify-center'>
                        <div className='text-gray-400'>No image available</div>
                    </div>
                )}

                {(todayCompleted && todayCompletionData && todayCompletionData.won) || gameWon ? (
                    <div className='pointer-events-none absolute inset-0 flex items-end justify-center pb-8'>
                        <div className='rounded-full bg-green-400 px-4 py-2 text-lg font-bold tracking-wider text-white'>
                            {truncateText(correctAnswer)}
                        </div>
                    </div>
                ) : (todayCompleted && todayCompletionData && !todayCompletionData.won) || gameLost ? (
                    <div className='pointer-events-none absolute inset-0 flex items-end justify-center pb-8'>
                        <div className='rounded-full bg-red-500 px-4 py-2 text-lg font-bold tracking-wider text-white'>
                            {truncateText(correctAnswer)}
                        </div>
                    </div>
                ) : (
                    <div className='pointer-events-none absolute inset-0 flex items-end justify-center pb-8'>
                        <div
                            className={`rounded-full bg-black px-4 py-2 font-bold tracking-wider ${
                                lastIncorrectGuess || currentGuess ? 'text-lg' : 'text-base'
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
            </div>
        </div>
    )
}
