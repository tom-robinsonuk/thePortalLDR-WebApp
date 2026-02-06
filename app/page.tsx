'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { useAuthUser } from '@/hooks/useAuthUser';

import Header from '@/components/Header';
import MiniMoodDisplay from '@/components/MiniMoodDisplay';
import BoredomBuster from '@/components/BoredomBuster';
import BottomNav from '@/components/BottomNav';
import HugCountdown from '@/components/HugCountdown';
import PokeButton from '@/components/PokeButton';
import PairingSystem from '@/components/PairingSystem';

import { useUser } from '@/context/UserContext'; // Import Context Hook

export default function Home() {
    const { user, loading: authLoading } = useAuthUser();
    const { updateSettings } = useUser(); // Get context updater
    const supabase = createClient();

    const [isMounted, setIsMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [partner, setPartner] = useState<any>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Fetch Profile & Partner
    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // 1. Get My Profile
            console.log('Fetching profile for user:', user.id);
            const { data: myProfile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            console.log('Profile Fetch Result:', { myProfile, profileError });

            if (profileError) {
                // Manually construct error object if it's not logging well
                throw {
                    message: profileError.message,
                    code: profileError.code,
                    details: profileError.details,
                    hint: profileError.hint
                };
            }
            setProfile(myProfile);

            // 2. If Coupled, Get Partner Profile
            if (myProfile?.couple_id) {
                const { data: partners, error: partnerError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('couple_id', myProfile.couple_id)
                    .neq('id', user.id); // Not me

                if (partners && partners.length > 0) {
                    setPartner(partners[0]);
                }
            }
        } catch (err: any) {
            console.error('Error loading data details:', {
                message: err.message,
                code: err.code,
                details: err.details,
                full: err
            });
            // If profile not found (PGRST116), maybe logout?
            if (err.code === 'PGRST116') {
                console.warn('Profile not found for user. Signing out...');
                await supabase.auth.signOut();
                // window.location.reload(); // or redirect
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user, supabase]);

    // Sync DB Data to User Context
    useEffect(() => {
        if (profile || partner) {
            const updates: any = {};
            // Prefer Full Name, fallback to Username
            if (profile?.full_name || profile?.username) {
                updates.userName = profile.full_name || profile.username;
            }
            // Partner Name
            if (partner?.full_name || partner?.username) {
                updates.partnerName = partner.full_name || partner.username;
            }

            if (Object.keys(updates).length > 0) {
                updateSettings(updates);
            }
        }
    }, [profile, partner]);




    // Loading State
    if (!isMounted || loading || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-portal-cream">
                <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <span className="text-4xl">🐻</span>
                </motion.div>
            </div>
        );
    }

    // 🔒 PAIRING GATE
    // If we have a user but no couple_id, show pairing screen
    if (user && profile && !profile.couple_id) {
        return <PairingSystem onPaired={fetchData} />;
    }

    // If fully authenticated and paired (or waiting for partner data fallback)
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
                        </>
                    )}
                </AnimatePresence>

                {/* Header (includes Bears) */}
                <Header />

                {/* Hug Countdown Dashboard */}
                <HugCountdown />

                {/* Poke Button */}
                {user && partner && (
                    <PokeButton userId={user.id} partnerId={partner.id} />
                )}

                {/* Mini Mood Status Display */}
                {user && partner && (
                    <MiniMoodDisplay userId={user.id} partnerId={partner.id} />
                )}

                {/* Anti-Boredom Engine */}
                <BoredomBuster />
            </div>

            {/* Bottom Navigation */}
            <BottomNav />
        </main>
    );
}
