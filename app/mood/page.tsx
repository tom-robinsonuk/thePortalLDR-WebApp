'use client';

import { useEffect, useState } from 'react';
import MoodTracker from '@/components/MoodTracker';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { useAuthUser } from '@/hooks/useAuthUser';
import { createClient } from '@/utils/supabase/client';
import { motion } from 'framer-motion';

export default function MoodPage() {
    const { user, loading: authLoading } = useAuthUser();
    const supabase = createClient();
    const [partnerId, setPartnerId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPartner = async () => {
            if (!user) return;

            try {
                // Get my profile to find couple_id
                const { data: myProfile } = await supabase
                    .from('profiles')
                    .select('couple_id')
                    .eq('id', user.id)
                    .single();

                if (myProfile?.couple_id) {
                    // Get partner profile
                    const { data: partners } = await supabase
                        .from('profiles')
                        .select('id')
                        .eq('couple_id', myProfile.couple_id)
                        .neq('id', user.id)
                        .single();

                    if (partners) setPartnerId(partners.id);
                }
            } catch (error) {
                console.error('Error fetching partner:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchPartner();
    }, [user, supabase]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-portal-cream">
                <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <span className="text-4xl">🐻</span>
                </motion.div>
            </div>
        );
    }

    if (!user || !partnerId) {
        return (
            <main className="min-h-screen flex flex-col p-4 bg-portal-cream">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <p className="text-[var(--text-secondary)] mb-4">
                        You need to be paired with a partner to track moods! 💕
                    </p>
                    <BottomNav />
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex flex-col p-4 pb-24">
            <div className="portal-container space-y-4">
                <Header />
                <MoodTracker userId={user.id} partnerId={partnerId} />
            </div>
            <BottomNav />
        </main>
    );
}
