'use client';

import { motion } from 'framer-motion';

// Romantic teddy bear couple artwork
export default function TeddyCouple() {
    return (
        <motion.div
            className="flex justify-center py-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
            >
                {/* Two bears together */}
                <svg viewBox="0 0 200 120" className="w-48 h-auto">
                    {/* Left Bear (Pink bow) */}
                    <g transform="translate(30, 20)">
                        {/* Ears */}
                        <circle cx="12" cy="12" r="12" fill="#D4A574" />
                        <circle cx="48" cy="12" r="12" fill="#D4A574" />
                        <circle cx="12" cy="12" r="6" fill="#C19A6B" />
                        <circle cx="48" cy="12" r="6" fill="#C19A6B" />
                        {/* Head */}
                        <circle cx="30" cy="40" r="30" fill="#D4A574" />
                        {/* Muzzle */}
                        <ellipse cx="30" cy="48" rx="12" ry="10" fill="#F5DEB3" />
                        {/* Nose */}
                        <ellipse cx="30" cy="44" rx="4" ry="3" fill="#8B4513" />
                        {/* Eyes - Happy */}
                        <path d="M 20 35 Q 23 30 26 35" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
                        <path d="M 34 35 Q 37 30 40 35" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
                        {/* Smile */}
                        <path d="M 24 52 Q 30 58 36 52" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
                        {/* Blush */}
                        <circle cx="15" cy="42" r="5" fill="#FFB6C1" opacity="0.6" />
                        <circle cx="45" cy="42" r="5" fill="#FFB6C1" opacity="0.6" />
                        {/* Pink bow */}
                        <path d="M 45 8 Q 52 3 55 10 Q 52 12 48 10 Q 52 12 55 20 Q 52 17 45 12 Z" fill="#FFB6C1" />
                        <circle cx="50" cy="12" r="3" fill="#FF69B4" />
                    </g>

                    {/* Right Bear (Blue bow tie) */}
                    <g transform="translate(110, 20)">
                        {/* Ears */}
                        <circle cx="12" cy="12" r="12" fill="#D4A574" />
                        <circle cx="48" cy="12" r="12" fill="#D4A574" />
                        <circle cx="12" cy="12" r="6" fill="#C19A6B" />
                        <circle cx="48" cy="12" r="6" fill="#C19A6B" />
                        {/* Head */}
                        <circle cx="30" cy="40" r="30" fill="#D4A574" />
                        {/* Muzzle */}
                        <ellipse cx="30" cy="48" rx="12" ry="10" fill="#F5DEB3" />
                        {/* Nose */}
                        <ellipse cx="30" cy="44" rx="4" ry="3" fill="#8B4513" />
                        {/* Eyes - Loving */}
                        <path d="M 23 35 C 20 30, 16 33, 23 40 C 30 33, 26 30, 23 35" fill="#FF6B6B" />
                        <path d="M 37 35 C 34 30, 30 33, 37 40 C 44 33, 40 30, 37 35" fill="#FF6B6B" />
                        {/* Smile */}
                        <path d="M 24 52 Q 30 58 36 52" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
                        {/* Blush */}
                        <circle cx="15" cy="42" r="5" fill="#FFB6C1" opacity="0.6" />
                        <circle cx="45" cy="42" r="5" fill="#FFB6C1" opacity="0.6" />
                        {/* Blue bow tie */}
                        <path d="M 20 70 L 30 75 L 20 80 Z" fill="#87CEEB" />
                        <path d="M 40 70 L 30 75 L 40 80 Z" fill="#87CEEB" />
                        <circle cx="30" cy="75" r="4" fill="#5DADE2" />
                    </g>

                    {/* Love heart between them */}
                    <motion.g
                        transform="translate(88, 35)"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <path d="M 12 8 C 6 0, -2 6, 12 20 C 26 6, 18 0, 12 8" fill="#FF6B6B" />
                    </motion.g>

                    {/* Small floating hearts */}
                    <motion.path
                        d="M 40 10 C 38 7, 35 9, 40 15 C 45 9, 42 7, 40 10"
                        fill="#FFB6C1"
                        opacity="0.7"
                        animate={{ y: [0, -5, 0], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                    <motion.path
                        d="M 160 15 C 158 12, 155 14, 160 20 C 165 14, 162 12, 160 15"
                        fill="#FFB6C1"
                        opacity="0.6"
                        animate={{ y: [0, -3, 0], opacity: [0.6, 0.9, 0.6] }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
                    />
                </svg>

            </motion.div>
        </motion.div>
    );
}
