'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, RotateCcw, Heart } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { createClient } from '@/utils/supabase/client';
import { useAuthUser } from '@/hooks/useAuthUser';
import BottomNav from './BottomNav';

interface GameScores {
    pink_score: number;
    blue_score: number;
}

// Game duration in seconds
const GAME_DURATION = 10;
const MAX_TAPS = 100; // Maximum taps to fill progress bar

// Confetti particle component
function Confetti() {
    const particles = [...Array(50)].map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        color: ['#FFD1DC', '#E0BBE4', '#B2E2F2', '#FFE4B5', '#FFB6C1'][Math.floor(Math.random() * 5)],
    }));

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute w-3 h-3 rounded-sm"
                    style={{
                        left: `${p.x}%`,
                        backgroundColor: p.color,
                    }}
                    initial={{ y: -20, opacity: 1, rotate: 0 }}
                    animate={{
                        y: '100vh',
                        opacity: [1, 1, 0],
                        rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                    }}
                    transition={{
                        duration: p.duration,
                        delay: p.delay,
                        ease: 'easeIn',
                    }}
                />
            ))}
        </div>
    );
}

type GameState = 'idle' | 'countdown' | 'playing' | 'finished';

export default function LoveTapWar() {
    const { userName, partnerName } = useUser();
    const [gameState, setGameState] = useState<GameState>('idle');
    const [countdown, setCountdown] = useState(3);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [myTaps, setMyTaps] = useState(0);
    const [partnerTaps, setPartnerTaps] = useState(0);
    const [winner, setWinner] = useState<'me' | 'partner' | 'tie' | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Supabase & Scores
    const supabase = createClient();
    const { user } = useAuthUser();
    const [coupleId, setCoupleId] = useState<string | null>(null);
    const [myColor, setMyColor] = useState<'pink' | 'blue' | null>(null);
    const [totalScores, setTotalScores] = useState<GameScores>({ pink_score: 0, blue_score: 0 });

    // 1. Setup: Get Couple & Determine Color
    useEffect(() => {
        if (!user) return;
        const setupGame = async () => {
            // Get my profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('couple_id, id')
                .eq('id', user.id)
                .single();

            if (profile?.couple_id) {
                setCoupleId(profile.couple_id);

                // Determining Color: Sort couple user IDs alphabetically
                // Pink = Lower ID, Blue = Higher ID
                const { data: partners } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('couple_id', profile.couple_id)
                    .order('id', { ascending: true });

                if (partners && partners.length > 0) {
                    const isFirst = partners[0].id === user.id;
                    setMyColor(isFirst ? 'pink' : 'blue');
                }

                // Fetch current scores
                const { data: scores } = await supabase
                    .from('game_scores')
                    .select('*')
                    .eq('couple_id', profile.couple_id)
                    .single();

                if (scores) {
                    setTotalScores({ pink_score: scores.pink_score, blue_score: scores.blue_score });
                } else {
                    // Initialize if missing
                    await supabase.from('game_scores').insert({ couple_id: profile.couple_id });
                }
            }
        };
        setupGame();
    }, [user]);

    // 2. Realtime Taps & Game State (Broadcast)
    useEffect(() => {
        if (!user || !coupleId) return; // Wait for setup

        const channel = supabase
            .channel('tap-war-room')
            .on('broadcast', { event: 'tap' }, ({ payload }) => {
                if (payload.from !== user.id) {
                    setPartnerTaps(payload.count);
                }
            })
            .on('broadcast', { event: 'game-start' }, ({ payload }) => {
                if (payload.from !== user.id) startCountdown();
            })
            .on('broadcast', { event: 'game-reset' }, ({ payload }) => {
                if (payload.from !== user.id) resetGame();
            })
            // Also listen to Score updates from DB
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'game_scores', filter: `couple_id=eq.${coupleId}` },
                (payload) => {
                    setTotalScores(payload.new as GameScores);
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user, coupleId]);

    // Countdown logic
    useEffect(() => {
        if (gameState !== 'countdown') return;

        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setGameState('playing');
            setTimeLeft(GAME_DURATION);
        }
    }, [gameState, countdown]);

    // Game timer
    useEffect(() => {
        if (gameState !== 'playing') return;

        if (timeLeft > 0) {
            timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => {
                if (timerRef.current) clearTimeout(timerRef.current);
            };
        } else {
            endGame();
        }
    }, [gameState, timeLeft]);

    const startCountdown = useCallback(() => {
        setGameState('countdown');
        setCountdown(3);
        setMyTaps(0);
        setPartnerTaps(0);
        setWinner(null);
        setShowConfetti(false);
    }, []);

    const handleStart = () => {
        startCountdown();

        // Broadcast game start
        if (supabase) {
            supabase.channel('tap-war-room').send({
                type: 'broadcast',
                event: 'game-start',
                payload: { from: user?.id },
            });
        }
    };

    const handleTap = () => {
        if (gameState !== 'playing') return;

        const newCount = myTaps + 1;
        setMyTaps(newCount);

        // Broadcast tap
        if (supabase) {
            supabase.channel('tap-war-room').send({
                type: 'broadcast',
                event: 'tap',
                payload: { from: user?.id, count: newCount },
            });
        }
    };

    const endGame = async () => {
        setGameState('finished');
        if (!myColor || !coupleId) return;

        // Determine winner
        if (myTaps > partnerTaps) {
            setWinner('me');
            // Update DB Score!
            const updateKey = myColor === 'pink' ? 'pink_score' : 'blue_score';
            const currentScore = myColor === 'pink' ? totalScores.pink_score : totalScores.blue_score;

            await supabase.from('game_scores')
                .update({ [updateKey]: currentScore + 1 })
                .eq('couple_id', coupleId);

        } else if (partnerTaps > myTaps) {
            setWinner('partner');
        } else {
            setWinner('tie');
        }

        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
    };

    const resetGame = () => {
        setGameState('idle');
        setCountdown(3);
        setTimeLeft(GAME_DURATION);
        setMyTaps(0);
        setPartnerTaps(0);
        setWinner(null);
        setShowConfetti(false);

        if (timerRef.current) clearTimeout(timerRef.current);
    };

    const handleReset = () => {
        resetGame();

        // Broadcast reset
        if (supabase) {
            supabase.channel('tap-war-room').send({
                type: 'broadcast',
                event: 'game-reset',
                payload: { from: user?.id },
            });
        }
    };

    // Progress percentages
    const myProgress = Math.min((myTaps / MAX_TAPS) * 100, 100);
    const partnerProgress = Math.min((partnerTaps / MAX_TAPS) * 100, 100);

    return (
        <div className="fixed inset-0 flex flex-col bg-gradient-to-b from-portal-cream via-portal-pink/30 to-portal-purple/30">
            {/* Confetti */}
            <AnimatePresence>
                {showConfetti && <Confetti />}
            </AnimatePresence>

            {/* Header */}
            <motion.div
                className="text-center pt-8 pb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center justify-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-500" />
                    Love Tap War
                    <Zap className="w-6 h-6 text-yellow-500" />
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Tap faster than your cutie! 💕
                </p>
            </motion.div>

            {/* Progress Bars - Cute Heart Theme */}
            <div className="px-4 py-4 space-y-5">
                {/* My Progress (Pink) */}
                <div className="relative">
                    {/* Decorative frame */}
                    <div className="bg-gradient-to-r from-pink-100 to-pink-50 rounded-2xl p-3 border-2 border-pink-200 shadow-lg">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-[var(--text-primary)] flex items-center gap-1">
                                <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
                                {userName}
                            </span>
                            <span className="text-sm font-medium text-pink-500 bg-pink-100 px-2 py-0.5 rounded-full">
                                {myTaps} 💗 <span className="text-[10px] text-pink-300 ml-1">({myColor === 'pink' ? totalScores.pink_score : totalScores.blue_score} wins)</span>
                            </span>
                        </div>
                        {/* Liquid progress bar */}
                        <div className="h-8 bg-white/80 rounded-full overflow-hidden shadow-inner border-2 border-pink-200 relative">
                            <motion.div
                                className="h-full rounded-full relative overflow-hidden"
                                style={{
                                    background: 'linear-gradient(90deg, #FFB6C1 0%, #FF69B4 50%, #FFB6C1 100%)',
                                }}
                                initial={{ width: 0 }}
                                animate={{ width: `${myProgress}%` }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            >
                                {/* Liquid wave effect */}
                                <motion.div
                                    className="absolute inset-0 opacity-40"
                                    style={{
                                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                                    }}
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                />
                                {/* Bubble dots */}
                                <div className="absolute inset-0 flex items-center justify-end pr-2">
                                    <motion.div
                                        className="w-2 h-2 bg-white/60 rounded-full"
                                        animate={{ y: [-2, 2, -2], opacity: [0.4, 0.8, 0.4] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    />
                                </div>
                            </motion.div>
                            {/* Heart decoration on bar */}
                            {myProgress > 10 && (
                                <motion.div
                                    className="absolute top-1/2 -translate-y-1/2 text-white text-xs"
                                    style={{ left: `${Math.min(myProgress - 5, 90)}%` }}
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 0.8, repeat: Infinity }}
                                >
                                    💖
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Partner Progress (Blue) */}
                <div className="relative">
                    {/* Decorative frame */}
                    <div className="bg-gradient-to-r from-blue-100 to-cyan-50 rounded-2xl p-3 border-2 border-blue-200 shadow-lg">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-[var(--text-primary)] flex items-center gap-1">
                                <Heart className="w-4 h-4 text-blue-400 fill-blue-400" />
                                {partnerName}
                            </span>
                            <span className="text-sm font-medium text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">
                                {partnerTaps} 💙 <span className="text-[10px] text-blue-300 ml-1">({myColor === 'pink' ? totalScores.blue_score : totalScores.pink_score} wins)</span>
                            </span>
                        </div>
                        {/* Liquid progress bar */}
                        <div className="h-8 bg-white/80 rounded-full overflow-hidden shadow-inner border-2 border-blue-200 relative">
                            <motion.div
                                className="h-full rounded-full relative overflow-hidden"
                                style={{
                                    background: 'linear-gradient(90deg, #87CEEB 0%, #4FC3F7 50%, #87CEEB 100%)',
                                }}
                                initial={{ width: 0 }}
                                animate={{ width: `${partnerProgress}%` }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            >
                                {/* Liquid wave effect */}
                                <motion.div
                                    className="absolute inset-0 opacity-40"
                                    style={{
                                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                                    }}
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 0.5 }}
                                />
                                {/* Bubble dots */}
                                <div className="absolute inset-0 flex items-center justify-end pr-2">
                                    <motion.div
                                        className="w-2 h-2 bg-white/60 rounded-full"
                                        animate={{ y: [-2, 2, -2], opacity: [0.4, 0.8, 0.4] }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                                    />
                                </div>
                            </motion.div>
                            {/* Heart decoration on bar */}
                            {partnerProgress > 10 && (
                                <motion.div
                                    className="absolute top-1/2 -translate-y-1/2 text-white text-xs"
                                    style={{ left: `${Math.min(partnerProgress - 5, 90)}%` }}
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                                >
                                    💙
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Game Area */}
            <div className="flex-1 flex flex-col items-center justify-center px-6">
                {/* Timer Display */}
                {gameState === 'playing' && (
                    <motion.div
                        className="text-6xl font-bold text-[var(--text-primary)] mb-8"
                        key={timeLeft}
                        initial={{ scale: 1.3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        {timeLeft}
                    </motion.div>
                )}

                {/* Countdown Display */}
                {gameState === 'countdown' && (
                    <motion.div
                        className="text-8xl font-bold text-portal-purple"
                        key={countdown}
                        initial={{ scale: 2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                    >
                        {countdown === 0 ? 'GO!' : countdown}
                    </motion.div>
                )}

                {/* Idle / Start State */}
                {gameState === 'idle' && (
                    <motion.button
                        onClick={handleStart}
                        className="px-12 py-6 bg-gradient-to-r from-portal-pink to-portal-purple text-white text-2xl font-bold rounded-full shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        Start Game! 🎮
                    </motion.button>
                )}

                {/* Big Tap Button */}
                {gameState === 'playing' && (
                    <motion.button
                        onClick={handleTap}
                        className="w-48 h-48 rounded-full bg-gradient-to-br from-portal-pink via-portal-purple to-portal-sky shadow-2xl flex items-center justify-center"
                        whileTap={{ scale: 0.85 }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                    >
                        <motion.div
                            className="text-white text-center"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                        >
                            <Zap className="w-16 h-16 mx-auto" />
                            <span className="text-lg font-bold">TAP!</span>
                        </motion.div>
                    </motion.button>
                )}

                {/* Winner Display */}
                {gameState === 'finished' && (
                    <motion.div
                        className="text-center"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                    >
                        <Trophy className="w-20 h-20 mx-auto text-yellow-500 mb-4" />
                        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                            {winner === 'me' && '🎉 You Win! 🎉'}
                            {winner === 'partner' && `💙 ${partnerName} Wins! 💙`}
                            {winner === 'tie' && "💕 It's a Tie! 💕"}
                        </h2>
                        <motion.p
                            className="text-base text-[var(--text-secondary)] mb-2 px-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            {winner === 'me' && `This proves you love ${partnerName === 'Cutie' ? 'her' : partnerName} the most! 💖`}
                            {winner === 'partner' && `Aww, ${partnerName} loves you more! Lucky you~ 💕`}
                            {winner === 'tie' && "You both love each other equally! 🥰"}
                        </motion.p>
                        <p className="text-sm text-[var(--text-secondary)] mb-6">
                            {myTaps} vs {partnerTaps} taps
                        </p>
                        <motion.button
                            onClick={handleReset}
                            className="px-8 py-3 bg-portal-purple/20 hover:bg-portal-purple/30 rounded-full text-[var(--text-primary)] font-medium flex items-center gap-2 mx-auto"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <RotateCcw className="w-5 h-5" />
                            Play Again
                        </motion.button>
                    </motion.div>
                )}
            </div>



            {/* Bottom Navigation */}
            <BottomNav />
        </div>
    );
}
