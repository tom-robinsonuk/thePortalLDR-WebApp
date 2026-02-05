'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase, isSupabaseConfigured, MoodType, MoodRecord } from '@/lib/supabase';
import { getUserMood } from '@/lib/moodStore';
import { moodConfig } from './TeddyBearEmoji';

// Mood emojis for mini display
const moodEmojis: Record<MoodType, string> = {
    happy: '😊',
    sleepy: '😴',
    sad: '😢',
    flirty: '😏',
    love: '😍',
    hungry: '🤤',
    angry: '😤',
    busy: '😓',
};

const moodColors: Record<MoodType, string> = {
    happy: 'bg-yellow-100',
    sleepy: 'bg-purple-100',
    sad: 'bg-blue-100',
    flirty: 'bg-pink-100',
    love: 'bg-red-100',
    hungry: 'bg-orange-100',
    angry: 'bg-red-200',
    busy: 'bg-gray-100',
};

// Floating speech bubble
function MoodBubble({ mood, position }: { mood: MoodType; position: 'left' | 'right' }) {
    const config = moodConfig[mood];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`
        absolute -top-8 ${position === 'left' ? '-left-2' : '-right-2'}
        px-2 py-1 rounded-xl text-xs font-medium
        shadow-sm whitespace-nowrap
      `}
            style={{ backgroundColor: `${config.color}40` }}
        >
            {config.label}
            {/* Bubble tail */}
            <div
                className={`absolute bottom-0 ${position === 'left' ? 'left-4' : 'right-4'} w-2 h-2 transform translate-y-1 rotate-45`}
                style={{ backgroundColor: `${config.color}40` }}
            />
        </motion.div>
    );
}

// Mini teddy face
function MiniTeddyFace({ mood }: { mood: MoodType | null }) {
    if (!mood) {
        return (
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-2xl">🐻</span>
            </div>
        );
    }

    return (
        <motion.div
            className={`w-14 h-14 rounded-full ${moodColors[mood]} flex items-center justify-center shadow-md`}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
            <span className="text-2xl">{moodEmojis[mood]}</span>
        </motion.div>
    );
}

interface MiniMoodDisplayProps {
    userId: string;
    partnerId: string;
}

export default function MiniMoodDisplay({ userId, partnerId }: MiniMoodDisplayProps) {
    const [myMood, setMyMood] = useState<MoodType | null>(null);
    const [partnerMood, setPartnerMood] = useState<MoodType | null>(null);

    // Fetch moods on mount and listen for updates
    useEffect(() => {
        function loadMoods() {
            if (!isSupabaseConfigured) {
                const storedMyMood = getUserMood(userId);
                const storedPartnerMood = getUserMood(partnerId);
                setMyMood(storedMyMood);
                setPartnerMood(storedPartnerMood);
            }
        }

        loadMoods();

        const handleMoodUpdate = () => loadMoods();
        window.addEventListener('moodUpdated', handleMoodUpdate);
        window.addEventListener('focus', handleMoodUpdate);

        return () => {
            window.removeEventListener('moodUpdated', handleMoodUpdate);
            window.removeEventListener('focus', handleMoodUpdate);
        };
    }, [userId, partnerId]);

    // Supabase realtime subscription
    useEffect(() => {
        if (!isSupabaseConfigured || !supabase) return;

        async function fetchMoods() {
            const { data } = await supabase!
                .from('moods')
                .select('*')
                .in('user_id', [userId, partnerId]);

            data?.forEach((record: MoodRecord) => {
                if (record.user_id === userId) setMyMood(record.mood);
                else if (record.user_id === partnerId) setPartnerMood(record.mood);
            });
        }

        fetchMoods();

        const channel = supabase
            .channel('mini-moods')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'moods' }, (payload) => {
                const record = payload.new as MoodRecord;
                if (record.user_id === userId) setMyMood(record.mood);
                else if (record.user_id === partnerId) setPartnerMood(record.mood);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [userId, partnerId]);

    const neitherHasMood = !myMood && !partnerMood;

    return (
        <Link href="/mood">
            <motion.div
                className="glass-card p-5 cursor-pointer hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {neitherHasMood ? (
                    <div className="text-center py-2">
                        <span className="text-3xl">🐻💭</span>
                        <p className="text-sm text-[var(--text-secondary)] mt-2">
                            Tap to share how you feel!
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-8">
                        {/* Me */}
                        <div className="text-center relative pt-6">
                            {myMood && <MoodBubble mood={myMood} position="left" />}
                            <MiniTeddyFace mood={myMood} />
                            <p className="text-xs font-medium text-[var(--text-secondary)] mt-1">Me</p>
                        </div>

                        {/* Heart */}
                        <motion.span
                            className="text-2xl"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            💕
                        </motion.span>

                        {/* Cutie */}
                        <div className="text-center relative pt-6">
                            {partnerMood && <MoodBubble mood={partnerMood} position="right" />}
                            <MiniTeddyFace mood={partnerMood} />
                            <p className="text-xs font-medium text-[var(--text-secondary)] mt-1">Cutie</p>
                        </div>
                    </div>
                )}
            </motion.div>
        </Link>
    );
}
