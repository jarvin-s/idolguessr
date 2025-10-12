'use client'

import { ImagePixelated } from 'react-pixelate'
import Image from 'next/image'

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
    const getPixelSize = (level: number) => {
        // Handle game end states (won or lost) - crystal clear
        if (level <= 0) return 1
        
        switch (level) {
            case 6: return 60 // Game start (6 guesses left)
            case 5: return 50 // 1 wrong guess (5 guesses left)
            case 4: return 40 // 2 wrong guesses (4 guesses left)
            case 3: return 30 // 3 wrong guesses (3 guesses left)
            case 2: return 20 // 4 wrong guesses (2 guesses left)
            case 1: return 10 // 5 wrong guesses (1 guess left) - still pixelated!
            default: return 1 // Fallback - crystal clear
        }
    }

    const pixelSize = getPixelSize(pixelationLevel)

    // When game ends (won or lost), show regular image immediately for instant clarity
    if (pixelationLevel <= 0) {
        return (
            <div className='h-full w-full overflow-hidden flex items-center justify-center'>
                <Image
                    src={src}
                    alt="Clear idol"
                    width={width}
                    height={height}
                    className='object-cover'
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                />
            </div>
        )
    }

    // During game, show pixelated version
    return (
        <div className='h-full w-full overflow-hidden flex items-center justify-center'>
            <div style={{ 
                width: `${width}px`,
                height: `${height}px`,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
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
        </div>
    )
}
