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
            case 6: return 12
            case 5: return 10 
            case 4: return 8 
            case 3: return 6
            case 2: return 4
            case 1: return 2 
            default: return 1
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
