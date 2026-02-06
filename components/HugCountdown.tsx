'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { Heart } from 'lucide-react';

export default function HugCountdown() {
    const { meetDate, userName, partnerName } = useUser();
    const [daysLeft, setDaysLeft] = useState(0);

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date();
            const target = new Date(meetDate);
            // Reset hours to start of day for cleaner day calculation
            now.setHours(0, 0, 0, 0);
            target.setHours(0, 0, 0, 0);

            const diffTime = target.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setDaysLeft(diffDays);
        };

        calculateTime();
        // Recalculate every hour roughly, no need for seconds here
        const interval = setInterval(calculateTime, 1000 * 60 * 60);
        return () => clearInterval(interval);
    }, [meetDate]);

    // Animation Calculation
    // Scale: 100 days = 100% distance (edges)
    // 0 days = 0% distance (center)
    // We want them to meet in the middle.
    // Left Bear: Starts at 0%, goes to 50% (minus offset)
    // Right Bear: Starts at 100%, goes to 50% (plus offset)

    const maxDays = 100;
    const progress = Math.max(0, Math.min(daysLeft, maxDays)); // 0 to 100
    const percentage = progress / maxDays; // 0.0 to 1.0 (0 = meet, 1 = far)

    // Visual positioning
    // 1.0 (Far) -> Left Bear at 0%, Right Bear at 100%
    // 0.0 (Meet) -> Left Bear at 40%, Right Bear at 60% (Center with slight gap/touch)

    // We can use CSS `left` percentage.
    // Left Bear: Range 0% to 42%
    // Right Bear: Range 100% to 58%

    const leftPos = (1 - percentage) * 42; // When percentage is 1 (far), pos is 0. When 0 (meet), pos is 42.
    const rightPos = 100 - ((1 - percentage) * 42);

    return (
        <div className="w-full max-w-sm mx-auto mt-2 mb-4">
            {/* Soft Cloud Container */}
            <div className="bg-white/40 backdrop-blur-sm rounded-[2rem] px-6 py-4 shadow-sm border border-white/50 relative overflow-hidden">

                {/* Cute Track - Dotted line with floating hearts */}
                <div className="absolute top-1/2 left-8 right-8 h-0.5 border-t-2 border-dashed border-portal-pink/30 -translate-y-1/2" />
                <motion.div
                    className="absolute top-1/4 left-1/4 text-purple-200"
                    animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                >
                    ☁️
                </motion.div>
                <motion.div
                    className="absolute bottom-1/4 right-1/4 text-pink-200"
                    animate={{ y: [0, 5, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 4, repeat: Infinity }}
                >
                    ✨
                </motion.div>

                {/* Bears Container */}
                <div className="relative h-16 w-full mb-2">
                    {/* Left Bear (User) */}
                    <motion.div
                        className="absolute top-1 w-12 h-12 flex flex-col items-center z-10"
                        animate={{
                            left: `${leftPos}%`,
                            rotate: daysLeft <= 5 ? 15 : 0 // Tilt forward when close
                        }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <span className="text-4xl transform -scale-x-100 block filter drop-shadow-sm hover:scale-110 transition-transform">
                            🐻
                        </span>
                    </motion.div>

                    {/* Heart in Middle (visible when close) */}
                    <motion.div
                        className="absolute top-3 left-1/2 -translate-x-1/2 z-0"
                        animate={{
                            opacity: daysLeft <= 0 ? 1 : Math.max(0, 1 - percentage * 1.5),
                            scale: daysLeft <= 0 ? [1, 1.2, 1] : 0.8
                        }}
                        transition={{ duration: 0.5, repeat: daysLeft <= 0 ? Infinity : 0 }}
                    >
                        <Heart className="w-8 h-8 text-portal-pink fill-portal-pink drop-shadow-md" />
                    </motion.div>

                    {/* Right Bear (Partner) */}
                    <motion.div
                        className="absolute top-1 w-12 h-12 flex flex-col items-center z-10"
                        animate={{
                            left: `${rightPos}%`,
                            x: '-100%',
                            rotate: daysLeft <= 5 ? -15 : 0 // Tilt forward when close
                        }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <span className="text-4xl block filter drop-shadow-sm hover:scale-110 transition-transform">
                            🐻‍❄️
                        </span>
                    </motion.div>
                </div>

                {/* Text Display - Floating Pill */}
                <div className="text-center relative z-10 -mt-2">
                    {daysLeft > 0 ? (
                        <div className="flex flex-col items-center">
                            <motion.div
                                className="bg-white/80 backdrop-blur border border-pink-100 px-4 py-1.5 rounded-full shadow-sm text-portal-pink"
                                whileHover={{ scale: 1.05 }}
                            >
                                <span className="font-bold text-sm">{daysLeft} days</span>
                                <span className="text-xs ml-1 text-portal-pink/80">until we hug!</span>
                            </motion.div>
                        </div>
                    ) : (
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <h3 className="text-sm font-bold text-white bg-portal-pink px-4 py-1.5 rounded-full shadow-md">
                                Time to hug! 🎉
                            </h3>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
