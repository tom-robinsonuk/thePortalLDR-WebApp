'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export default function AuthErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-portal-cream p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card max-w-md w-full p-8 text-center border-red-100"
            >
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>

                <h1 className="text-xl font-bold text-gray-800 mb-2">Authentication Error</h1>
                <p className="text-gray-500 mb-6">
                    Oops! We couldn't sign you in. The verification link might be invalid or expired.
                </p>

                <Link href="/login">
                    <button className="w-full py-3 rounded-xl bg-gradient-to-r from-portal-pink to-portal-purple text-white font-bold shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                        <ArrowLeft className="w-5 h-5" /> Back to Login
                    </button>
                </Link>
            </motion.div>
        </div>
    );
}
