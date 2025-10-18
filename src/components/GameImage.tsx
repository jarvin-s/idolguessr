import PixelatedImage from './PixelatedImage'
import { DailyCompletion } from './UserStats'

interface GameImageProps {
    isLoading: boolean
    dailyImage: { file_name: string } | null
    pixelationLevel: number
    currentGuess: string
    correctAnswer: string
    gameWon: boolean
    todayCompleted: boolean
    todayCompletionData: DailyCompletion | null
    showGuessText: boolean
    isAnimating: boolean
}

export default function GameImage({
    isLoading,
    dailyImage,
    pixelationLevel,
    currentGuess,
    correctAnswer,
    gameWon,
    todayCompleted,
    todayCompletionData,
    showGuessText,
    isAnimating,
}: GameImageProps) {
    return (
        <div className='relative mb-3 min-h-0 w-full flex-1 sm:mx-auto sm:max-w-md'>
            <div className='relative h-full w-full overflow-hidden rounded-lg'>
                {isLoading ? (
                    <div className='flex h-full w-full items-center justify-center'>
                        <div className='text-gray-400'>Loading...</div>
                    </div>
                ) : dailyImage ? (
                    <PixelatedImage
                        src={dailyImage.file_name}
                        alt='Daily idol'
                        width={600}
                        height={600}
                        pixelationLevel={pixelationLevel}
                    />
                ) : (
                    <div className='flex h-full w-full items-center justify-center'>
                        <div className='text-gray-400'>No image available</div>
                    </div>
                )}

                {todayCompleted && todayCompletionData ? (
                    <div className='absolute inset-0 flex items-center justify-center'>
                        <h1 className='text-4xl font-bold tracking-wider text-green-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'>
                            {correctAnswer}
                        </h1>
                    </div>
                ) : (
                    showGuessText && currentGuess && (
                        <div className='pointer-events-none absolute inset-0 flex items-end justify-center pb-8'>
                            <div
                                className={`rounded-full bg-black px-4 py-2 text-lg font-bold tracking-wider text-white ${isAnimating && !gameWon ? 'shake-animation fade-out-animation' : ''}`}
                            >
                                {gameWon && !todayCompleted
                                    ? correctAnswer
                                    : currentGuess}
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    )
}
