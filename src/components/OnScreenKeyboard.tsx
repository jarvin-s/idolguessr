'use client'

import { useRef } from 'react'

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
    
    const keyboardRef = useRef<HTMLDivElement>(null)

    const handlePress = (key: string) => (e: React.PointerEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onKeyPress(key)
    }
    
    // Smart touch detection - finds nearest key when touching gaps
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        // Immediately find the target or nearest button
        const target = e.target as HTMLElement
        
        // If clicked directly on a button or its child (SVG icon), handle it
        const button = target.closest('button')
        if (button) {
            // Let the button's own handler deal with it
            return
        }
        
        // Clicked on gap/whitespace - find nearest button FAST
        e.preventDefault()
        e.stopPropagation()
        
        const touch = { x: e.clientX, y: e.clientY }
        const buttons = keyboardRef.current?.querySelectorAll('button')
        
        if (!buttons || buttons.length === 0) return
        
        let nearestButton: Element | null = null
        let nearestDistance = Infinity
        
        // Fast iteration - use for loop instead of forEach
        for (let i = 0; i < buttons.length; i++) {
            const button = buttons[i]
            const rect = button.getBoundingClientRect()
            
            // Use center point for distance calculation
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2
            
            const dx = touch.x - centerX
            const dy = touch.y - centerY
            const distance = dx * dx + dy * dy  // Skip sqrt for performance
            
            if (distance < nearestDistance) {
                nearestDistance = distance
                nearestButton = button
            }
        }
        
        // Immediately trigger the nearest button's handler
        if (nearestButton) {
            const btn = nearestButton as HTMLButtonElement
            // Get the key from the button's text content or data attribute
            const key = btn.textContent?.trim() || btn.getAttribute('data-key') || ''
            if (key) {
                onKeyPress(key)
            }
        }
    }

    return (
        <div 
            ref={keyboardRef}
            className={`w-full select-none ${className}`}
            onPointerDown={handlePointerDown}
            style={{ 
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none',
                userSelect: 'none'
            }}
        >
            <div className='mb-1 flex gap-1'>
                {topRowKeys.map((key) => (
                    <button
                        key={key}
                        data-key={key}
                        className='flex h-12 flex-1 touch-none items-center justify-center rounded bg-gray-300 text-sm font-semibold text-black transition-colors hover:bg-gray-400 active:bg-gray-500'
                        onPointerDown={handlePress(key)}
                    >
                        {key}
                    </button>
                ))}
            </div>

            <div className='mb-1 flex gap-1'>
                <div className='flex-[0.5]'></div>
                {middleRowKeys.map((key) => (
                    <button
                        key={key}
                        data-key={key}
                        className='flex h-12 flex-1 touch-none items-center justify-center rounded bg-gray-300 text-sm font-semibold text-black transition-colors hover:bg-gray-400 active:bg-gray-500'
                        onPointerDown={handlePress(key)}
                    >
                        {key}
                    </button>
                ))}
                <div className='flex-[0.5]'></div>
            </div>

            <div className='flex gap-1'>
                <button
                    data-key="ENTER"
                    className='flex h-12 flex-[1.5] touch-none items-center justify-center rounded bg-gray-300 text-[12px] font-bold text-black transition-colors hover:bg-gray-400 active:bg-gray-500'
                    onPointerDown={handlePress('ENTER')}
                >
                    ENTER
                </button>
                {bottomRowKeys.map((key) => (
                    <button
                        key={key}
                        data-key={key}
                        className='flex h-12 flex-1 touch-none items-center justify-center rounded bg-gray-300 text-sm font-semibold text-black transition-colors hover:bg-gray-400 active:bg-gray-500'
                        onPointerDown={handlePress(key)}
                    >
                        {key}
                    </button>
                ))}
                <button
                    data-key="✕"
                    className='flex h-12 flex-[1.5] touch-none items-center justify-center rounded bg-gray-300 text-black transition-colors hover:bg-gray-400 active:bg-gray-500'
                    onPointerDown={handlePress('✕')}
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
