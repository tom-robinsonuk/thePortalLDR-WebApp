'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import MiniMoodDisplay from '@/components/MiniMoodDisplay';
import TeddyCouple from '@/components/TeddyCouple';
import BoredomBuster from '@/components/BoredomBuster';
import BottomNav from '@/components/BottomNav';
import HugCountdown from '@/components/HugCountdown';

export default function Home() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const userId = 'tom';
    const partnerId = 'arty';

    return (
        <main className="min-h-screen flex flex-col p-4 pb-24">
            <div className="portal-container space-y-5">
                {/* Floating Decorations */}
                <AnimatePresence>
                    {isMounted && (
                        <>
                            <motion.div
                                className="fixed top-10 left-6 text-3xl opacity-40 pointer-events-none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.4, y: [0, -12, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            >
                                💕
                            </motion.div>
                            <motion.div
                                className="fixed top-20 right-6 text-2xl opacity-30 pointer-events-none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.3, y: [0, -8, 0] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            >
                                ✨
                            </motion.div>
                            <motion.div
                                className="fixed bottom-28 right-8 text-xl opacity-25 pointer-events-none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.25, rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                                🌸
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Header (includes Bears) */}
                <Header />

                {/* Hug Countdown Dashboard */}
                <HugCountdown />

                {/* Mini Mood Status Display */}
                <MiniMoodDisplay userId={userId} partnerId={partnerId} />

                {/* Anti-Boredom Engine */}
                <BoredomBuster />
            </div>

            {/* Bottom Navigation */}
            <BottomNav />
        </main>
    );
}
