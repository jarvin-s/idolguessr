'use client'

import Image from 'next/image'

interface PrePixelatedImageProps {
    src: string
    alt: string
    className?: string
}

export default function PrePixelatedImage({
    src,
    alt,
    className = '',
}: PrePixelatedImageProps) {
    return (
        <div className={`flex h-full w-full items-center justify-center overflow-hidden rounded-lg ${className}`}>
            <Image
                src={src}
                alt={alt}
                width={600}
                height={600}
                className='object-cover'
                style={{
                    width: '100%',
                    height: '100%',
                }}
                unoptimized // Since we're loading from Supabase bucket
            />
        </div>
    )
}

