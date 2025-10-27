import UserStats from './UserStats'

interface StatsModalProps {
    isOpen: boolean
    onClose: () => void
    onShowHelp: () => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stats: any
    statsLoaded: boolean
}

export default function StatsModal({
    isOpen,
    onClose,
    onShowHelp,
    stats,
    statsLoaded,
}: StatsModalProps) {
    if (!isOpen) return null

    return (
        <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
            <div className='modal-fade-in relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white'>
                <div className='absolute top-4 right-4 flex gap-2'>
                    <button
                        onClick={onShowHelp}
                        className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200'
                        aria-label='View Help'
                    >
                        <HelpIcon />
                    </button>
                    <button
                        onClick={onClose}
                        className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200'
                        aria-label='Close Statistics'
                    >
                        <svg
                            className='h-4 w-4 text-gray-600'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M6 18L18 6M6 6l12 12'
                            />
                        </svg>
                    </button>
                </div>

                <UserStats
                    stats={stats}
                    isLoaded={statsLoaded}
                    className='border-0 shadow-none'
                />
            </div>
        </div>
    )
}

function HelpIcon() {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-4 w-4 text-gray-600'
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
