import { useState } from 'react'

type GroupFilter = 'boy-group' | 'girl-group' | null

interface InfiniteStartModalProps {
    isOpen: boolean
    onStart: (filter: GroupFilter) => void
    onClose: () => void
}

export default function InfiniteStartModal({
    isOpen,
    onStart,
    onClose,
}: InfiniteStartModalProps) {
    const [selectedFilter, setSelectedFilter] = useState<GroupFilter>(null)
    if (!isOpen) return null

    const handleStart = () => {
        onStart(selectedFilter === null ? null : selectedFilter)
    }

    return (
        <div className='fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4'>
            <div className='modal-fade-in relative w-full max-w-md rounded-lg bg-white p-6'>
                <div className='mb-6 flex items-center justify-between'>
                    <h2 className='text-2xl font-bold uppercase'>
                        Choose Group Type
                    </h2>
                    <button
                        onClick={onClose}
                        className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200'
                        aria-label='Close Modal'
                    >
                        <svg
                            className='h-4 w-4 text-gray-600'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M6 18L18 6M6 6l12 12'
                            />
                        </svg>
                    </button>
                </div>

                <div className='space-y-4'>
                    <button
                        onClick={() => setSelectedFilter('boy-group')}
                        className={`w-full cursor-pointer rounded-md border-2 px-3 py-2 text-left font-medium transition-all ${
                            selectedFilter === 'boy-group'
                                ? 'border-black bg-black text-white'
                                : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        Boy groups
                    </button>

                    <button
                        onClick={() => setSelectedFilter('girl-group')}
                        className={`w-full cursor-pointer rounded-md border-2 px-3 py-2 text-left font-medium transition-all ${
                            selectedFilter === 'girl-group'
                                ? 'border-black bg-black text-white'
                                : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        Girl groups
                    </button>

                    <button
                        onClick={() => setSelectedFilter(null)}
                        className={`w-full cursor-pointer rounded-md border-2 px-3 py-2 text-left font-medium transition-all ${
                            selectedFilter === null
                                ? 'border-black bg-black text-white'
                                : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        Both
                    </button>
                </div>

                <div className='mt-6 flex gap-3'>
                    <button
                        onClick={onClose}
                        className='flex-1 cursor-pointer rounded-full border-2 border-gray-200 bg-white px-4 py-1.5 text-gray-900 transition-colors hover:bg-gray-200'
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleStart}
                        className='flex-1 cursor-pointer rounded-full bg-black px-4 py-1.5 text-white transition-all hover:bg-black/80'
                    >
                        Start
                    </button>
                </div>
            </div>
        </div>
    )
}
