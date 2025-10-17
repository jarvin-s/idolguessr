'use client'

import { useState, useEffect, useCallback } from 'react'
import { DailyImage } from '@/lib/supabase'
import {
    useUserStats,
    DailyCompletion,
} from '@/components/UserStats'

interface GameProgressHook {
    guesses: Array<'correct' | 'incorrect' | 'empty'>
    setGuesses: React.Dispatch<
        React.SetStateAction<Array<'correct' | 'incorrect' | 'empty'>>
    >
    gameWon: boolean
    setGameWon: React.Dispatch<React.SetStateAction<boolean>>
    gameLost: boolean
    setGameLost: React.Dispatch<React.SetStateAction<boolean>>
    todayCompleted: boolean
    todayCompletionData: DailyCompletion | null
    stats: ReturnType<typeof useUserStats>['stats']
    statsLoaded: boolean
    handleGameWin: (guessNumber: number) => void
    handleGameLoss: () => void
    saveProgress: (newGuesses: Array<'correct' | 'incorrect' | 'empty'>) => void
}

export function useGameProgress(
    dailyImage: DailyImage | null,
    correctAnswer: string
): GameProgressHook {
    const [guesses, setGuesses] = useState<
        Array<'correct' | 'incorrect' | 'empty'>
    >(['empty', 'empty', 'empty', 'empty', 'empty', 'empty'])
    const [gameWon, setGameWon] = useState(false)
    const [gameLost, setGameLost] = useState(false)
    const [todayCompleted, setTodayCompleted] = useState(false)
    const [todayCompletionData, setTodayCompletionData] =
        useState<DailyCompletion | null>(null)

    const {
        stats,
        isLoaded: statsLoaded,
        updateStats,
        getTodayCompletion,
        isTodayCompleted,
        saveDailyProgress,
        loadDailyProgress,
        clearDailyProgress,
    } = useUserStats()

    useEffect(() => {
        if (statsLoaded && dailyImage) {
            const completed = isTodayCompleted()
            const completionData = getTodayCompletion()

            if (completed && completionData && completionData.imageId === dailyImage.id) {
                setTodayCompleted(true)
                setTodayCompletionData(completionData)

                if (completionData.won) {
                    setGameWon(true)
                    const newGuesses: Array<
                        'correct' | 'incorrect' | 'empty'
                    > = [
                        'empty',
                        'empty',
                        'empty',
                        'empty',
                        'empty',
                        'empty',
                    ]
                    for (
                        let i = 0;
                        i < completionData.guessCount - 1;
                        i++
                    ) {
                        newGuesses[i] = 'incorrect'
                    }
                    newGuesses[completionData.guessCount - 1] = 'correct'
                    setGuesses(newGuesses)
                } else {
                    setGameLost(true)
                    setGuesses([
                        'incorrect',
                        'incorrect',
                        'incorrect',
                        'incorrect',
                        'incorrect',
                        'incorrect',
                    ])
                }
            } else {
                // Game not completed, try to load progress
                const progress = loadDailyProgress()
                if (progress && progress.imageId === dailyImage.id) {
                    setGuesses(progress.guesses)
                } else {
                    setTodayCompleted(false)
                    setTodayCompletionData(null)
                }
            }
        }
    }, [
        statsLoaded,
        dailyImage,
        isTodayCompleted,
        getTodayCompletion,
        loadDailyProgress,
    ])

    const handleGameWin = useCallback(
        (guessNumber: number) => {
            updateStats(true, guessNumber, dailyImage?.id, correctAnswer)
            clearDailyProgress()
        },
        [updateStats, dailyImage, correctAnswer, clearDailyProgress]
    )

    const handleGameLoss = useCallback(() => {
        updateStats(false, 0, dailyImage?.id, correctAnswer)
        clearDailyProgress()
    }, [updateStats, dailyImage, correctAnswer, clearDailyProgress])

    const saveProgress = useCallback(
        (newGuesses: Array<'correct' | 'incorrect' | 'empty'>) => {
            if (dailyImage?.id) {
                saveDailyProgress(dailyImage.id, newGuesses)
            }
        },
        [dailyImage, saveDailyProgress]
    )

    return {
        guesses,
        setGuesses,
        gameWon,
        setGameWon,
        gameLost,
        setGameLost,
        todayCompleted,
        todayCompletionData,
        stats,
        statsLoaded,
        handleGameWin,
        handleGameLoss,
        saveProgress,
    }
}

