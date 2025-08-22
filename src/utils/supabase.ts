import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Optional: Create a server-side client for admin operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Function to log chat interactions
export async function logChatInteraction(
  userFingerprint: string,
  userInput: string,
  systemOutput: string
) {
  try {
    const { error } = await supabaseAdmin
      .from('chat_logs')
      .insert({
        user_fingerprint: userFingerprint,
        user_input: userInput,
        system_output: systemOutput
      })

    if (error) {
      console.error('Error logging chat interaction:', error)
    }
  } catch (error) {
    console.error('Failed to log chat interaction:', error)
  }
}
