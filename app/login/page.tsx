'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRight, Sparkles } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [view, setView] = useState<'login' | 'signup'>('login');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Hydration fix: generate random positions only on client
    const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; delay: number; duration: number; size: number }[]>([]);

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const newSparkles = [...Array(6)].map((_, i) => ({
            id: i,
            x: Math.random() * 80 + 10,
            y: Math.random() * 80 + 10,
            delay: Math.random() * 5,
            duration: 3 + Math.random() * 2,
            size: Math.random() * 20 + 20
        }));
        setSparkles(newSparkles);
    }, []);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        try {
            if (view === 'signup') {
                console.log('Attempting Signup with:', { email, username, fullName });
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback`,
                        data: {
                            full_name: fullName,
                            username: username, // Store username in metadata
                            avatar_url: `https://api.dicebear.com/7.x/bear/svg?seed=${username}`,
                        },
                    },
                });
                console.log('Signup Result:', { data, error });
                if (error) throw error;
                router.refresh();
            } else {
                // LOGIN: 1. Resolve Username -> Email
                const { data: emailData, error: rpcError } = await supabase.rpc('get_email_by_username', {
                    username_input: username
                });

                if (rpcError) throw rpcError;
                if (!emailData) throw new Error('User not found');

                // 2. Sign in with resolved email
                const { error } = await supabase.auth.signInWithPassword({
                    email: emailData as string,
                    password,
                });
                if (error) throw error;
                router.refresh();
            }
        } catch (error: any) {
            console.error('Auth Error:', error);
            setErrorMsg(error.message || 'Something went wrong, bear!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-portal-pink/20 via-portal-cream to-white">

            {/* Floating Sparkles BG */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {sparkles.map((sparkle) => (
                    <motion.div
                        key={sparkle.id}
                        className="absolute text-portal-pink/30"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: [0, 1, 0],
                            scale: [0.5, 1.5, 0.5],
                            x: Math.random() * 100 - 50, // Keep some randomness in animation loop (safe after hydration)
                            y: Math.random() * 100 - 50,
                        }}
                        transition={{
                            duration: sparkle.duration,
                            repeat: Infinity,
                            delay: sparkle.delay
                        }}
                        style={{
                            top: `${sparkle.y}%`,
                            left: `${sparkle.x}%`,
                            fontSize: `${sparkle.size}px`
                        }}
                    >
                        Create
                    </motion.div>
                ))}
            </div>

            <motion.div
                className="w-full max-w-md bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-xl p-8 border border-white/50 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, type: "spring" }}
            >
                {/* Header Section */}
                <div className="text-center mb-8 relative z-10">
                    <motion.div
                        className="w-24 h-24 bg-gradient-to-tr from-portal-pink to-portal-purple rounded-full mx-auto mb-4 flex items-center justify-center shadow-inner"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                    >
                        <span className="text-5xl filter drop-shadow-md">🐻</span>
                    </motion.div>
                    <h1 className="text-2xl font-bold text-gray-700 tracking-tight">
                        The Portal <span className="text-portal-pink">💕</span>
                    </h1>
                    <p className="text-gray-500 text-sm mt-2">
                        Your private space, together.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-100/50 p-1.5 rounded-full mb-6 relative">
                    <motion.div
                        className="absolute top-1.5 bottom-1.5 bg-white rounded-full shadow-sm z-0"
                        layoutId="tab-pill"
                        initial={false}
                        animate={{
                            left: view === 'login' ? '4px' : '50%',
                            width: 'calc(50% - 6px)',
                            x: view === 'login' ? 0 : 2
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />

                    <button
                        onClick={() => setView('login')}
                        className={`flex-1 relative z-10 py-2.5 text-sm font-semibold transition-colors duration-200 ${view === 'login' ? 'text-gray-800' : 'text-gray-400'}`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setView('signup')}
                        className={`flex-1 relative z-10 py-2.5 text-sm font-semibold transition-colors duration-200 ${view === 'signup' ? 'text-gray-800' : 'text-gray-400'}`}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleAuth} className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {view === 'signup' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden space-y-4"
                            >
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 ml-2">Display Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Arty Bear"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full px-5 py-3.5 rounded-2xl bg-white border border-gray-100 focus:border-portal-pink/50 focus:ring-4 focus:ring-portal-pink/10 outline-none transition-all placeholder:text-gray-300 text-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 ml-2">Email</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="you@lovemail.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-5 py-3.5 rounded-2xl bg-white border border-gray-100 focus:border-portal-pink/50 focus:ring-4 focus:ring-portal-pink/10 outline-none transition-all placeholder:text-gray-300 text-gray-700"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Common Fields */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 ml-2">Username</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. supercutie99"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-5 py-3.5 rounded-2xl bg-white border border-gray-100 focus:border-portal-pink/50 focus:ring-4 focus:ring-portal-pink/10 outline-none transition-all placeholder:text-gray-300 text-gray-700"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 ml-2">Password</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-3.5 rounded-2xl bg-white border border-gray-100 focus:border-portal-pink/50 focus:ring-4 focus:ring-portal-pink/10 outline-none transition-all placeholder:text-gray-300 text-gray-700"
                        />
                    </div>

                    {errorMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 rounded-xl bg-red-50 text-red-500 text-xs text-center border border-red-100"
                        >
                            {errorMsg}
                        </motion.div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-portal-pink to-portal-purple text-white font-bold shadow-lg shadow-portal-pink/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                                <Sparkles className="w-5 h-5" />
                            </motion.div>
                        ) : (
                            <>
                                {view === 'login' ? 'Open Portal' : 'Create Account'}
                                <ArrowRight className="w-5 h-5 opacity-80" />
                            </>
                        )}
                    </motion.button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400">
                        Protected by <Lock className="w-3 h-3 inline mb-0.5" /> Love Lock Security
                    </p>
                </div>
            </motion.div>
        </main>
    );
}

