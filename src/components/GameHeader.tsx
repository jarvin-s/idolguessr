import Image from 'next/image'

interface GameHeaderProps {
    timer: string
    onShowStats: () => void
    onShowHelp: () => void
}

export default function GameHeader({
    timer,
    onShowStats,
    onShowHelp,
}: GameHeaderProps) {
    return (
        <div className='mb-2 flex w-full flex-shrink-0 items-center p-4'>
            <div className='flex w-1/2 items-center justify-start'>
                <Image
                    src='/images/idolguessr-logo.png'
                    alt='IdolGuessr Logo'
                    width={150}
                    height={50}
                    className='h-10 w-auto'
                />
            </div>

            <div className='flex w-full items-center justify-end gap-3'>
                <div className='flex flex-col items-end text-right'>
                    <div className='text-xs font-medium text-gray-400'>
                        NEXT IDOL
                    </div>
                    <div className='font-mono text-lg leading-none font-bold text-black'>
                        {timer}
                    </div>
                </div>

                <button
                    onClick={onShowStats}
                    className='flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 transition-colors hover:bg-gray-200'
                    aria-label='View Statistics'
                >
                    <StatsIcon />
                </button>

                <button
                    onClick={onShowHelp}
                    className='flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 transition-colors hover:bg-gray-200'
                    aria-label='View Help'
                >
                    <HelpIcon />
                </button>
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

function HelpIcon() {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5 text-gray-600'
            viewBox='0 0 15 15'
        >
            <path
                fill='currentColor'
                fillRule='evenodd'
                d='M.877 7.5a6.623 6.623 0 1 1 13.246 0a6.623 6.623 0 0 1-13.246 0M7.5 1.827a5.673 5.673 0 1 0 0 11.346a5.673 5.673 0 0 0 0-11.346m.75 8.673a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0m-2.2-4.25c0-.678.585-1.325 1.45-1.325s1.45.647 1.45 1.325c0 .491-.27.742-.736 1.025l-.176.104a5 5 0 0 0-.564.36c-.242.188-.524.493-.524.961a.55.55 0 0 0 1.1.004a.4.4 0 0 1 .1-.098c.102-.079.215-.144.366-.232q.116-.067.27-.159c.534-.325 1.264-.861 1.264-1.965c0-1.322-1.115-2.425-2.55-2.425S4.95 4.928 4.95 6.25a.55.55 0 0 0 1.1 0'
                clipRule='evenodd'
            />
        </svg>
    )
}
