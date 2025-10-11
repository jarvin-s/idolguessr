'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'

interface PixelatedImageProps {
    src: string
    alt: string
    width: number
    height: number
    className?: string
    pixelationLevel: number
}

interface ColorBlock {
    id: string
    left: number
    top: number
    width: number
    height: number
    color: string
}

export default function PixelatedImage({
    src,
    alt,
    width,
    height,
    pixelationLevel,
}: PixelatedImageProps) {
    const [imageLoaded, setImageLoaded] = useState(false)
    const [colorBlocks, setColorBlocks] = useState<ColorBlock[]>([])
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const imgRef = useRef<HTMLImageElement>(null)

    // Calculate block size based on pixelation level
    const getBlockSize = (level: number) => {
        if (level === 1) return 0
        return Math.floor(level * 4) // 8, 16, 24, 32, 40, 48 pixels
    }

    const blockSize = getBlockSize(pixelationLevel)

    useEffect(() => {
        if (!imageLoaded || blockSize === 0) return

        const sampleImageColor = (x: number, y: number): string => {
            const canvas = canvasRef.current
            const img = imgRef.current
            if (!canvas || !img) return 'rgb(128, 128, 128)'

            const ctx = canvas.getContext('2d')
            if (!ctx) return 'rgb(128, 128, 128)'

            canvas.width = width
            canvas.height = height

            ctx.drawImage(img, 0, 0, width, height)

            const centerX = Math.min(x + blockSize / 2, width - 1)
            const centerY = Math.min(y + blockSize / 2, height - 1)

            try {
                const imageData = ctx.getImageData(centerX, centerY, 1, 1)
                const [r, g, b] = imageData.data
                return `rgb(${r}, ${g}, ${b})`
            } catch (error) {
                console.error('Error sampling color:', error)
                return 'rgb(128, 128, 128)'
            }
        }

        const blocks: ColorBlock[] = []
        const blocksX = Math.ceil(width / blockSize)
        const blocksY = Math.ceil(height / blockSize)

        for (let y = 0; y < blocksY; y++) {
            for (let x = 0; x < blocksX; x++) {
                const left = x * blockSize
                const top = y * blockSize
                const blockWidth = Math.min(blockSize, width - left)
                const blockHeight = Math.min(blockSize, height - top)

                const color = sampleImageColor(left, top)

                blocks.push({
                    id: `${x}-${y}`,
                    left,
                    top,
                    width: blockWidth,
                    height: blockHeight,
                    color,
                })
            }
        }

        setColorBlocks(blocks)
    }, [imageLoaded, pixelationLevel, width, height, blockSize])

    const handleImageLoad = () => {
        setImageLoaded(true)
    }

    return (
        <div className='relative h-full w-full'>
            {/* Hidden canvas for color sampling */}
            <canvas
                ref={canvasRef}
                className='hidden'
                width={width}
                height={height}
            />

            {/* Conditional rendering based on pixelation level */}
            {pixelationLevel === 1 ? (
                /* Show original image when no pixelation */
                <Image
                    ref={imgRef}
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    className='h-full w-full object-cover'
                    onLoad={handleImageLoad}
                    crossOrigin='anonymous'
                />
            ) : (
                /* Show pixelated version */
                <>
                    {/* Hidden base image for color sampling */}
                    <Image
                        ref={imgRef}
                        src={src}
                        alt={alt}
                        width={width}
                        height={height}
                        className='h-full w-full object-cover opacity-0'
                        onLoad={handleImageLoad}
                        crossOrigin='anonymous'
                    />

                    {/* Pixelated blocks covering the entire area */}
                    {imageLoaded && (
                        <div className='pointer-events-none absolute inset-0'>
                            {colorBlocks.map((block) => (
                                <div
                                    key={block.id}
                                    className='absolute'
                                    style={{
                                        left: block.left,
                                        top: block.top,
                                        width: block.width,
                                        height: block.height,
                                        backgroundColor: block.color,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
