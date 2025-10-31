interface GuessIndicatorsProps {
    guesses: Array<'correct' | 'incorrect' | 'empty'>
}

export default function GuessIndicators({ guesses }: GuessIndicatorsProps) {
    return (
        <div className='mb-3 grid w-full flex-shrink-0 grid-cols-6 gap-2 sm:mx-auto sm:max-w-md'>
            {guesses.map((guess, index) => (
                <div
                    key={`${index}-${guess}`}
                    className={`flex aspect-square items-center justify-center rounded-[5px] ${
                        guess === 'correct'
                            ? 'square-pop-animation bg-green-400'
                            : guess === 'incorrect'
                              ? 'square-pop-animation bg-black'
                              : 'bg-gray-200'
                    }`}
                >
                    {guess === 'incorrect' && (
                        <span className='text-base font-bold text-white select-none'>
                            ✕
                        </span>
                    )}
                    {guess === 'empty' && (
                        <span className='text-base font-bold text-gray-300 select-none'>
                            ✕
                        </span>
                    )}
                </div>
            ))}
        </div>
    )
}
