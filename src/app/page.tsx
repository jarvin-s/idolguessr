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
        <div className='min-h-screen bg-white p-4'>
            {/* Header */}
            <div className='mb-8 flex items-center justify-end'>
                <div className='text-right'>
                    <div className='mb-1 text-sm font-medium text-gray-400'>
                        NEXT IDOL
                    </div>
                    <div className='font-mono text-2xl font-bold text-black'>
                        {timer}
                    </div>
                </div>
            </div>

            {/* Main Game Area */}
            <div className='mx-auto flex max-w-2xl flex-col items-center'>
                {/* Pixelated Image */}
                <div className='relative mb-8'>
                    <div className='flex h-96 w-96 items-center justify-center overflow-hidden rounded-lg bg-gray-200'>
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
                <div className='mb-6 flex gap-2'>
                    <div className='flex h-8 w-8 items-center justify-center bg-black'>
                        <span className='text-lg font-bold text-white'>✕</span>
                    </div>
                    <div className='flex h-8 w-8 items-center justify-center bg-black'>
                        <span className='text-lg font-bold text-white'>✕</span>
                    </div>
                    <div className='flex h-8 w-8 items-center justify-center bg-black'>
                        <span className='text-lg font-bold text-white'>✕</span>
                    </div>
                    <div className='h-8 w-8 bg-green-400'></div>
                </div>

                {/* Current Guess */}
                <div className='mb-12'>
                    <div className='text-4xl font-bold tracking-wider text-black'>
                        {currentGuess}
                    </div>
                </div>

                {/* Virtual Keyboard */}
                <div className='w-full max-w-lg'>
                    {/* Top Row */}
                    <div className='mb-1 flex justify-center gap-1'>
                        {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map(
                            (key) => (
                                <button
                                    key={key}
                                    className='flex h-10 w-8 items-center justify-center rounded bg-gray-300 text-sm font-semibold text-black transition-colors hover:bg-gray-400'
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
                                    className='flex h-10 w-8 items-center justify-center rounded bg-gray-300 text-sm font-semibold text-black transition-colors hover:bg-gray-400'
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
                    <div className='flex justify-center gap-1'>
                        <button className='flex h-10 w-16 items-center justify-center rounded bg-gray-300 text-sm font-semibold text-black transition-colors hover:bg-gray-400'>
                            ENTER
                        </button>
                        {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((key) => (
                            <button
                                key={key}
                                className='flex h-10 w-8 items-center justify-center rounded bg-gray-300 text-sm font-semibold text-black transition-colors hover:bg-gray-400'
                                onClick={() => {
                                    /* Handle key press */
                                }}
                            >
                                {key}
                            </button>
                        ))}
                        <button className='flex h-10 w-10 items-center justify-center rounded bg-gray-300 text-sm font-bold text-black transition-colors hover:bg-gray-400'>
                            ✕
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
