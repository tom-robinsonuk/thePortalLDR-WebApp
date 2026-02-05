'use client';

import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function Header() {
    return (
        <motion.header
            className="text-center py-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] flex items-center justify-center gap-3">
                <span>Arty</span>
                <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Heart className="w-6 h-6 md:w-7 md:h-7 text-portal-pink fill-portal-pink" />
                </motion.span>
                <span>Tom</span>
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1 opacity-70">
                Our little space 💕
            </p>
        </motion.header>
    );
}
