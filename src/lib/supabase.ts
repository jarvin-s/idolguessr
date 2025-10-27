import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface DailyImage {
  id: number
  name: string
  group_type: string
  play_date?: string
  img_bucket: string
  created_at?: string
  updated_at?: string
  group_name?: string
  group_category?: string
  base64_group?: string
  base64_idol?: string
}

export interface CurrentDaily {
  id: number;
  name: string;
  group_type: string;
  play_date: string;
  img_bucket: string;
  end_at: string;
  server_now: string;
}

export interface Feedback {
  id: number;
  message: string;
  category: string;
  created_at?: string;
}

export async function getDailyImage(): Promise<CurrentDaily | null> {
  const { data, error } = await supabase.rpc('get_current_daily');
  if (error || !data?.length) {
    console.error('get_current_daily error:', error);
    return null;
  }
  return data[0] as CurrentDaily;
}

export async function getRandomUnlimitedImage(): Promise<DailyImage | null> {
  const { data, error } = await supabase.rpc('get_random_unlimited');
  if (error || !data?.length) {
    console.error('get_random_unlimited error:', error);
    return null;
  }
  return data[0] as DailyImage;
}

export async function getMultipleRandomUnlimitedImages(count: number): Promise<DailyImage[]> {
  const images: DailyImage[] = [];
  const promises = Array(count).fill(null).map(() => supabase.rpc('get_random_unlimited'));

  const results = await Promise.all(promises);
  console.log('results', results);
  for (const result of results) {
    if (result.data?.length) {
      images.push(result.data[0] as DailyImage);
    }
  }

  return images;
}

export async function insertNewFeedback(feedback: Feedback): Promise<void> {
  const { error } = await supabase.from('feedback').insert({
    message: feedback.message,
    category: feedback.category,
    created_at: new Date().toISOString(),
  })
  if (error) {
    console.log('insert_new_feedback error:', error.message)
    return
  }
}

export function getImageUrl(
  groupType: string,
  imgBucket: string,
  guessNumber: number | 'clear',
  mode: 'daily' | 'unlimited' = 'daily',
  groupCategory?: string,
  base64Group?: string,
): string {
  const fileName = guessNumber === 'clear' ? 'clear.png' : `00${guessNumber}.png`

  if (mode === 'unlimited' && groupCategory && base64Group && imgBucket) {
    return `${supabaseUrl}/storage/v1/object/public/images/unlimited/${groupCategory}/${base64Group}/${imgBucket}/${fileName}`
  }

  return `${supabaseUrl}/storage/v1/object/public/images/${mode}/${groupType}/${imgBucket}/${fileName}`
}

export interface GuessTrackingData {
  session_id: string
  image_id: number
  guess_text: string
  is_correct: boolean
  guess_number: number
  guess_time: string
  time_since_previous_guess: number | null
  user_agent: string | null
  device_type: string | null
  browser: string | null
}

function getDeviceType(userAgent: string): string {
  if (/mobile/i.test(userAgent)) return 'mobile'
  if (/tablet|ipad/i.test(userAgent)) return 'tablet'
  return 'desktop'
}

function getBrowser(userAgent: string): string {
  if (/edg/i.test(userAgent)) return 'edge'
  if (/chrome/i.test(userAgent)) return 'chrome'
  if (/firefox/i.test(userAgent)) return 'firefox'
  if (/safari/i.test(userAgent)) return 'safari'
  return 'other'
}

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''

  let sessionId = sessionStorage.getItem('idol-guessr-session-id')
  if (!sessionId) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      sessionId = crypto.randomUUID()
    } else {
      sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }
    sessionStorage.setItem('idol-guessr-session-id', sessionId)
  }
  return sessionId
}

let lastGuessTime: number | null = null

export async function trackGuess(
  imageId: number,
  guessText: string,
  isCorrect: boolean,
  guessNumber: number
): Promise<void> {
  try {
    const now = Date.now()
    const timeSincePrevious = lastGuessTime
      ? Number(((now - lastGuessTime) / 1000).toFixed(1))
      : null
    lastGuessTime = now

    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null

    const guessData: GuessTrackingData = {
      session_id: getOrCreateSessionId(),
      image_id: imageId,
      guess_text: guessText,
      is_correct: isCorrect,
      guess_number: guessNumber,
      guess_time: new Date().toISOString(),
      time_since_previous_guess: timeSincePrevious,
      user_agent: userAgent,
      device_type: userAgent ? getDeviceType(userAgent) : null,
      browser: userAgent ? getBrowser(userAgent) : null,
    }

    await supabase.from('guess_tracking').insert(guessData)
  } catch (error) {
    console.error('Error tracking guess:', error)
  }
}

export function resetGuessTimer(): void {
  lastGuessTime = null
}
