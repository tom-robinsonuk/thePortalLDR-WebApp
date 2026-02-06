'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface PokeButtonProps {
    userId: string;
    partnerId: string;
}

export default function PokeButton({ userId, partnerId }: PokeButtonProps) {
    const { partnerName } = useUser();
    const [isPoking, setIsPoking] = useState(false);
    const [showPokeEffect, setShowPokeEffect] = useState(false);

    // Listen for incoming pokes
    useEffect(() => {
        if (!isSupabaseConfigured || !supabase) return;

        const channel = supabase
            .channel('pokes')
            .on('broadcast', { event: 'poke' }, (payload) => {
                if (payload.payload.to === userId) {
                    triggerPokeReceive();
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [userId]);

    const triggerPokeReceive = () => {
        // Haptic Feedback: Double pulse
        // Note: iOS Safari requires user interaction to enable vibration first, 
        // effectively blocking this for background events unless screen is touched recently.
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }

        // Visual Feedback
        setShowPokeEffect(true);
        setTimeout(() => setShowPokeEffect(false), 2000);
    };

    const handlePoke = async () => {
        if (isPoking) return;
        setIsPoking(true);

        // Haptic feedback for sender (single blip)
        if (navigator.vibrate) navigator.vibrate(50);

        if (!isSupabaseConfigured || !supabase) {
            // DEMO MODE: Poke yourself to test receiving logic
            console.log("Demo Mode: Sending fake poke to self...");
            setTimeout(() => {
                triggerPokeReceive();
                setIsPoking(false);
            }, 500);
            return;
        }

        // Realtime Logic
        try {
            await supabase.channel('pokes').send({
                type: 'broadcast',
                event: 'poke',
                payload: { from: userId, to: partnerId },
            });
        } catch (err) {
            console.error('Failed to send poke', err);
        }

        setTimeout(() => setIsPoking(false), 1000);
    };

    return (
        <div className="w-full max-w-sm mx-auto mb-4 relative z-20">
            {/* Visual Effect Overlay - "You got poked!" */}
            <AnimatePresence>
                {showPokeEffect && (
                    <motion.div
                        className="absolute -top-12 left-0 right-0 text-center pointer-events-none z-50"
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1.2, y: 0 }}
                        exit={{ opacity: 0, scale: 1.5, y: -20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                        <span className="text-4xl filter drop-shadow-md">👉</span>
                        <div className="bg-white/90 backdrop-blur text-portal-pink font-bold px-4 py-1 rounded-full shadow-lg inline-block mt-2 border-2 border-portal-pink">
                            You got poked!
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* The Squishy Button */}
            <motion.button
                onClick={handlePoke}
                disabled={isPoking}
                className={`
                    w-full py-3 rounded-[2rem] font-bold text-lg
                    shadow-md border-2 border-white/50
                    flex items-center justify-center gap-2
                    transition-colors relative overflow-hidden
                    ${isPoking ? 'bg-portal-pink-dark text-white' : 'bg-portal-pink text-white'}
                `}
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(255, 182, 193, 0.4)" }}
                whileTap={{ scale: 0.85, transition: { type: "spring", stiffness: 400, damping: 10 } }}
            >
                {/* Background sheen animation */}
                <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />

                <Hand className={`w-5 h-5 ${isPoking ? 'animate-ping' : ''}`} />
                <span>
                    {isPoking ? 'Poking...' : `Poke ${partnerName} 👉`}
                </span>
            </motion.button>
        </div>
    );
}
