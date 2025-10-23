interface GuessIndicatorsProps {
    guesses: Array<'correct' | 'incorrect' | 'empty'>
}

export default function GuessIndicators({ guesses }: GuessIndicatorsProps) {
    return (
        <div className='grid w-full grid-cols-6 gap-2 sm:mx-auto sm:max-w-md flex-shrink-0 mb-3'>
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
                        <span className='text-base font-bold text-white'>✕</span>
                    )}
                    {guess === 'empty' && (
                        <span className='text-base font-bold text-gray-300'>✕</span>
                    )}
                </div>
            ))}
        </div>
    )
}

