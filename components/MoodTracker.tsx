'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import TeddyBearEmoji, { moodConfig } from './TeddyBearEmoji';
import { useUser } from '@/context/UserContext';
import { MoodType, MoodRecord } from '@/lib/supabase';
import { setMood as setLocalMood, getUserMood } from '@/lib/moodStore'; // Keep local for offline support/fallback if desired
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MoodTrackerProps {
    userId: string;
    partnerId: string;
}

const moods: MoodType[] = ['happy', 'sleepy', 'sad', 'flirty', 'love', 'hungry', 'angry', 'busy'];

export default function MoodTracker({ userId, partnerId }: MoodTrackerProps) {
    const { partnerName } = useUser();
    const [myMood, setMyMood] = useState<MoodType | null>(null);
    const [partnerMood, setPartnerMood] = useState<MoodType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);

    const supabase = createClient();
    const [coupleId, setCoupleId] = useState<string | null>(null);

    // Fetch Couple ID
    useEffect(() => {
        const fetchCouple = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('couple_id')
                .eq('id', userId)
                .single();
            if (data?.couple_id) setCoupleId(data.couple_id);
        };
        fetchCouple();
    }, [userId, supabase]);

    // Fetch initial moods
    useEffect(() => {
        async function fetchMoods() {
            try {
                // Try fetching from real DB first
                const { data, error } = await supabase
                    .from('moods')
                    .select('*')
                    .in('user_id', [userId, partnerId]);

                if (!error && data) {
                    data.forEach((record: MoodRecord) => {
                        if (record.user_id === userId) setMyMood(record.mood as MoodType);
                        else if (record.user_id === partnerId) setPartnerMood(record.mood as MoodType);
                    });
                }
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchMoods();
    }, [userId, partnerId, supabase]);

    // Subscribe to realtime updates
    useEffect(() => {
        const channel = supabase
            .channel('room1')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'moods' }, (payload) => {
                const record = payload.new as MoodRecord;
                if (record.user_id === userId) setMyMood(record.mood as MoodType);
                else if (record.user_id === partnerId) setPartnerMood(record.mood as MoodType);
            })
            .on('broadcast', { event: 'mood-update' }, ({ payload }) => {
                if (payload.userId === userId) setMyMood(payload.mood);
                else if (payload.userId === partnerId) setPartnerMood(payload.mood);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [userId, partnerId, supabase]);

    // Update mood
    const handleMoodSelect = async (mood: MoodType) => {
        if (isSaving) return;

        setIsSaving(true);
        setMyMood(mood);

        try {
            const payload: any = {
                user_id: userId,
                mood,
                updated_at: new Date().toISOString()
            };
            // Only add couple_id if we have it (we should)
            if (coupleId) payload.couple_id = coupleId;

            console.log('Attempting to save mood with payload:', payload);

            const { error } = await supabase
                .from('moods')
                .upsert(payload, { onConflict: 'user_id' });

            if (error) {
                console.error('Supabase Mood Save Error:', JSON.stringify(error, null, 2));
                throw error;
            }

            // Broadcast Signal Flare for instant UI update
            await supabase.channel('room1').send({
                type: 'broadcast',
                event: 'mood-update',
                payload: { userId, mood }
            });

        } catch (err) {
            console.error('Full Error Object:', err);
        } finally {
            setIsSaving(false);
        }
    };

    // Scroll slider
    const scroll = (direction: 'left' | 'right') => {
        if (!sliderRef.current) return;
        const scrollAmount = 100;
        sliderRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    if (isLoading) {
        return (
            <div className="glass-card p-6 text-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="inline-block text-3xl">
                    🐻
                </motion.div>
                <p className="mt-2 text-[var(--text-secondary)]">Loading...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* My Mood Section */}
            <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 text-center">
                    How are you feeling? 💭
                </h2>

                {/* Slider Controls */}
                <div className="relative">
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-white/80 rounded-full shadow-md hover:bg-white"
                    >
                        <ChevronLeft className="w-5 h-5 text-[var(--text-primary)]" />
                    </button>

                    {/* Mood Slider */}
                    <div
                        ref={sliderRef}
                        className="flex gap-3 overflow-x-auto scrollbar-hide px-8 py-2 snap-x snap-mandatory"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {moods.map((mood) => (
                            <div key={mood} className="snap-center flex-shrink-0">
                                <TeddyBearEmoji
                                    mood={mood}
                                    isSelected={myMood === mood}
                                    onClick={() => handleMoodSelect(mood)}
                                    size="md"
                                />
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-white/80 rounded-full shadow-md hover:bg-white"
                    >
                        <ChevronRight className="w-5 h-5 text-[var(--text-primary)]" />
                    </button>
                </div>

                {/* Current Mood Label */}
                <AnimatePresence mode="wait">
                    {myMood && (
                        <motion.div
                            key={myMood}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-4 text-center"
                        >
                            <span
                                className="inline-block px-4 py-2 rounded-full text-sm font-medium"
                                style={{ backgroundColor: `${moodConfig[myMood].color}30` }}
                            >
                                Feeling {moodConfig[myMood].label}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Hint */}
                <p className="text-center text-xs text-[var(--text-secondary)] mt-3 opacity-60">
                    Swipe or use arrows to see more ←→
                </p>
            </motion.div>

            {/* Partner's Mood Section */}
            <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 text-center">
                    {partnerName} is... 💕
                </h2>

                {partnerMood ? (
                    <div className="flex flex-col items-center">
                        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                            <TeddyBearEmoji mood={partnerMood} isSelected={true} onClick={() => { }} size="lg" />
                        </motion.div>
                        <motion.span
                            className="mt-3 inline-block px-4 py-2 rounded-full text-sm font-medium"
                            style={{ backgroundColor: `${moodConfig[partnerMood].color}30` }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            Feeling {moodConfig[partnerMood].label}
                        </motion.span>
                    </div>
                ) : (
                    <p className="text-center text-[var(--text-secondary)] text-sm">
                        Waiting for them to share... 🥺
                    </p>
                )}
            </motion.div>
        </div>
    );
}
