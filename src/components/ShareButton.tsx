'use client'

import { useState } from 'react'

interface ShareButtonProps {
    correctAnswer: string
    guessCount: number
    pixelatedImageSrc: string
    className?: string
}

export default function ShareButton({
    correctAnswer,
    guessCount,
    pixelatedImageSrc,
    className = '',
}: ShareButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false)

    const generateShareImage = async () => {
        setIsGenerating(true)

        try {
            // Create canvas
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (!ctx) return

            // Set canvas size (Instagram story size: 1080x1920)
            const width = 1080
            const height = 1920
            canvas.width = width
            canvas.height = height

            // Background
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, width, height)

            // Add rounded frame with 35px padding
            const framePadding = 35
            const frameWidth = width - framePadding * 2
            const frameHeight = height - framePadding * 2
            const frameX = framePadding
            const frameY = framePadding
            const frameRadius = 25

            // Draw rounded frame background
            ctx.fillStyle = '#ffffff'
            ctx.beginPath()
            ctx.roundRect(frameX, frameY, frameWidth, frameHeight, frameRadius)
            ctx.fill()

            // Load and draw the pixelated image
            const img = new Image()
            img.crossOrigin = 'anonymous'

            await new Promise((resolve, reject) => {
                img.onload = resolve
                img.onerror = reject
                img.src = pixelatedImageSrc
            })

            // Draw pixelated image (centered within frame, square with rounded corners)
            const imageSize = frameWidth - 100 // Leave some margin within frame
            const imageX = frameX + (frameWidth - imageSize) / 2
            const imageY = frameY + 50
            const cornerRadius = 20

            // Save context before clipping
            ctx.save()

            // Create rounded rectangle path
            ctx.beginPath()
            ctx.roundRect(imageX, imageY, imageSize, imageSize, cornerRadius)
            ctx.clip()

            // Apply pixelation effect (24px pixel size)
            const pixelSize = 24
            const tempCanvas = document.createElement('canvas')
            const tempCtx = tempCanvas.getContext('2d')
            if (tempCtx) {
                tempCanvas.width = imageSize / pixelSize
                tempCanvas.height = imageSize / pixelSize

                // Disable image smoothing for crisp pixelation
                tempCtx.imageSmoothingEnabled = false
                tempCtx.drawImage(
                    img,
                    0,
                    0,
                    tempCanvas.width,
                    tempCanvas.height
                )

                // Draw the pixelated version back to main canvas with no smoothing
                ctx.imageSmoothingEnabled = false
                ctx.drawImage(tempCanvas, imageX, imageY, imageSize, imageSize)
            } else {
                ctx.drawImage(img, imageX, imageY, imageSize, imageSize)
            }

            // Reset clip
            ctx.restore()

            // Draw progress blocks (full width, same as image, square aspect ratio)
            const blockSize = 60
            const blockSpacing = 15
            const totalBlocksWidth = imageSize
            const blocksStartX = imageX
            const blocksY = imageY + imageSize + 30
            const blockWidth = (totalBlocksWidth - 5 * blockSpacing) / 6
            const blockHeight = blockWidth // Make it square (1:1 aspect ratio)

            for (let i = 0; i < 6; i++) {
                const blockX = blocksStartX + i * (blockWidth + blockSpacing)

                if (i === guessCount - 1) {
                    // Only the correct guess (green)
                    ctx.fillStyle = '#4ade80'
                    ctx.beginPath()
                    ctx.roundRect(blockX, blocksY, blockWidth, blockHeight, 12)
                    ctx.fill()
                } else if (i < guessCount) {
                    // Previous incorrect guesses (black with X)
                    ctx.fillStyle = '#000000'
                    ctx.beginPath()
                    ctx.roundRect(blockX, blocksY, blockWidth, blockHeight, 12)
                    ctx.fill()

                    // Draw X
                    ctx.strokeStyle = '#ffffff'
                    ctx.lineWidth = 5
                    ctx.lineCap = 'round'
                    const padding = 55
                    ctx.beginPath()
                    ctx.moveTo(blockX + padding, blocksY + padding)
                    ctx.lineTo(
                        blockX + blockWidth - padding,
                        blocksY + blockHeight - padding
                    )
                    ctx.moveTo(blockX + blockWidth - padding, blocksY + padding)
                    ctx.lineTo(
                        blockX + padding,
                        blocksY + blockHeight - padding
                    )
                    ctx.stroke()
                } else {
                    // Empty/remaining guesses (gray)
                    ctx.fillStyle = '#e5e7eb'
                    ctx.beginPath()
                    ctx.roundRect(blockX, blocksY, blockWidth, blockHeight, 12)
                    ctx.fill()
                }
            }

            // Draw result text
            ctx.fillStyle = '#000000'
            ctx.font = 'bold 72px Arial, sans-serif'
            ctx.textAlign = 'center'

            const resultText = `I guessed today's\nidol in ${guessCount} turn(s)!`
            const textY = blocksY + blockHeight + 150

            // Split text into lines and draw
            const lines = resultText.split('\n')
            lines.forEach((line, index) => {
                ctx.fillText(line, frameX + frameWidth / 2, textY + index * 90)
            })

            // Draw date
            const today = new Date()
            const dateStr = today.toLocaleDateString('en-GB')
            ctx.font = '48px Arial, sans-serif'
            ctx.fillStyle = '#666666'
            ctx.fillText(dateStr, frameX + frameWidth / 2, textY + 200)

            // Draw branding
            const brandingY = frameY + frameHeight - 100

            // Left side - Load and draw logo image
            const logoImg = new Image()
            logoImg.crossOrigin = 'anonymous'

            try {
                await new Promise((resolve, reject) => {
                    logoImg.onload = resolve
                    logoImg.onerror = reject
                    logoImg.src = '/images/idolguessr-logo.png'
                })

                // Draw logo (scaled to appropriate size - 1.5x bigger)
                const logoWidth = 300
                const logoHeight = 135 // Maintain aspect ratio
                ctx.drawImage(
                    logoImg,
                    frameX + 50,
                    brandingY - 65, // Added 30px more margin bottom
                    logoWidth,
                    logoHeight
                )
            } catch (error) {
                // Fallback to text if logo fails to load
                ctx.font = 'bold 64px Arial, sans-serif'
                ctx.fillStyle = '#000000'
                ctx.textAlign = 'left'
                ctx.fillText('idol', frameX + 50, brandingY)
                ctx.fillText('guessr', frameX + 50, brandingY + 80)
            }

            // Right side - "PLAY AT" and URL
            ctx.font = '32px Arial, sans-serif'
            ctx.fillStyle = '#000000'
            ctx.textAlign = 'right'
            ctx.fillText('PLAY AT', frameX + frameWidth - 50, brandingY)
            ctx.font = 'bold 48px Arial, sans-serif'
            ctx.fillText(
                'idolguessr.fun',
                frameX + frameWidth - 50,
                brandingY + 50
            )

            // Convert to blob and download
            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = `idolguessr-${correctAnswer}-${guessCount}turns.png`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    URL.revokeObjectURL(url)
                }
            }, 'image/png')
        } catch (error) {
            console.error('Error generating share image:', error)
            alert('Failed to generate share image. Please try again.')
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <button
            onClick={generateShareImage}
            disabled={isGenerating}
            className={`flex items-center gap-2 rounded-lg bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        >
            {isGenerating ? (
                <>
                    <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent' />
                    Generating...
                </>
            ) : (
                <>
                    <svg
                        className='h-5 w-5'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z'
                        />
                    </svg>
                    Share Result
                </>
            )}
        </button>
    )
}
