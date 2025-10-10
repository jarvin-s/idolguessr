'use client'

import Image from 'next/image'

export default function Home() {
    const currentGuess = 'WONYOUNG'
    const timer = '18:36:05'

    const blurImageStyle = {
        filter: 'blur(20px) contrast(200%) brightness(1.2)',
        imageRendering: 'pixelated' as const,
        transform: 'scale(0.5)',
        transformOrigin: 'center',
    }

    return (
        <div className='flex h-screen flex-col overflow-hidden bg-white'>
            {/* Header */}
            <div className='mb-2 flex w-full flex-shrink-0 items-center justify-end p-3'>
                <div className='text-right'>
                    <div className='mb-1 text-xs font-medium text-gray-400'>
                        NEXT IDOL
                    </div>
                    <div className='font-mono text-lg font-bold text-black'>
                        {timer}
                    </div>
                </div>
            </div>

            {/* Main Game Area */}
            <div className='flex w-full flex-1 flex-col items-center justify-between px-4'>
                <div className='flex w-full flex-col items-center'>
                    {/* Pixelated Image */}
                    <div className='relative mb-3 w-full max-w-xs'>
                        <div className='flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-gray-200'>
                            <Image
                                src={'/idols/d29ueW91bmc-001.png'}
                                alt='Blurred idol'
                                width={400}
                                height={400}
                                className='h-full w-full object-cover'
                                style={blurImageStyle}
                            />
                        </div>
                    </div>

                    {/* Guess Indicators */}
                    <div className='mb-3 flex gap-2'>
                        <div className='flex h-6 w-6 items-center justify-center bg-black'>
                            <span className='text-sm font-bold text-white'>
                                ✕
                            </span>
                        </div>
                        <div className='flex h-6 w-6 items-center justify-center bg-black'>
                            <span className='text-sm font-bold text-white'>
                                ✕
                            </span>
                        </div>
                        <div className='flex h-6 w-6 items-center justify-center bg-black'>
                            <span className='text-sm font-bold text-white'>
                                ✕
                            </span>
                        </div>
                        <div className='h-6 w-6 bg-green-400'></div>
                    </div>

                    {/* Current Guess */}
                    <div className='mb-4'>
                        <div className='text-2xl font-bold tracking-wider text-black'>
                            {currentGuess}
                        </div>
                    </div>
                </div>

                {/* Virtual Keyboard */}
                <div className='w-full pb-4'>
                    {/* Top Row */}
                    <div className='mb-1 flex gap-1'>
                        {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map(
                            (key) => (
                                <button
                                    key={key}
                                    className='flex h-12 flex-1 items-center justify-center rounded bg-gray-300 text-sm font-semibold text-black transition-colors hover:bg-gray-400'
                                    onClick={() => {
                                        /* Handle key press */
                                    }}
                                >
                                    {key}
                                </button>
                            )
                        )}
                    </div>

                    {/* Middle Row */}
                    <div className='mb-1 flex justify-center gap-1'>
                        {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map(
                            (key) => (
                                <button
                                    key={key}
                                    className='flex h-12 w-8 items-center justify-center rounded bg-gray-300 text-sm font-semibold text-black transition-colors hover:bg-gray-400'
                                    onClick={() => {
                                        /* Handle key press */
                                    }}
                                >
                                    {key}
                                </button>
                            )
                        )}
                    </div>

                    {/* Bottom Row */}
                    <div className='flex gap-1'>
                        <button className='flex h-12 flex-[1.5] items-center justify-center rounded bg-gray-300 text-sm font-semibold text-black transition-colors hover:bg-gray-400'>
                            ENTER
                        </button>
                        {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((key) => (
                            <button
                                key={key}
                                className='flex h-12 flex-1 items-center justify-center rounded bg-gray-300 text-sm font-semibold text-black transition-colors hover:bg-gray-400'
                                onClick={() => {
                                    /* Handle key press */
                                }}
                            >
                                {key}
                            </button>
                        ))}
                        <button className='flex h-12 flex-[1.2] items-center justify-center rounded bg-gray-300 text-sm font-bold text-black transition-colors hover:bg-gray-400'>
                            ✕
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
