'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Confetti from 'react-confetti';

import PixelatedImage from '@/components/PixelatedImage';
import OnScreenKeyboard from '@/components/OnScreenKeyboard';
import { getDailyImage, type DailyImage as DailyRow } from '@/lib/supabase';

export default function Home() {
  // GAME STATE
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState<Array<'correct' | 'incorrect' | 'empty'>>(
    ['empty', 'empty', 'empty', 'empty', 'empty', 'empty']
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [showGuessText, setShowGuessText] = useState(true);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // UI / LAYOUT
  const [isLoading, setIsLoading] = useState(true);
  const [dailyImage, setDailyImage] = useState<DailyRow | null>(null);
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });

  // COUNTDOWN & FLIP
  const [timer, setTimer] = useState('00:00:00');
  const serverOffsetRef = useRef<number>(0);      // (server_now - Date.now())
  const tickIntervalRef = useRef<number | null>(null);
  const flipTimeoutRef  = useRef<number | null>(null);

  // DERIVED
  const remainingGuesses = guesses.filter((g) => g === 'empty').length;
  const gameOver = remainingGuesses === 0 && !gameWon;
  const pixelationLevel = gameWon || gameOver ? 0 : remainingGuesses;

  // --- helpers ---
  function formatMs(ms: number) {
    const clamped = Math.max(0, ms);
    const s = Math.floor(clamped / 1000);
    const hh = String(Math.floor(s / 3600)).padStart(2, '0');
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  function clearTimers() {
    if (tickIntervalRef.current) { clearInterval(tickIntervalRef.current); tickIntervalRef.current = null; }
    if (flipTimeoutRef.current)  { clearTimeout(flipTimeoutRef.current);   flipTimeoutRef.current = null; }
  }

  async function loadCurrent() {
    setIsLoading(true);
    const row = await getDailyImage();
    setIsLoading(false);

    if (!row) return;

    setDailyImage(row);
    if (row.name) setCorrectAnswer(row.name.toUpperCase());

    // anchor to server clock
    const serverNowMs = new Date(row.server_now).getTime();
    serverOffsetRef.current = serverNowMs - Date.now();

    // schedule countdown + exact flip at end_at
    scheduleCountdownAndFlip(row.end_at);
  }

  function scheduleCountdownAndFlip(endAtISO: string) {
    clearTimers();
    const endAtMs = new Date(endAtISO).getTime();

    // live countdown (ticks every 1s using server-anchored time)
    tickIntervalRef.current = window.setInterval(() => {
      const approxServerNow = Date.now() + serverOffsetRef.current;
      const remaining = endAtMs - approxServerNow;
      setTimer(formatMs(remaining));
      if (remaining <= 0) {
        // if interval hits zero first, flip immediately
        void flipNow();
      }
    }, 1000);

    // precise one-shot flip at midnight
    const delayMs = Math.max(0, endAtMs - (Date.now() + serverOffsetRef.current));
    flipTimeoutRef.current = window.setTimeout(() => {
      void flipNow();
    }, delayMs);
  }

  async function flipNow() {
    clearTimers();

    // reset game state for the new day
    setCurrentGuess('');
    setGuesses(['empty', 'empty', 'empty', 'empty', 'empty', 'empty']);
    setIsAnimating(false);
    setShowGuessText(true);
    setShowConfetti(false);
    setGameWon(false);

    // fetch the new daily (now that it’s after end_at)
    const next = await getDailyImage();
    if (!next) return;

    setDailyImage(next);
    if (next.name) setCorrectAnswer(next.name.toUpperCase());

    // reschedule for tomorrow
    scheduleCountdownAndFlip(next.end_at);
  }

  // --- keyboard handling ---
  const handleKeyPress = useCallback((key: string) => {
    if (key === 'ENTER') {
      if (currentGuess.trim() && guesses.some((g) => g === 'empty') && !isAnimating) {
        const normalizedGuess = currentGuess.toUpperCase().trim();
        const isCorrect = normalizedGuess === correctAnswer;

        setIsAnimating(true);

        if (!isCorrect) {
          setTimeout(() => {
            setShowGuessText(false);
            const emptyIndex = guesses.findIndex((g) => g === 'empty');
            setGuesses((prev) => {
              const next = [...prev];
              next[emptyIndex] = 'incorrect';
              return next;
            });
            setTimeout(() => {
              setCurrentGuess('');
              setShowGuessText(true);
              setIsAnimating(false);
            }, 300);
          }, 500);
        } else {
          const emptyIndex = guesses.findIndex((g) => g === 'empty');
          setGameWon(true);
          setShowConfetti(true);
          setIsAnimating(false);
          setGuesses((prev) => {
            const next = [...prev];
            next[emptyIndex] = 'correct';
            return next;
          });
        }
      }
    } else if (key === '✕') {
      if (!gameWon) setCurrentGuess((prev) => prev.slice(0, -1));
    } else {
      if (guesses.some((g) => g === 'empty') && !isAnimating && !gameWon) {
        setCurrentGuess((prev) => prev + key);
      }
    }
  }, [currentGuess, guesses, correctAnswer, isAnimating, gameWon]);

  useEffect(() => {
    const handlePhysicalKeyPress = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();

      if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
        event.preventDefault();
      }

      if (key === 'ENTER') {
        handleKeyPress('ENTER');
      } else if (key === 'BACKSPACE') {
        handleKeyPress('✕');
      } else if (/^[A-Z]$/.test(key)) {
        handleKeyPress(key);
      }
    };

    window.addEventListener('keydown', handlePhysicalKeyPress);
    return () => window.removeEventListener('keydown', handlePhysicalKeyPress);
  }, [handleKeyPress]);

  // initial load + resync on focus/visibility
  useEffect(() => {
    let mounted = true;
    (async () => mounted && (await loadCurrent()))();
    const onFocus = () => { void loadCurrent(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      mounted = false;
      clearTimers();
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, []);

  // resize for confetti
  useEffect(() => {
    const update = () => setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div className='flex h-screen flex-col overflow-hidden bg-white'>
      <div className='mx-auto flex h-full w-full max-w-none flex-col sm:max-w-md sm:shadow-lg'>
         {/* Header - Two 50% sections */}
         <div className='mb-2 flex w-full flex-shrink-0 items-center p-4'>
           {/* Left Section - Logo (50%) */}
           <div className='flex w-1/2 items-center justify-start'>
             <Image src='/images/idolguessr-logo.png' alt='IdolGuessr Logo' width={150} height={50} className='h-10 w-auto' />
           </div>

           {/* Right Section - Timer + Stats (50%) */}
           <div className='flex w-1/2 items-center justify-end gap-3'>
             {/* Timer */}
             <div className='flex flex-col items-end text-right'>
               <div className='text-xs font-medium text-gray-400'>NEXT IDOL</div>
               <div className='font-mono text-lg font-bold text-black leading-none'>{timer}</div>
             </div>

             {/* Stats Button */}
             <button
               className='flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 transition-colors hover:bg-gray-200'
               aria-label='View Statistics'
             >
               <svg className='h-5 w-5 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                 <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                   d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
               </svg>
             </button>
           </div>
         </div>

        {/* Body */}
        <div className='flex w-full flex-1 flex-col px-4'>
          <div className='flex w-full flex-col items-center'>
            <div className='relative mb-3 w-full sm:mx-auto sm:max-w-md'>
              <div className='aspect-square w-full overflow-hidden rounded-lg'>
                {isLoading ? (
                  <div className='flex h-full w-full items-center justify-center'>
                    <div className='text-gray-400'>Loading...</div>
                  </div>
                ) : dailyImage ? (
                  <PixelatedImage
                    src={dailyImage.file_name}
                    alt='Daily idol'
                    width={500}
                    height={500}
                    pixelationLevel={pixelationLevel}
                  />
                ) : (
                  <div className='flex h-full w-full items-center justify-center'>
                    <div className='text-gray-400'>No image available</div>
                  </div>
                )}
              </div>
            </div>

            {/* Guess Indicators */}
            <div className='grid w-full grid-cols-6 gap-2 sm:mx-auto sm:max-w-md'>
              {guesses.map((guess, index) => (
                <div
                  key={`${index}-${guess}`}
                  className={`flex aspect-square items-center justify-center rounded-[5px] ${
                    guess === 'correct'
                      ? 'square-pop-animation bg-green-400'
                      : guess === 'incorrect'
                        ? 'square-pop-animation bg-black'
                        : 'bg-gray-200'
                  }`}
                >
                  {guess === 'incorrect' && (
                    <span className='text-base font-bold text-white'>✕</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Current Guess */}
          <div className='flex flex-1 items-center justify-center'>
            {showGuessText && (
              <div
                className={`text-4xl font-bold tracking-wider ${
                  gameWon ? 'text-green-500' : 'text-black'
                } ${isAnimating && !gameWon ? 'shake-animation fade-out-animation' : ''}`}
              >
                {currentGuess}
              </div>
            )}
          </div>

          {/* Virtual Keyboard */}
          <OnScreenKeyboard onKeyPress={handleKeyPress} className='pb-4' />
        </div>
      </div>

      {/* Confetti */}
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
  );
}
