'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, ArrowRight, Heart, Sparkles } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAuthUser } from '@/hooks/useAuthUser';

export default function PairingSystem({ onPaired }: { onPaired: () => void }) {
    const [myCode, setMyCode] = useState<string | null>(null);
    const [partnerCode, setPartnerCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuthUser();
    const supabase = createClient();

    // Fetch my pairing code
    useEffect(() => {
        async function getProfile() {
            if (!user) return;
            const { data, error } = await supabase
                .from('profiles')
                .select('pairing_code')
                .eq('id', user.id)
                .single();

            if (data) setMyCode(data.pairing_code);
        }
        getProfile();
    }, [user, supabase]);

    const handleCopy = () => {
        if (myCode) {
            navigator.clipboard.writeText(myCode);
            // Could show toast here
        }
    };

    const handlePair = async () => {
        if (!partnerCode) return;
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.rpc('pair_with_partner', { code: partnerCode });

            if (error) throw error;

            // Success!
            onPaired();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Could not pair. Check the code!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-md mx-auto p-6">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-xl text-center w-full"
            >
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, -5, 5, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-20 h-20 bg-portal-pink/20 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                    <Heart className="w-10 h-10 text-portal-pink fill-portal-pink" />
                </motion.div>

                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Connect with Partner</h2>
                <p className="text-[var(--text-secondary)] mb-8 text-sm">
                    To enter your private world, you need to link your accounts together.
                </p>

                {/* My Code Section */}
                <div className="bg-white/60 rounded-xl p-4 mb-8 border border-white shadow-sm">
                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">Your Pairing Code</p>
                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-mono font-bold text-[var(--text-primary)] tracking-widest">
                            {myCode || '...'}
                        </span>
                        <button
                            onClick={handleCopy}
                            className="p-2 hover:bg-black/5 rounded-full transition-colors"
                        >
                            <Copy className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>

                <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300/50"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white/0 backdrop-blur-sm text-gray-400">OR</span>
                    </div>
                </div>

                {/* Enter Partner Code */}
                <div className="space-y-4">
                    <div className="text-left">
                        <label className="text-xs uppercase tracking-wider text-gray-400 font-semibold ml-1">Enter Their Code</label>
                        <input
                            type="text"
                            value={partnerCode}
                            onChange={(e) => setPartnerCode(e.target.value)}
                            placeholder="e.g. A7X29B"
                            className="w-full mt-1 px-5 py-4 rounded-xl bg-white/80 border border-white focus:ring-2 focus:ring-portal-pink/50 outline-none font-mono text-lg text-center tracking-widest uppercase placeholder:normal-case placeholder:tracking-normal"
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-xs">{error}</p>
                    )}

                    <button
                        onClick={handlePair}
                        disabled={loading || !partnerCode}
                        className="w-full py-4 rounded-xl bg-[var(--text-primary)] text-white font-bold text-lg shadow-lg hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Sparkles className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Connect Accounts <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>

            </motion.div>
        </div>
    );
}
