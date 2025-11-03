import localFont from 'next/font/local'

const proximaNovaBold = localFont({
    src: '../../../public/fonts/proximanova_bold.otf',
})

interface HelpModalProps {
    isOpen: boolean
    onClose: () => void
    onShowFeedback: () => void
}

export default function HelpModal({
    isOpen,
    onClose,
    onShowFeedback,
}: HelpModalProps) {
    if (!isOpen) return null

    return (
        <div className='bg-opacity-50 fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4'>
            <div className='modal-fade-in relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-10'>
                <h1 className={`${proximaNovaBold.className} text-3xl uppercase`}>
                    How to play
                </h1>
                <p className='text-xl'>Guess the Idol in 6 tries!</p>

                <ul className='mt-4 space-y-2 font-bold'>
                    <li className='flex items-start gap-2 text-[16px]'>
                        <span>•</span>
                        <span>Each guess must be a valid K-pop idol stage name</span>
                    </li>
                    <li className='flex items-start gap-2 text-[16px]'>
                        <span>•</span>
                        <span>The image will become clearer with each wrong guess</span>
                    </li>
                </ul>

                <div className='mt-6 grid grid-cols-3 gap-2'>
                    <div className='flex flex-col gap-2'>
                        <div
                            className='aspect-square w-full rounded bg-gray-100'
                            style={{
                                backgroundImage: `url('/images/how-to-play-1.png')`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        />
                        <div className='flex gap-1'>
                            <div className='flex h-6 w-6 items-center justify-center rounded bg-black'>
                                <span className='text-[10px] font-bold text-white'>
                                    ✕
                                </span>
                            </div>
                            <div className='h-6 w-6 rounded bg-gray-200' />
                            <div className='h-6 w-6 rounded bg-gray-200' />
                        </div>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <div
                            className='aspect-square w-full rounded bg-gray-100'
                            style={{
                                backgroundImage: `url('/images/how-to-play-2.png')`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        />
                        <div className='flex gap-1'>
                            <div className='flex h-6 w-6 items-center justify-center rounded bg-black'>
                                <span className='text-[10px] font-bold text-white'>
                                    ✕
                                </span>
                            </div>
                            <div className='flex h-6 w-6 items-center justify-center rounded bg-black'>
                                <span className='text-[10px] font-bold text-white'>
                                    ✕
                                </span>
                            </div>
                            <div className='h-6 w-6 rounded bg-gray-200' />
                        </div>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <div
                            className='aspect-square w-full rounded bg-gray-100'
                            style={{
                                backgroundImage: `url('/images/how-to-play-3.png')`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        />
                        <div className='flex gap-1'>
                            <div className='flex h-6 w-6 items-center justify-center rounded bg-black'>
                                <span className='text-[10px] font-bold text-white'>
                                    ✕
                                </span>
                            </div>
                            <div className='flex h-6 w-6 items-center justify-center rounded bg-black'>
                                <span className='text-[10px] font-bold text-white'>
                                    ✕
                                </span>
                            </div>
                            <div className='h-6 w-6 rounded bg-green-400' />
                        </div>
                    </div>
                </div>

                <p className='mt-6 text-lg'>Every day a new idol appears!</p>

                <button onClick={onShowFeedback} className='mt-6 w-full text-white'>
                    <span className={`${proximaNovaBold.className} cursor-pointer text-black uppercase underline hover:text-gray-800`}>
                        Submit feedback
                    </span>
                </button>

                <button
                    onClick={onClose}
                    className='absolute top-4 right-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200'
                    aria-label='Close Help'
                >
                    <svg className='h-4 w-4 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                    </svg>
                </button>
            </div>
        </div>
    )
}


