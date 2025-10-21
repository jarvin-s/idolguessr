import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface DailyImage {
  id: number
  name: string
  group_type: string
  play_date: string
  created_at?: string
  updated_at?: string
}

export interface CurrentDaily {
  id: number;
  name: string;
  group_type: string;
  play_date: string;
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

// Construct bucket URL for images based on date, group type, and guess number
export function getImageUrl(groupType: string, playDate: string, guessNumber: number | 'clear'): string {
  // Convert play_date (2025-10-22) to folder format (211025)
  const date = new Date(playDate)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const year = String(date.getFullYear()).slice(-2) // Last 2 digits of year
  const folderDate = `${day}${month}${year}`
  
  const fileName = guessNumber === 'clear' ? 'clear.png' : `00${guessNumber}.png`
  
  return `${supabaseUrl}/storage/v1/object/public/images/${groupType}/${folderDate}/${fileName}`
}
