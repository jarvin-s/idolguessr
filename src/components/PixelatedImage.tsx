'use client'

import { ImagePixelated } from 'react-pixelate'

interface PixelatedImageProps {
    src: string
    alt: string
    width: number
    height: number
    className?: string
    pixelationLevel: number
}

export default function PixelatedImage({
    src,
    width,
    height,
    pixelationLevel,
}: PixelatedImageProps) {
    // Convert pixelation level to specific pixel sizes
    // Game start: 50, then 40→30→20→10→5, then 1 when won
    const getPixelSize = (level: number) => {
        if (level === 1) return 1 // Almost clear when won
        
        // Map remaining guesses to specific pixel sizes
        switch (level) {
            case 6: return 50 // Game start (6 guesses left)
            case 5: return 40 // 1 wrong guess (5 guesses left)
            case 4: return 30 // 2 wrong guesses (4 guesses left)
            case 3: return 20 // 3 wrong guesses (3 guesses left)
            case 2: return 10 // 4 wrong guesses (2 guesses left)
            default: return 5  // 5 wrong guesses (1 guess left)
        }
    }

    const pixelSize = getPixelSize(pixelationLevel)

    return (
        <div className='h-full w-full overflow-hidden flex items-center justify-center'>
            <div style={{ 
                transform: 'translate(-50%, -50%)',
                position: 'relative',
                left: '50%',
                top: '50%'
            }}>
                <ImagePixelated
                    src={src}
                    width={width}
                    height={height}
                    pixelSize={pixelSize}
                    centered={true}
                    fillTransparencyColor="white"
                />
            </div>
        </div>
    )
}
