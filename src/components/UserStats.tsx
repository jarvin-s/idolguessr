'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'

export interface DailyCompletion {
    date: string
    imageId: number
    completed: boolean
    won: boolean
    guessCount: number
    correctAnswer: string
}

export interface DailyProgress {
    date: string
    imageId: number
    guesses: Array<'correct' | 'incorrect' | 'empty'>
}

export interface UserStats {
    totalGames: number
    totalWins: number
    currentStreak: number
    maxStreak: number
    guessDistribution: { [key: number]: number }
    lastPlayedDate: string
    todayCompleted: boolean
    dailyCompletions: { [key: string]: DailyCompletion }
}

const defaultStats: UserStats = {
    totalGames: 0,
    totalWins: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
    lastPlayedDate: '',
    todayCompleted: false,
    dailyCompletions: {},
}

export function useUserStats() {
    const [stats, setStats] = useState<UserStats>(defaultStats)
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        const loadStats = () => {
            try {
                const savedStats = localStorage.getItem('idol-guessr-stats')
                if (savedStats) {
                    const parsedStats = JSON.parse(savedStats)

                    const today = new Date().toDateString()
                    const lastPlayed = parsedStats.lastPlayedDate

                    if (lastPlayed !== today) {
                        parsedStats.todayCompleted = false
                    }

                    if (!parsedStats.dailyCompletions) {
                        parsedStats.dailyCompletions = {}
                    }

                    setStats(parsedStats)
                }
            } catch (error) {
                console.error('Error loading stats from localStorage:', error)
                setStats(defaultStats)
            } finally {
                setIsLoaded(true)
            }
        }

        loadStats()
    }, [])

    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem('idol-guessr-stats', JSON.stringify(stats))
            } catch (error) {
                console.error('Error saving stats to localStorage:', error)
            }
        }
    }, [stats, isLoaded])

    const updateStats = (
        won: boolean,
        guessCount: number,
        imageId?: number,
        correctAnswer?: string
    ) => {
        const today = new Date().toDateString()

        setStats((prevStats) => {
            // Check if today's game was already completed - prevent double counting
            if (prevStats.dailyCompletions[today]?.completed) {
                return prevStats
            }

            const newStats = {
                ...prevStats,
                guessDistribution: { ...prevStats.guessDistribution },
                dailyCompletions: { ...prevStats.dailyCompletions },
            }

            newStats.totalGames += 1
            newStats.lastPlayedDate = today
            newStats.todayCompleted = true

            if (imageId && correctAnswer) {
                newStats.dailyCompletions[today] = {
                    date: today,
                    imageId,
                    completed: true,
                    won,
                    guessCount: won ? guessCount : 0,
                    correctAnswer,
                }
            }

            if (won) {
                newStats.totalWins += 1
                newStats.guessDistribution[guessCount] += 1

                if (
                    prevStats.lastPlayedDate === today ||
                    new Date(prevStats.lastPlayedDate).getTime() ===
                        new Date(today).getTime() - 86400000
                ) {
                    newStats.currentStreak += 1
                } else {
                    newStats.currentStreak = 1
                }

                newStats.maxStreak = Math.max(
                    newStats.maxStreak,
                    newStats.currentStreak
                )
            } else {
                newStats.currentStreak = 0
            }

            return newStats
        })
    }

    const getTodayCompletion = useCallback((): DailyCompletion | null => {
        const today = new Date().toDateString()
        return stats.dailyCompletions[today] || null
    }, [stats.dailyCompletions])

    const isTodayCompleted = useCallback((): boolean => {
        const today = new Date().toDateString()
        return stats.dailyCompletions[today]?.completed || false
    }, [stats.dailyCompletions])

    const saveDailyProgress = useCallback(
        (
            imageId: number,
            guesses: Array<'correct' | 'incorrect' | 'empty'>
        ) => {
            try {
                const today = new Date().toDateString()
                const progress: DailyProgress = {
                    date: today,
                    imageId,
                    guesses,
                }
                localStorage.setItem(
                    'idol-guessr-daily-progress',
                    JSON.stringify(progress)
                )
            } catch (error) {
                console.error('Error saving daily progress:', error)
            }
        },
        []
    )

    const loadDailyProgress = useCallback((): DailyProgress | null => {
        try {
            const today = new Date().toDateString()
            const savedProgress = localStorage.getItem(
                'idol-guessr-daily-progress'
            )
            if (savedProgress) {
                const progress: DailyProgress = JSON.parse(savedProgress)
                // Only return progress if it's from today
                if (progress.date === today) {
                    return progress
                }
            }
        } catch (error) {
            console.error('Error loading daily progress:', error)
        }
        return null
    }, [])

    const clearDailyProgress = useCallback(() => {
        try {
            localStorage.removeItem('idol-guessr-daily-progress')
        } catch (error) {
            console.error('Error clearing daily progress:', error)
        }
    }, [])

    return {
        stats,
        isLoaded,
        updateStats,
        getTodayCompletion,
        isTodayCompleted,
        saveDailyProgress,
        loadDailyProgress,
        clearDailyProgress,
    }
}

