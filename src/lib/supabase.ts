import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface DailyImage {
  id: number
  file_name: string
  created_at?: string
  updated_at?: string
}

export async function getDailyImage(): Promise<DailyImage | null> {
  try {
    const { data, error } = await supabase
      .from('dailies')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('Error fetching daily image:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching daily image:', error)
    return null
  }
}


