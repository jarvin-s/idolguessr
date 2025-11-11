import { useState, useEffect } from 'react'

interface FilterModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (filter: 'boy-group' | 'girl-group' | null) => void
}

export default function FilterModal({
    isOpen,
    onClose,
    onConfirm,
}: FilterModalProps) {
    const [selectedFilter, setSelectedFilter] = useState<
        'boy-group' | 'girl-group' | null
    >(null)

    useEffect(() => {
        if (isOpen) {
            try {
                const savedFilter = localStorage.getItem(
                    'idol-guessr-group-filter'
                )
                if (
                    savedFilter === 'boy-group' ||
                    savedFilter === 'girl-group'
                ) {
                    setSelectedFilter(savedFilter)
                } else {
                    setSelectedFilter(null)
                }
            } catch {
                setSelectedFilter(null)
            }
        }
    }, [isOpen])

    if (!isOpen) return null

    const meshGradient =
        'linear-gradient(115deg, #fc67fa 0%, #f4c4f3 43%,#7fd6fb 67%, #7f53ac 100%)'

    const handleConfirm = () => {
        onConfirm(selectedFilter === null ? null : selectedFilter)
    }

    return (
        <div className='fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4'>
            <div className='modal-fade-in relative w-full max-w-md rounded-lg bg-white p-6'>
                <div className='mb-6 flex items-center justify-between'>
                    <h2 className='text-2xl font-bold text-gray-900 uppercase'>
                        Filter
                    </h2>
                    <button
                        onClick={onClose}
                        className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200'
                        aria-label='Close Filter'
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
                    <div className='text-sm font-medium tracking-wide text-gray-700 uppercase'>
                        Group Type
                    </div>

                    <div className='space-y-2'>
                        <button
                            onClick={() => setSelectedFilter('boy-group')}
                            className={`w-full rounded-lg border-2 px-4 py-3 text-left font-medium transition-all ${
                                selectedFilter === 'boy-group'
                                    ? 'border-transparent text-white'
                                    : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                            style={
                                selectedFilter === 'boy-group'
                                    ? { background: meshGradient }
                                    : {}
                            }
                        >
                            Boy groups
                        </button>

                        <button
                            onClick={() => setSelectedFilter('girl-group')}
                            className={`w-full rounded-lg border-2 px-4 py-3 text-left font-medium transition-all ${
                                selectedFilter === 'girl-group'
                                    ? 'border-transparent text-white'
                                    : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                            style={
                                selectedFilter === 'girl-group'
                                    ? { background: meshGradient }
                                    : {}
                            }
                        >
                            Girl groups
                        </button>

                        <button
                            onClick={() => setSelectedFilter(null)}
                            className={`w-full rounded-lg border-2 px-4 py-3 text-left font-medium transition-all ${
                                selectedFilter === null
                                    ? 'border-transparent text-white'
                                    : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                            style={
                                selectedFilter === null
                                    ? { background: meshGradient }
                                    : {}
                            }
                        >
                            Both
                        </button>
                    </div>

                    <div className='mt-6 flex gap-3'>
                        <button
                            onClick={onClose}
                            className='flex-1 rounded-lg border-2 border-gray-200 bg-white px-4 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-50'
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            className='flex-1 rounded-lg border-2 px-4 py-3 font-medium text-white transition-all'
                            style={{
                                background: meshGradient,
                                borderColor: 'transparent',
                            }}
                        >
                            Start
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
