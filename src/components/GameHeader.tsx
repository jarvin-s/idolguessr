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
                                Infinite
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
                        className='flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors'
                        aria-label='View Game Mode'
                        style={
                            gameMode === 'daily'
                                ? {
                                      background: meshGradient,
                                  }
                                : {
                                      background: 'black',
                                  }
                        }
                    >
                        <GameModeIcon gameMode={gameMode} />
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

function GameModeIcon({ gameMode }: { gameMode: 'daily' | 'unlimited' }) {
    if (gameMode === 'unlimited') {
        // Show clock icon when on unlimited page (to switch back to daily)
        return (
            <svg
                xmlns='http://www.w3.org/2000/svg'
                width='23'
                height='23'
                viewBox='0 0 24 24'
            >
                <path
                    fill='white'
                    d='M9 3V1h6v2zm3 19q-1.85 0-3.488-.712T5.65 19.35t-1.937-2.863T3 13t.713-3.488T5.65 6.65t2.863-1.937T12 4q1.55 0 2.975.5t2.675 1.45l1.4-1.4l1.4 1.4l-1.4 1.4Q20 8.6 20.5 10.025T21 13q0 1.85-.713 3.488T18.35 19.35t-2.863 1.938T12 22m-2-5l6-4l-6-4z'
                />
            </svg>
        )
    }

    // Show infinity icon when on daily page (to switch to unlimited)
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width='23'
            height='23'
            viewBox='0 0 56 56'
        >
            <path
                fill='white'
                d='M28 20.851C30.784 16.773 36.045 14 41 14c7.18 0 13 5.82 13 13s-5.82 13-13 13c-4.955 0-10.216-2.773-13-6.851C25.216 37.227 19.955 40 15 40C7.82 40 2 34.18 2 27s5.82-13 13-13c4.955 0 10.216 2.773 13 6.851M15 34c4.475 0 9-3.732 9-7s-4.525-7-9-7a7 7 0 1 0 0 14m26 0a7 7 0 0 0 0-14c-4.475 0-9 3.732-9 7s4.525 7 9 7'
            />
        </svg>
    )
}
