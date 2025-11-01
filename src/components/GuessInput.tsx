interface GuessInputProps {
    currentGuess: string
    correctAnswer?: string
    gameWon?: boolean
    gameLost?: boolean
    lastIncorrectGuess?: string
    isAnimating?: boolean
}

export default function GuessInput({
    currentGuess,
    correctAnswer = '',
    gameWon = false,
    gameLost = false,
    lastIncorrectGuess = '',
    isAnimating = false,
}: GuessInputProps) {
    const truncateText = (text: string, maxLength: number = 20) => {
        return text.length > maxLength ? text.slice(0, maxLength) : text
    }

    const getDisplayContent = () => {
        if (gameWon) {
            return {
                text: truncateText(correctAnswer),
                textColor: 'text-white',
                bgColor: 'bg-green-400',
            }
        }

        if (gameLost) {
            return {
                text: `Nice try! It was ${truncateText(correctAnswer)}`,
                textColor: 'text-white',
                bgColor: 'bg-red-400',
            }
        }

        if (lastIncorrectGuess) {
            return {
                text: truncateText(lastIncorrectGuess),
                textColor: 'text-white',
                bgColor: 'bg-red-400',
            }
        }

        if (currentGuess) {
            return {
                text: truncateText(currentGuess),
                textColor: 'text-black',
                bgColor: 'bg-gray-200',
            }
        }

        return {
            text: "WHAT'S YOUR GUESS?",
            textColor: 'text-black/30',
            bgColor: 'bg-gray-200',
        }
    }

    const display = getDisplayContent()

    return (
        <div
            className={`mb-3 w-full flex-shrink-0 rounded-md ${display.bgColor}`}
        >
            <div
                className={`flex items-center justify-center rounded-lg px-4 py-3 text-center font-bold tracking-wider transition-all duration-300 ${
                    isAnimating && !gameWon ? 'shake-animation' : ''
                }`}
                style={{
                    minHeight: '3rem',
                }}
            >
                <span className={`text-lg ${display.textColor}`}>
                    {display.text}
                </span>
            </div>
        </div>
    )
}
