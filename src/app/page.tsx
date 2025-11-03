'use client'

import Confetti from 'react-confetti'
import OnScreenKeyboard from '@/components/input/OnScreenKeyboard'
import GameHeader from '@/components/game/GameHeader'
import GameImage from '@/components/game/GameImage'
import GuessInput from '@/components/game/GuessInput'
import StatsModal from '@/components/modals/StatsModal'
import HelpModal from '@/components/modals/HelpModal'
import FeedbackModal from '@/components/modals/FeedbackModal'
import WinModal from '@/components/modals/WinModal'
import { getImageUrl } from '@/lib/supabase'
import { useGameController } from '@/hooks/useGameController'

export default function Home() {
    const {
        gameMode,
        handleGameModeChange,
        timer,
        isLoading,
        dailyImage,
        remainingGuesses,
        gameWon,
        gameLost,
        guesses,
        currentGuess,
        correctAnswer,
        lastIncorrectGuess,
        isAnimating,
        handleKeyPress,
        showConfetti,
        windowDimensions,
        showStats,
        setShowStats,
        showHelp,
        setShowHelp,
        showFeedback,
        setShowFeedback,
        showWinModal,
        setShowWinModal,
        stats,
        statsLoaded,
        todayCompletionData,
        loadGuessAttempts,
        skipsRemaining,
        hintUsed,
        setHintUsed,
        hintUsedOnIdol,
        setHintUsedOnIdol,
        showStreakPopup,
        streakMilestone,
        setShowStreakPopup,
        showGameOver,
        handlePlayAgain,
        handleSkip,
        loadNextUnlimited,
        unlimitedCurrentStreak,
        unlimitedMaxStreak,
        unlimitedStatsData,
        unlimitedStatsLoaded,
    } = useGameController()

    return (
        <div className='fixed inset-0 flex flex-col justify-center overflow-hidden bg-white'>
            <div className='mx-auto flex h-full w-full max-w-none flex-col sm:max-h-[900px] sm:max-w-md sm:rounded-[15px] sm:border-1 sm:border-gray-200 sm:shadow-lg'>
                <GameHeader
                    timer={timer}
                    onShowStats={() => setShowStats(true)}
                    gameMode={gameMode}
                    onGameModeChange={handleGameModeChange}
                />

                <div className='flex min-h-0 w-full flex-1 flex-col px-4'>
                    <div className='flex min-h-0 w-full flex-1 flex-col items-center'>
                        <GameImage
                            isLoading={isLoading}
                            dailyImage={dailyImage}
                            remainingGuesses={remainingGuesses}
                            gameWon={gameWon}
                            gameLost={gameLost}
                            gameMode={gameMode}
                            onPass={
                                gameMode === 'unlimited' && !gameWon && !gameLost && skipsRemaining > 0
                                    ? handleSkip
                                    : undefined
                            }
                            skipsRemaining={skipsRemaining}
                            hintUsed={hintUsed}
                            hintUsedOnIdol={hintUsedOnIdol}
                            onHintUse={() => {
                                setHintUsed(true)
                                if (dailyImage?.img_bucket) setHintUsedOnIdol(dailyImage.img_bucket)
                            }}
                            showStreakPopup={showStreakPopup}
                            streakMilestone={streakMilestone}
                            onStreakPopupComplete={() =>
                                setShowStreakPopup(false)
                            }
                            currentStreak={
                                gameMode === 'unlimited' ? unlimitedCurrentStreak : 0
                            }
                            showGameOver={showGameOver}
                            highestStreak={unlimitedMaxStreak}
                            onPlayAgain={handlePlayAgain}
                            guesses={guesses}
                        />
                    </div>

                    <GuessInput
                        currentGuess={currentGuess}
                        correctAnswer={correctAnswer}
                        gameWon={gameWon}
                        gameLost={gameLost}
                        lastIncorrectGuess={lastIncorrectGuess}
                        isAnimating={isAnimating}
                    />

                    <OnScreenKeyboard onKeyPress={handleKeyPress} className='flex-shrink-0 pb-4' />
                </div>
            </div>

            <StatsModal
                isOpen={showStats}
                onClose={() => setShowStats(false)}
                onShowHelp={() => {
                    setShowStats(false)
                    setShowHelp(true)
                }}
                stats={gameMode === 'daily' ? stats : unlimitedStatsData}
                statsLoaded={gameMode === 'daily' ? statsLoaded : unlimitedStatsLoaded}
                gameMode={gameMode}
            />

            <HelpModal
                isOpen={showHelp}
                onClose={() => setShowHelp(false)}
                onShowFeedback={() => {
                    setShowFeedback(true)
                    setShowHelp(false)
                }}
            />

            <FeedbackModal
                isOpen={showFeedback}
                onClose={() => setShowFeedback(false)}
                onBack={() => {
                    setShowFeedback(false)
                    setShowHelp(true)
                }}
            />

            {gameMode === 'daily' && (
                <WinModal
                    isOpen={showWinModal}
                    onClose={() => setShowWinModal(false)}
                    idolName={correctAnswer}
                    imageUrl={
                        dailyImage
                            ? getImageUrl(
                                  dailyImage.group_type,
                                  dailyImage.img_bucket,
                                  'clear',
                                  gameMode,
                                  dailyImage.group_category,
                                  dailyImage.base64_group
                              )
                            : ''
                    }
                    pixelatedImageUrl={
                        dailyImage
                            ? getImageUrl(
                                  dailyImage.group_type,
                                  dailyImage.img_bucket,
                                  1,
                                  gameMode,
                                  dailyImage.group_category,
                                  dailyImage.base64_group
                              )
                            : ''
                    }
                    guessCount={
                        todayCompletionData?.guessCount ||
                        (6 - guesses.filter((g) => g === 'empty').length)
                    }
                    isWin={
                        todayCompletionData ? todayCompletionData.won : gameWon
                    }
                    guessAttempts={
                        todayCompletionData?.guessAttempts || loadGuessAttempts()
                    }
                    stats={{
                        gamesPlayed: stats.totalGames,
                        winPercentage:
                            stats.totalGames > 0
                                ? Math.round((stats.totalWins / stats.totalGames) * 100)
                                : 0,
                        currentStreak: stats.currentStreak,
                        maxStreak: stats.maxStreak,
                    }}
                    guessDistribution={[
                        stats.guessDistribution[1] || 0,
                        stats.guessDistribution[2] || 0,
                        stats.guessDistribution[3] || 0,
                        stats.guessDistribution[4] || 0,
                        stats.guessDistribution[5] || 0,
                        stats.guessDistribution[6] || 0,
                    ]}
                    gameMode={gameMode}
                    onNextUnlimited={loadNextUnlimited}
                />
            )}

            {showConfetti && windowDimensions.width > 0 && (
                <Confetti
                    width={windowDimensions.width}
                    height={windowDimensions.height}
                    recycle={false}
                    numberOfPieces={200}
                    gravity={0.3}
                />
            )}
        </div>
    )
}
