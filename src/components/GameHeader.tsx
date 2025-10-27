import Image from 'next/image'

interface GameHeaderProps {
    timer: string
    onShowStats: () => void
    gameMode: 'daily' | 'unlimited'
    onGameModeChange: (mode: 'daily' | 'unlimited') => void
}

const meshGradient =
    'linear-gradient(115deg, #fc67fa 0%, #f4c4f3 43%,#7fd6fb 67%, #7f53ac 100%)'

export default function GameHeader({
    timer,
    onShowStats,
    gameMode,
    onGameModeChange,
}: GameHeaderProps) {
    return (
        <div className='flex w-full flex-shrink-0 flex-col gap-3 p-4'>
            <div className='flex w-full items-center justify-between'>
                <div className='flex items-center justify-start'>
                    <Image
                        src='/images/idolguessr-logo.png'
                        alt='IdolGuessr Logo'
                        width={150}
                        height={50}
                        className='h-10 w-auto'
                    />
                </div>

                {gameMode === 'unlimited' && (
                    <div className='flex items-center justify-end'>
                        <div
                            className='rounded-full px-3.5 py-1.5'
                            style={{
                                background: meshGradient,
                            }}
                        >
                            <h1 className='font-bold text-sm text-white uppercase tracking-widest'>
                                Unlimited
                            </h1>
                        </div>
                    </div>
                )}

                <div className='flex items-center gap-3'>
                    {gameMode === 'daily' && (
                        <div className='flex flex-col items-end text-right'>
                            <div className='text-xs font-medium text-gray-400'>
                                NEXT IDOL
                            </div>
                            <div className='font-mono text-lg leading-none font-bold text-black'>
                                {timer}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={onShowStats}
                        className='flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-gray-100 transition-colors hover:bg-gray-200'
                        aria-label='View Statistics'
                    >
                        <StatsIcon />
                    </button>

                    <button
                        onClick={() =>
                            onGameModeChange(
                                gameMode === 'daily' ? 'unlimited' : 'daily'
                            )
                        }
                        className='flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-gray-100 transition-colors hover:bg-gray-200'
                        aria-label='View Game Mode'
                        style={{
                            background: meshGradient,
                        }}
                    >
                        <GameModeIcon />
                    </button>
                </div>
            </div>
        </div>
    )
}

function StatsIcon() {
    return (
        <svg
            className='h-5 w-5 text-gray-600'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
        >
            <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
            />
        </svg>
    )
}

function GameModeIcon() {
    return (
        <svg
            width='23'
            height='23'
            viewBox='0 0 23 23'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
        >
            <g clipPath='url(#clip0_2093_121)'>
                <path
                    d='M16.1736 0.0977746C16.3143 0.179336 16.4232 0.306198 16.4824 0.457635C16.5417 0.609072 16.5479 0.776133 16.4999 0.931525L13.911 9.34377H18.6878C18.8282 9.34372 18.9655 9.38477 19.0828 9.46187C19.2001 9.53896 19.2923 9.64872 19.3479 9.7776C19.4036 9.90648 19.4203 10.0488 19.3959 10.1871C19.3716 10.3253 19.3073 10.4534 19.211 10.5556L7.71104 22.7743C7.59976 22.8927 7.45169 22.9698 7.29096 22.9932C7.13023 23.0166 6.96631 22.9849 6.82592 22.9032C6.68554 22.8215 6.57697 22.6946 6.5179 22.5433C6.45883 22.392 6.45276 22.2252 6.50066 22.07L9.0896 13.6563H4.31279C4.17241 13.6563 4.03508 13.6153 3.91777 13.5382C3.80046 13.4611 3.70828 13.3513 3.65264 13.2224C3.59699 13.0936 3.5803 12.9512 3.60463 12.813C3.62895 12.6747 3.69324 12.5466 3.78954 12.4445L15.2895 0.225712C15.4007 0.107548 15.5485 0.0304545 15.709 0.00696569C15.8695 -0.0165231 16.0333 0.0149745 16.1736 0.0963371V0.0977746Z'
                    fill='white'
                />
            </g>
            <defs>
                <clipPath id='clip0_2093_121'>
                    <rect width='23' height='23' fill='white' />
                </clipPath>
            </defs>
        </svg>
    )
}
