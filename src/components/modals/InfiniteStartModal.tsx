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

                <div className='mt-6'>
                    <button
                        onClick={handleStart}
                        className='w-full cursor-pointer rounded-full bg-black px-4 py-1.5 text-white transition-all hover:bg-black/80'
                    >
                        Start
                    </button>
                </div>
            </div>
        </div>
    )
}
