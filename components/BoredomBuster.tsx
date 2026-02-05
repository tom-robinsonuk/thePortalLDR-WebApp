'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Shuffle, X } from 'lucide-react';
import { prompts, categories, Prompt, CategoryId } from '@/data/prompts';

export default function BoredomBuster() {
    const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
    const [isShuffling, setIsShuffling] = useState(false);
    const [showCard, setShowCard] = useState(false);

    // Get random prompt from specific category or all
    const getRandomPrompt = useCallback((categoryId?: CategoryId) => {
        const filteredPrompts = categoryId
            ? prompts.filter(p => p.category === categoryId)
            : prompts;

        if (filteredPrompts.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * filteredPrompts.length);
        return filteredPrompts[randomIndex];
    }, []);

    // Get specific daily factor for "Fact Drop"
    const getDailyFact = useCallback(() => {
        const facts = prompts.filter(p => p.category === 'daily_fact');
        if (facts.length === 0) return null;

        // Calculate Day of Year (1-366)
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now.getTime() - start.getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);

        // Use day of year to select consistent fact
        const factIndex = dayOfYear % facts.length;
        return facts[factIndex];
    }, []);

    // Handle category button click - select from that category only
    const handleCategoryClick = async (categoryId: CategoryId) => {
        setIsShuffling(true);
        setShowCard(false);

        await new Promise(resolve => setTimeout(resolve, 800));

        let prompt: Prompt | null;

        if (categoryId === 'daily_fact') {
            prompt = getDailyFact();
        } else {
            prompt = getRandomPrompt(categoryId);
        }

        setCurrentPrompt(prompt);
        setIsShuffling(false);
        setShowCard(true);
    };

    // Handle shuffle all
    const handleShuffleAll = async () => {
        setIsShuffling(true);
        setShowCard(false);

        await new Promise(resolve => setTimeout(resolve, 1000));

        // For shuffle all, we exclude daily facts to keep them special? 
        // Or include them randomly? User didn't specify. 
        // Let's include them randomly for chaos fun.
        const prompt = getRandomPrompt();
        setCurrentPrompt(prompt);
        setIsShuffling(false);
        setShowCard(true);
    };

    // Close card
    const handleClose = () => {
        setShowCard(false);
        setCurrentPrompt(null);
    };

    // Get category info
    const getCategoryInfo = (categoryId: CategoryId) => {
        return categories.find(c => c.id === categoryId);
    };

    return (
        <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
        >
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 text-center">
                Bored? Let&apos;s Play! 🎲
            </h2>

            {/* Category Buttons - Click one to get from that category */}
            <div className="flex justify-center gap-2 mb-4 flex-wrap">
                {categories.map((category) => (
                    <motion.button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        disabled={isShuffling}
                        className={`
              px-4 py-2 rounded-full text-sm font-medium
              ${category.color} text-[var(--text-primary)] shadow-md
              disabled:opacity-50
            `}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className="mr-1">{category.emoji}</span>
                        {category.label}
                    </motion.button>
                ))}
            </div>

            {/* Shuffle All Button */}
            <div className="flex justify-center mb-4">
                <motion.button
                    onClick={handleShuffleAll}
                    disabled={isShuffling}
                    className={`
            px-6 py-3 rounded-full text-lg font-bold
            bg-gradient-to-r from-portal-pink via-portal-purple to-portal-sky
            text-white shadow-lg
            disabled:opacity-70
          `}
                    whileHover={{ scale: 1.08, boxShadow: '0 10px 40px rgba(224, 187, 228, 0.5)' }}
                    whileTap={{ scale: 0.95 }}
                    animate={isShuffling ? { rotate: [0, -5, 5, -5, 5, 0] } : {}}
                    transition={isShuffling ? { duration: 0.4, repeat: 2 } : {}}
                >
                    {isShuffling ? (
                        <span className="flex items-center gap-2">
                            <Shuffle className="w-5 h-5 animate-spin" />
                            Shuffling...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            Shuffle All ✨
                        </span>
                    )}
                </motion.button>
            </div>

            {/* Result Card */}
            <AnimatePresence mode="wait">
                {showCard && currentPrompt && (
                    <motion.div
                        key={currentPrompt.id}
                        initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: -20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="relative"
                    >
                        <div className={`
              relative p-5 rounded-2xl text-center
              ${getCategoryInfo(currentPrompt.category)?.color || 'bg-portal-cream'}
              shadow-lg
            `}>
                            <button
                                onClick={handleClose}
                                className="absolute top-2 right-2 p-1 rounded-full bg-white/50 hover:bg-white/80"
                            >
                                <X className="w-4 h-4 text-[var(--text-primary)]" />
                            </button>

                            <span className="inline-block px-3 py-1 rounded-full bg-white/50 text-xs font-medium text-[var(--text-primary)] mb-3">
                                {getCategoryInfo(currentPrompt.category)?.emoji}{' '}
                                {getCategoryInfo(currentPrompt.category)?.label}
                            </span>

                            <p className="text-lg font-medium text-[var(--text-primary)] leading-relaxed">
                                {currentPrompt.text}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty state */}
            {!showCard && !isShuffling && (
                <p className="text-center text-sm text-[var(--text-secondary)]">
                    Pick a category or shuffle all! 🎉
                </p>
            )}
        </motion.div>
    );
}
