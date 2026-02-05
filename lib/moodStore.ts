// Simple mood store for demo mode (persists in localStorage)
// When Supabase is configured, this will sync via database instead

import { MoodType } from './supabase';

const STORAGE_KEY = 'portal_moods';

interface MoodStore {
    [userId: string]: MoodType | null;
}

// Get moods from localStorage
export function getMoods(): MoodStore {
    if (typeof window === 'undefined') return {};

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

// Set a mood in localStorage
export function setMood(userId: string, mood: MoodType): void {
    if (typeof window === 'undefined') return;

    const moods = getMoods();
    moods[userId] = mood;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(moods));

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('moodUpdated', { detail: { userId, mood } }));
}

// Get a specific user's mood
export function getUserMood(userId: string): MoodType | null {
    const moods = getMoods();
    return moods[userId] || null;
}
