'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Settings } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import SettingsModal from './SettingsModal';
import TeddyCouple from './TeddyCouple';

export default function Header() {
    const { userName, partnerName } = useUser();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <>
            <motion.header
                className="text-center py-6 relative"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                {/* Settings Button */}
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="absolute right-4 top-6 p-2 text-[var(--text-secondary)] opacity-50 hover:opacity-100 transition-opacity"
                >
                    <Settings className="w-5 h-5" />
                </button>

                <TeddyCouple />
                <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-1 -mt-2">
                    Together, even when apart 💕
                </h1>
                <p className="text-xs text-[var(--text-secondary)] opacity-70">
                    {userName} & {partnerName}'s little space
                </p>
            </motion.header>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </>
    );
}
