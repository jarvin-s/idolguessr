'use client'

interface OnScreenKeyboardProps {
    onKeyPress: (key: string) => void
    className?: string
}

export default function OnScreenKeyboard({
    onKeyPress,
    className = '',
}: OnScreenKeyboardProps) {
    const topRowKeys = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P']
    const middleRowKeys = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L']
    const bottomRowKeys = ['Z', 'X', 'C', 'V', 'B', 'N', 'M']

    return (
        <div className={`w-full ${className}`}>
            {/* Top Row - 10 keys */}
            <div className='mb-1 flex gap-1'>
                {topRowKeys.map((key) => (
                    <button
                        key={key}
                        className='flex h-12 flex-1 items-center justify-center rounded bg-gray-300 text-sm font-semibold text-black transition-colors hover:bg-gray-400 active:bg-gray-500'
                        onClick={() => onKeyPress(key)}
                    >
                        {key}
                    </button>
                ))}
            </div>

            {/* Middle Row - 9 keys with 0.5 key offset on each side */}
            <div className='mb-1 flex gap-1'>
                <div className='flex-[0.5]'></div>
                {middleRowKeys.map((key) => (
                    <button
                        key={key}
                        className='flex h-12 flex-1 items-center justify-center rounded bg-gray-300 text-sm font-semibold text-black transition-colors hover:bg-gray-400 active:bg-gray-500'
                        onClick={() => onKeyPress(key)}
                    >
                        {key}
                    </button>
                ))}
                <div className='flex-[0.5]'></div>
            </div>

            {/* Bottom Row - ENTER + 7 keys + Backspace */}
            <div className='flex gap-1'>
                <button
                    className='flex h-12 flex-[1.5] items-center justify-center rounded bg-gray-300 text-sm font-bold text-black transition-colors hover:bg-gray-400 active:bg-gray-500'
                    onClick={() => onKeyPress('ENTER')}
                >
                    ENTER
                </button>
                {bottomRowKeys.map((key) => (
                    <button
                        key={key}
                        className='flex h-12 flex-1 items-center justify-center rounded bg-gray-300 text-sm font-semibold text-black transition-colors hover:bg-gray-400 active:bg-gray-500'
                        onClick={() => onKeyPress(key)}
                    >
                        {key}
                    </button>
                ))}
                <button
                    className='flex h-12 flex-[1.5] items-center justify-center rounded bg-gray-300 text-black transition-colors hover:bg-gray-400 active:bg-gray-500'
                    onClick={() => onKeyPress('✕')}
                >
                    <BackspaceIcon />
                </button>
            </div>
        </div>
    )
}

export function BackspaceIcon() {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width='32'
            height='32'
            viewBox='0 0 24 24'
        >
            <path
                fill='currentColor'
                d='m11.4 16l2.6-2.6l2.6 2.6l1.4-1.4l-2.6-2.6L18 9.4L16.6 8L14 10.6L11.4 8L10 9.4l2.6 2.6l-2.6 2.6zM9 20q-.475 0-.9-.213t-.7-.587L2 12l5.4-7.2q.275-.375.7-.587T9 4h11q.825 0 1.413.587T22 6v12q0 .825-.587 1.413T20 20z'
            />
        </svg>
    )
}
