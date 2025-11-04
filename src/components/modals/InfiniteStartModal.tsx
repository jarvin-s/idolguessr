import { useState } from 'react'

type GroupFilter = 'boy-group' | 'girl-group' | null

interface InfiniteStartModalProps {
    isOpen: boolean
    onStart: (filter: GroupFilter) => void
}

export default function InfiniteStartModal({ isOpen, onStart }: InfiniteStartModalProps) {
    const [selectedFilter, setSelectedFilter] = useState<GroupFilter>(null)
    if (!isOpen) return null

    const meshGradient = 'linear-gradient(115deg, #fc67fa 0%, #f4c4f3 43%,#7fd6fb 67%, #7f53ac 100%)'

    return (
        <div className='fixed inset-0 z-[400] flex items-center justify-center bg-black/60 p-4'>
            <div className='relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl'>
                <div className='mb-4 text-center'>
                    <h1 className='text-2xl font-bold uppercase'>Start Infinite Mode</h1>
                    <p className='mt-1 text-sm text-gray-600'>Choose a filter. You cannot change it mid-game.</p>
                </div>

                <div className='space-y-2'>
                    <button
                        onClick={() => setSelectedFilter('boy-group')}
                        className={`w-full rounded-lg border-2 px-4 py-3 text-left font-medium transition-all ${
                            selectedFilter === 'boy-group'
                                ? 'border-transparent text-white'
                                : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        style={selectedFilter === 'boy-group' ? { background: meshGradient } : {}}
                    >
                        Boy Group
                    </button>

                    <button
                        onClick={() => setSelectedFilter('girl-group')}
                        className={`w-full rounded-lg border-2 px-4 py-3 text-left font-medium transition-all ${
                            selectedFilter === 'girl-group'
                                ? 'border-transparent text-white'
                                : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        style={selectedFilter === 'girl-group' ? { background: meshGradient } : {}}
                    >
                        Girl Group
                    </button>

                    <button
                        onClick={() => setSelectedFilter(null)}
                        className={`w-full rounded-lg border-2 px-4 py-3 text-left font-medium transition-all ${
                            selectedFilter === null
                                ? 'border-transparent text-white'
                                : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        style={selectedFilter === null ? { background: meshGradient } : {}}
                    >
                        Both
                    </button>
                </div>

                <button
                    onClick={() => onStart(selectedFilter)}
                    className='mt-6 w-full cursor-pointer rounded-lg border-2 px-4 py-3 font-bold text-white'
                    style={{ background: meshGradient, borderColor: 'transparent' }}
                >
                    Start Infinite
                </button>
            </div>
        </div>
    )
}