interface UserStatsProps {
    stats: UserStats
    isLoaded: boolean
    className?: string
}

export default function UserStats({
    stats,
    isLoaded,
    className = '',
}: UserStatsProps) {
    if (!isLoaded) {
        return (
            <div className={`animate-pulse ${className}`}>
                <div className='rounded-lg bg-gray-200 p-4'>
                    <div className='mb-2 h-4 rounded bg-gray-300'></div>
                    <div className='mb-2 h-4 rounded bg-gray-300'></div>
                    <div className='h-4 rounded bg-gray-300'></div>
                </div>
            </div>
        )
    }

    const winPercentage =
        stats.totalGames > 0
            ? Math.round((stats.totalWins / stats.totalGames) * 100)
            : 0

    return (
        <div className={`rounded-lg bg-white p-10 shadow-lg ${className}`}>
            <div className='mb-10 flex items-center justify-center'>
                <Image
                    src='/images/idolguessr-logo.png'
                    alt='IdolGuessr Logo'
                    width={150}
                    height={50}
                    className='h-20 w-auto'
                />
            </div>
            <div className='mb-4 flex items-center justify-between'>
                <h2 className='text-xl font-bold text-gray-900 uppercase'>
                    Statistics
                </h2>
            </div>

            {/* Main Stats Grid */}
            <div className='mb-6 flex flex-row justify-center gap-4'>
                <div className='text-center'>
                    <div className='text-2xl font-bold text-gray-900'>
                        {stats.totalGames}
                    </div>
                    <div className='text-sm text-gray-600'>Played</div>
                </div>
                <div className='text-center'>
                    <div className='text-2xl font-bold text-gray-900'>
                        {winPercentage}%
                    </div>
                    <div className='text-sm text-gray-600'>Win %</div>
                </div>
                <div className='text-center'>
                    <div className='text-2xl font-bold text-gray-900'>
                        {stats.currentStreak}
                    </div>
                    <div className='text-sm text-gray-600'>Current streak</div>
                </div>
                <div className='text-center'>
                    <div className='text-2xl font-bold text-gray-900'>
                        {stats.maxStreak}
                    </div>
                    <div className='text-sm text-gray-600'>Max streak</div>
                </div>
            </div>

            {/* Guess Distribution */}
            {stats.totalWins > 0 && (
                <>
                    <h3 className='mb-3 text-lg font-semibold text-gray-900 uppercase'>
                        Guess distribution
                    </h3>
                    <div className='space-y-2'>
                        {Object.entries(stats.guessDistribution).map(
                            ([guesses, count]) => {
                                const percentage =
                                    stats.totalWins > 0
                                        ? (count / stats.totalWins) * 100
                                        : 0
                                return (
                                    <div
                                        key={guesses}
                                        className='flex items-center'
                                    >
                                        <div className='w-4 text-sm font-medium text-gray-600'>
                                            {guesses}
                                        </div>
                                        <div className='relative mx-2 h-6 flex-1 rounded-full bg-gray-200'>
                                            <div
                                                className='flex h-6 items-center justify-end rounded-full bg-green-400 pr-2'
                                                style={{
                                                    width: `${Math.min(Math.max(percentage, 8), 100)}%`,
                                                }}
                                            >
                                                {count > 0 && (
                                                    <span className='text-xs font-bold text-white'>
                                                        {count}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
