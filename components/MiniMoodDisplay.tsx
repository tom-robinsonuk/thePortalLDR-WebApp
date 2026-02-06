'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { createClient } from '@/utils/supabase/client';
import { MoodType, MoodRecord } from '@/lib/supabase';
import { getUserMood } from '@/lib/moodStore'; // Fallback
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

// ... (No changes to SVG helpers)

// SVG Accessories
function SleepingCap() {
    return (
        <svg viewBox="0 0 100 100" className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <path d="M 30 15 Q 15 35 25 50 L 75 50 Q 85 35 70 15 L 50 5 Z" fill="#B4A7D6" stroke="#5D5A6D" strokeWidth="2" />
            <circle cx="50" cy="5" r="6" fill="white" stroke="#5D5A6D" strokeWidth="2" />
            <rect x="25" y="45" width="50" height="8" rx="4" fill="white" stroke="#5D5A6D" strokeWidth="1" />
        </svg>
    );
}

function Sunglasses() {
    return (
        <svg viewBox="0 0 100 100" className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <path d="M 25 40 Q 35 40 45 45 L 55 45 Q 65 40 75 40 L 80 38 L 80 50 Q 70 58 55 50 L 45 50 Q 30 58 20 50 L 20 38 Z" fill="#333" />
            <line x1="20" y1="40" x2="10" y2="35" stroke="#333" strokeWidth="3" />
            <line x1="80" y1="40" x2="90" y2="35" stroke="#333" strokeWidth="3" />
            <line x1="45" y1="45" x2="55" y2="45" stroke="#333" strokeWidth="2" />
        </svg>
    );
}

function MoodBubble({ mood, position }: { mood: MoodType; position: 'left' | 'right' }) {
    const config = moodConfig[mood];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`
        absolute -top-2 ${position === 'left' ? '-left-2' : '-right-2'}
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
function MiniTeddyFace({ mood, isAsleep, isCool }: { mood: MoodType | null; isAsleep?: boolean; isCool?: boolean }) {
    if (!mood) {
        return (
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center relative">
                <span className="text-2xl">🐻</span>
                {isAsleep && (
                    <div className="absolute -top-3 right-0">
                        <span className="text-xs font-bold text-purple-400 animate-pulse">Zzz</span>
                    </div>
                )}
                {isAsleep && <div className="absolute inset-0 opacity-80"><SleepingCap /></div>}
                {isCool && <div className="absolute inset-0 opacity-90"><Sunglasses /></div>}
            </div>
        );
    }

    return (
        <motion.div
            className={`w-14 h-14 rounded-full ${moodColors[mood]} flex items-center justify-center shadow-md relative overflow-visible`}
            animate={isAsleep ? { scale: [1, 1.02, 1] } : { scale: [1, 1.05, 1] }}
            transition={{ duration: isAsleep ? 3 : 2, repeat: Infinity, ease: "easeInOut" }}
        >
            <span className="text-2xl">{moodEmojis[mood]}</span>

            {/* Sleeping Overlay */}
            {isAsleep && (
                <>
                    <motion.div
                        className="absolute -top-4 -right-2 text-xs font-bold text-purple-500"
                        animate={{ opacity: [0, 1, 0], y: [0, -5, -10], x: [0, 5, 10] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        Zzz...
                    </motion.div>
                    <div className="absolute -top-2 left-0 w-full h-full scale-110">
                        <SleepingCap />
                    </div>
                </>
            )}

            {/* Sunglasses Overlay */}
            {isCool && (
                <div className="absolute top-0 left-0 w-full h-full scale-90 translate-y-1">
                    <Sunglasses />
                </div>
            )}
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
    const { userName, partnerName, partnerTimezone } = useUser();
    const [isPartnerAsleep, setIsPartnerAsleep] = useState(false);
    const [isPartnerCool, setIsPartnerCool] = useState(false);

    const supabase = createClient();

    // Calculate Partner's time status
    useEffect(() => {
        const checkPartnerTime = () => {
            const now = new Date();
            const utcHours = now.getUTCHours();
            const offset = parseFloat(partnerTimezone || "0");

            // Calculate partner's hour (0-23)
            let partnerHour = (utcHours + offset) % 24;
            if (partnerHour < 0) partnerHour += 24;

            // Sleeping logic: 22:00 (10 PM) to 07:00 (7 AM)
            if (partnerHour >= 22 || partnerHour < 7) {
                setIsPartnerAsleep(true);
                setIsPartnerCool(false);
            } else {
                setIsPartnerAsleep(false);
                // Cool for 10:00 - 16:00
                if (partnerHour >= 10 && partnerHour <= 16) {
                    setIsPartnerCool(true);
                } else {
                    setIsPartnerCool(false);
                }
            }
        };

        checkPartnerTime();
        const interval = setInterval(checkPartnerTime, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [partnerTimezone]);

    // Supabase realtime subscription
    useEffect(() => {
        async function fetchMoods() {
            try {
                const { data } = await supabase
                    .from('moods')
                    .select('*')
                    .in('user_id', [userId, partnerId]);

                data?.forEach((record: MoodRecord) => {
                    if (record.user_id === userId) setMyMood(record.mood as MoodType);
                    else if (record.user_id === partnerId) setPartnerMood(record.mood as MoodType);
                });
            } catch (e) {
                console.error("Fetch moods failed", e);
            }
        }

        fetchMoods();

        const channel = supabase
            .channel('mini-moods')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'moods' }, (payload) => {
                const record = payload.new as MoodRecord;
                if (record.user_id === userId) setMyMood(record.mood as MoodType);
                else if (record.user_id === partnerId) setPartnerMood(record.mood as MoodType);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [userId, partnerId, supabase]);

    const neitherHasMood = !myMood && !partnerMood;

    return (
        <Link href="/mood">
            <motion.div
                className="bg-white/40 backdrop-blur-sm rounded-[2rem] p-5 cursor-pointer shadow-sm border border-white/50 w-full max-w-sm mx-auto"
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
                            <p className="text-xs font-medium text-[var(--text-secondary)] mt-1">{userName}</p>
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
                            <MiniTeddyFace
                                mood={partnerMood}
                                isAsleep={isPartnerAsleep}
                                isCool={isPartnerCool}
                            />
                            <p className="text-xs font-medium text-[var(--text-secondary)] mt-1">{partnerName}</p>
                        </div>
                    </div>
                )}
            </motion.div>
        </Link>
    );
}
