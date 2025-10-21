'use client'

import { ImagePixelated } from 'react-pixelate'
import Image from 'next/image'
import { memo, useState, useEffect } from 'react'

interface PixelatedImageProps {
    src: string
    alt: string
    width: number
    height: number
    className?: string
    pixelationLevel: number
}

function PixelatedImage({
    src,
    width,
    height,
    pixelationLevel,
}: PixelatedImageProps) {
    const [isTransitioning, setIsTransitioning] = useState(false)

    useEffect(() => {
        // Show loading state during pixelation changes
        setIsTransitioning(true)
        const timer = setTimeout(() => {
            setIsTransitioning(false)
        }, 100)
        return () => clearTimeout(timer)
    }, [pixelationLevel])
    const getPixelSize = (level: number) => {
        if (level <= 0) return 1

        switch (level) {
            case 6:
                return 12
            case 5:
                return 10
            case 4:
                return 8
            case 3:
                return 6
            case 2:
                return 4
            case 1:
                return 2
            default:
                return 1
        }
    }

    const pixelSize = getPixelSize(pixelationLevel)

    if (pixelationLevel <= 0) {
        return (
            <div className='flex h-full w-full items-center justify-center overflow-hidden rounded-lg'>
                <Image
                    src={src}
                    alt='Clear idol'
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

    return (
        <div className='flex h-full w-full items-center justify-center overflow-hidden rounded-lg'>
            <div
                style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isTransitioning ? 0.7 : 1,
                    transition: 'opacity 0.1s ease',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <ImagePixelated
                        src={src}
                        width={400}
                        height={400}
                        pixelSize={pixelSize}
                        centered={true}
                        fillTransparencyColor='white'
                    />
                </div>
            </div>
        </div>
    )
}

// Memoize to prevent unnecessary re-renders
export default memo(PixelatedImage, (prevProps, nextProps) => {
    // Only re-render if these specific props change
    return (
        prevProps.src === nextProps.src &&
        prevProps.pixelationLevel === nextProps.pixelationLevel
    )
})
