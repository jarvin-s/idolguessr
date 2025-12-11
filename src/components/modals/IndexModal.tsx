import Image from 'next/image'
import { useState, useEffect } from 'react'
import { getDailyCount } from '@/lib/supabase'

interface IndexModalProps {
    isOpen: boolean
    onDaily: () => void
    onInfinite: () => void
}

export default function IndexModal({
    isOpen,
    onDaily,
    onInfinite,
}: IndexModalProps) {
    const [isClosing, setIsClosing] = useState(false)
    const [dailyCount, setDailyCount] = useState<number | null>(null)

    useEffect(() => {
        if (isOpen) {
            setIsClosing(false)
            getDailyCount()
                .then(setDailyCount)
                .catch(() => setDailyCount(0))
        }
    }, [isOpen])

    if (!isOpen) {
        return null
    }

    const meshGradient =
        'linear-gradient(115deg, #fc67fa 0%, #f4c4f3 43%,#7fd6fb 67%, #7f53ac 100%)'

    const handleDaily = () => {
        setIsClosing(true)
        setTimeout(() => {
            onDaily()
        }, 300)
    }

    const handleInfinite = () => {
        onInfinite()
    }

    return (
        <div
            className={`fixed inset-0 z-[500] flex items-center justify-center bg-[#e6e6e3] transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        >
            <div
                className={`flex w-full max-w-2xl flex-col items-center px-6 text-center transition-transform duration-300 ${isClosing ? 'scale-95' : 'scale-100'}`}
            >
                <div className='mb-8 flex items-center justify-center'>
                    <Image
                        src='/images/idolguessr-logo.png'
                        alt='IdolGuessr Logo'
                        width={200}
                        height={200}
                        className='h-auto w-auto'
                    />
                </div>

                <p className='text-4xl'>
                    Guess your favorite K-pop idol in 6 tries.
                </p>

                <div className='mt-8 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center'>
                    <button
                        onClick={handleDaily}
                        className='w-full max-w-[180px] cursor-pointer rounded-full bg-white px-6 py-3 font-semibold'
                    >
                        Daily
                    </button>
                    <button
                        onClick={handleInfinite}
                        className='w-full max-w-[180px] cursor-pointer rounded-full px-6 py-3 font-semibold text-black'
                        style={{ background: meshGradient }}
                    >
                        Infinite
                    </button>
                </div>

                <h1 className='mt-6 text-lg font-bold'>
                    {new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </h1>
                <p className='text-lg'>Daily no. {dailyCount ?? ''}</p>
            </div>
        </div>
    )
}
