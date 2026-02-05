'use client';

import { motion } from 'framer-motion';
import { MoodType } from '@/lib/supabase';

interface TeddyBearEmojiProps {
    mood: MoodType;
    isSelected: boolean;
    onClick: () => void;
    size?: 'sm' | 'md' | 'lg';
}

// Mood configurations
export const moodConfig: Record<MoodType, { label: string; color: string; bgColor: string }> = {
    happy: { label: 'Happy!', color: '#FFD93D', bgColor: 'bg-yellow-100' },
    sleepy: { label: 'Sleepy...', color: '#B4A7D6', bgColor: 'bg-purple-100' },
    sad: { label: 'Sad...', color: '#87CEEB', bgColor: 'bg-blue-100' },
    flirty: { label: 'Flirty~', color: '#FFB6C1', bgColor: 'bg-pink-100' },
    love: { label: 'In Love!', color: '#FF6B6B', bgColor: 'bg-red-100' },
    hungry: { label: 'Hungry!', color: '#FFA500', bgColor: 'bg-orange-100' },
    angry: { label: 'Grumpy!', color: '#FF4444', bgColor: 'bg-red-200' },
    busy: { label: 'Busy...', color: '#6B7280', bgColor: 'bg-gray-100' },
};

// SVG Teddy Bear Face Component
function TeddyFace({ mood, color }: { mood: MoodType; color: string }) {
    const baseColor = '#D4A574';
    const darkColor = '#B8956E';
    const noseColor = '#8B4513';

    return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Ears */}
            <circle cx="20" cy="20" r="15" fill={darkColor} />
            <circle cx="80" cy="20" r="15" fill={darkColor} />
            <circle cx="20" cy="20" r="8" fill={baseColor} />
            <circle cx="80" cy="20" r="8" fill={baseColor} />

            {/* Face */}
            <circle cx="50" cy="55" r="40" fill={baseColor} />

            {/* Muzzle */}
            <ellipse cx="50" cy="65" rx="20" ry="15" fill="#F5DEB3" />

            {/* Nose */}
            <ellipse cx="50" cy="58" rx="6" ry="5" fill={noseColor} />

            {/* Happy */}
            {mood === 'happy' && (
                <>
                    <path d="M 35 45 Q 40 40 45 45" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <path d="M 55 45 Q 60 40 65 45" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <circle cx="28" cy="55" r="6" fill="#FFB6C1" opacity="0.6" />
                    <circle cx="72" cy="55" r="6" fill="#FFB6C1" opacity="0.6" />
                    <path d="M 42 70 Q 50 78 58 70" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
                </>
            )}

            {/* Sleepy */}
            {mood === 'sleepy' && (
                <>
                    <line x1="32" y1="45" x2="45" y2="45" stroke="#333" strokeWidth="3" strokeLinecap="round" />
                    <line x1="55" y1="45" x2="68" y2="45" stroke="#333" strokeWidth="3" strokeLinecap="round" />
                    <text x="75" y="25" fontSize="10" fill={color} fontWeight="bold">z</text>
                    <text x="82" y="18" fontSize="8" fill={color} fontWeight="bold">z</text>
                    <ellipse cx="50" cy="72" rx="5" ry="3" fill="#333" />
                </>
            )}

            {/* Sad */}
            {mood === 'sad' && (
                <>
                    <circle cx="38" cy="45" r="5" fill="#333" />
                    <circle cx="62" cy="45" r="5" fill="#333" />
                    <circle cx="38" cy="44" r="2" fill="white" />
                    <circle cx="62" cy="44" r="2" fill="white" />
                    <ellipse cx="32" cy="55" r="3" ry="5" fill="#87CEEB" />
                    <ellipse cx="68" cy="55" r="3" ry="5" fill="#87CEEB" />
                    <line x1="30" y1="35" x2="42" y2="38" stroke="#333" strokeWidth="2" strokeLinecap="round" />
                    <line x1="70" y1="35" x2="58" y2="38" stroke="#333" strokeWidth="2" strokeLinecap="round" />
                    <path d="M 42 75 Q 50 68 58 75" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
                </>
            )}

            {/* Flirty */}
            {mood === 'flirty' && (
                <>
                    <path d="M 32 45 Q 38 40 45 45" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <circle cx="62" cy="45" r="5" fill="#333" />
                    <circle cx="62" cy="44" r="2" fill="white" />
                    <line x1="56" y1="38" x2="58" y2="41" stroke="#333" strokeWidth="1.5" />
                    <line x1="62" y1="36" x2="62" y2="40" stroke="#333" strokeWidth="1.5" />
                    <line x1="68" y1="38" x2="66" y2="41" stroke="#333" strokeWidth="1.5" />
                    <circle cx="28" cy="55" r="6" fill="#FFB6C1" opacity="0.7" />
                    <circle cx="72" cy="55" r="6" fill="#FFB6C1" opacity="0.7" />
                    <path d="M 42 70 Q 50 78 58 70" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
                </>
            )}

            {/* Love */}
            {mood === 'love' && (
                <>
                    <path d="M 38 42 C 33 37, 28 42, 38 52 C 48 42, 43 37, 38 42" fill="#FF6B6B" />
                    <path d="M 62 42 C 57 37, 52 42, 62 52 C 72 42, 67 37, 62 42" fill="#FF6B6B" />
                    <path d="M 80 25 C 78 23, 76 25, 80 29 C 84 25, 82 23, 80 25" fill="#FFB6C1" opacity="0.8" />
                    <path d="M 20 30 C 18 28, 16 30, 20 34 C 24 30, 22 28, 20 30" fill="#FFB6C1" opacity="0.6" />
                    <path d="M 42 70 Q 50 78 58 70" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
                </>
            )}

            {/* Hungry */}
            {mood === 'hungry' && (
                <>
                    <circle cx="38" cy="45" r="5" fill="#333" />
                    <circle cx="62" cy="45" r="5" fill="#333" />
                    <circle cx="38" cy="44" r="2" fill="white" />
                    <circle cx="62" cy="44" r="2" fill="white" />
                    {/* Drooling mouth */}
                    <ellipse cx="50" cy="72" rx="8" ry="5" fill="#333" />
                    <path d="M 55 75 Q 58 82 56 88" stroke="#87CEEB" strokeWidth="3" fill="none" strokeLinecap="round" />
                    {/* Sparkle eyes looking at food */}
                    <circle cx="38" cy="43" r="1" fill="white" />
                    <circle cx="62" cy="43" r="1" fill="white" />
                </>
            )}

            {/* Angry */}
            {mood === 'angry' && (
                <>
                    <circle cx="38" cy="45" r="5" fill="#333" />
                    <circle cx="62" cy="45" r="5" fill="#333" />
                    <circle cx="38" cy="44" r="2" fill="white" />
                    <circle cx="62" cy="44" r="2" fill="white" />
                    {/* Angry eyebrows */}
                    <line x1="28" y1="38" x2="45" y2="32" stroke="#333" strokeWidth="3" strokeLinecap="round" />
                    <line x1="72" y1="38" x2="55" y2="32" stroke="#333" strokeWidth="3" strokeLinecap="round" />
                    {/* Grumpy mouth */}
                    <path d="M 40 74 L 50 70 L 60 74" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
                    {/* Angry vein */}
                    <path d="M 75 15 L 78 18 L 82 15 L 78 12 Z" fill={color} />
                </>
            )}

            {/* Busy */}
            {mood === 'busy' && (
                <>
                    {/* Focused eyes */}
                    <circle cx="38" cy="45" r="4" fill="#333" />
                    <circle cx="62" cy="45" r="4" fill="#333" />
                    <circle cx="38" cy="44" r="1.5" fill="white" />
                    <circle cx="62" cy="44" r="1.5" fill="white" />
                    {/* Slightly stressed eyebrows */}
                    <line x1="30" y1="35" x2="45" y2="37" stroke="#333" strokeWidth="2" strokeLinecap="round" />
                    <line x1="70" y1="35" x2="55" y2="37" stroke="#333" strokeWidth="2" strokeLinecap="round" />
                    {/* Neutral/focused mouth */}
                    <line x1="44" y1="72" x2="56" y2="72" stroke="#333" strokeWidth="2" strokeLinecap="round" />
                    {/* Sweat drop */}
                    <ellipse cx="78" cy="45" r="3" ry="5" fill="#87CEEB" opacity="0.7" />
                </>
            )}
        </svg>
    );
}

export default function TeddyBearEmoji({ mood, isSelected, onClick, size = 'md' }: TeddyBearEmojiProps) {
    const config = moodConfig[mood];

    const sizeClasses = {
        sm: 'w-14 h-14',
        md: 'w-16 h-16',
        lg: 'w-20 h-20',
    };

    return (
        <motion.button
            onClick={onClick}
            className={`
                ${sizeClasses[size]} 
                ${config.bgColor}
                rounded-full p-2
                flex items-center justify-center
                transition-all duration-200
                ${isSelected
                    ? 'ring-4 ring-portal-pink ring-offset-2 ring-offset-white shadow-lg scale-110'
                    : 'hover:scale-105 shadow-md'
                }
            `}
            whileHover={{ scale: isSelected ? 1.1 : 1.08 }}
            whileTap={{ scale: 0.95 }}
            animate={isSelected ? { y: [0, -5, 0] } : {}}
            transition={isSelected ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : {}}
        >
            <TeddyFace mood={mood} color={config.color} />
        </motion.button>
    );
}
