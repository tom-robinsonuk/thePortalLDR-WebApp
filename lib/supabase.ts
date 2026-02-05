import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey &&
    supabaseUrl !== 'your-project-url-here' &&
    supabaseAnonKey !== 'your-anon-key-here');

// Create client only if configured, otherwise null
export const supabase: SupabaseClient | null = isSupabaseConfigured
    ? createClient(supabaseUrl!, supabaseAnonKey!)
    : null;

// Types for our mood tracker
export type MoodType = 'happy' | 'sleepy' | 'sad' | 'flirty' | 'love' | 'hungry' | 'angry' | 'busy';

export interface MoodRecord {
    id: string;
    user_id: string;
    mood: MoodType;
    updated_at: string;
}
