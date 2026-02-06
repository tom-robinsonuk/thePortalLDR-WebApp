'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Clock, Calendar, User, Heart, LogOut } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useAuthUser } from '@/hooks/useAuthUser';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { userName, partnerName, partnerTimezone, meetDate, updateSettings } = useUser();
    const { user } = useAuthUser(); // Get auth user for ID
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push('/login');
    };

    // Local state for form inputs
    const [formData, setFormData] = useState({
        userName,
        partnerTimezone,
        meetDate,
    });

    // Sync local state when context changes or modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({ userName, partnerTimezone, meetDate });
        }
    }, [isOpen, userName, partnerTimezone, meetDate]);

    const handleSave = async () => {
        // 1. Update Context (Optimistic)
        updateSettings(formData);

        // 2. Update Database (Async)
        if (user) {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.userName,
                    meet_date: formData.meetDate // Save to DB
                })
                .eq('id', user.id);

            if (error) console.error('Error saving settings:', error);
        }

        onClose();
    };

    // Common timezones (simplified list for MVP)
    const timezones = [
        { label: 'UTC', value: '0' },
        { label: 'London (GMT)', value: '0' },
        { label: 'Paris/Berlin (UTC+1)', value: '1' },
        { label: 'Cairo/Jerusalem (UTC+2)', value: '2' },
        { label: 'Moscow/Dubai (UTC+4)', value: '4' },
        { label: 'India (UTC+5:30)', value: '5.5' },
        { label: 'Bangkok (UTC+7)', value: '7' },
        { label: 'Singapore/China (UTC+8)', value: '8' },
        { label: 'Tokyo/Seoul (UTC+9)', value: '9' },
        { label: 'Sydney (UTC+11)', value: '11' },
        { label: 'New Zealand (UTC+13)', value: '13' },
        { label: 'New York (EST/UTC-5)', value: '-5' },
        { label: 'Chicago (CST/UTC-6)', value: '-6' },
        { label: 'Los Angeles (PST/UTC-8)', value: '-8' },
        { label: 'Hawaii (UTC-10)', value: '-10' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    >
                        {/* Modal Content */}
                        <motion.div
                            className="bg-white/90 backdrop-blur-md rounded-3xl p-6 w-full max-w-md shadow-2xl border-4 border-portal-pink/30 relative overflow-hidden"
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            type="button"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Decorative Header Blob */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-portal-purple/20 rounded-full blur-2xl" />
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-portal-pink/20 rounded-full blur-2xl" />

                            <div className="flex justify-between items-center mb-6 relative z-10">
                                <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                                    <span>⚙️</span> Settings
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="space-y-5 relative z-10 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                                {/* Names Section */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
                                        <User className="w-4 h-4" /> Names
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-xs text-[var(--text-secondary)] ml-1">My Name</label>
                                            <input
                                                type="text"
                                                value={formData.userName}
                                                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                                                className="w-full bg-white border-2 border-portal-pink/20 rounded-xl px-3 py-2 text-[var(--text-primary)] focus:border-portal-pink focus:outline-none transition-colors text-sm"
                                                placeholder="Me"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-[var(--text-secondary)] ml-1">Partner</label>
                                            <div className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-3 py-2 text-gray-500 text-sm cursor-not-allowed flex items-center justify-between">
                                                <span>{partnerName}</span>
                                                <span className="text-[10px] bg-portal-purple/20 text-portal-purple px-1.5 py-0.5 rounded-md">Linked</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-gray-100" />

                                {/* Timezone Section */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> Timezone
                                    </h3>
                                    <div className="space-y-1">
                                        <label className="text-xs text-[var(--text-secondary)] ml-1">Partner's Timezone</label>
                                        <select
                                            value={formData.partnerTimezone}
                                            onChange={(e) => setFormData({ ...formData, partnerTimezone: e.target.value })}
                                            className="w-full bg-white border-2 border-portal-sky/20 rounded-xl px-3 py-2 text-[var(--text-primary)] focus:border-portal-sky focus:outline-none transition-colors text-sm appearance-none cursor-pointer"
                                        >
                                            {timezones.map((tz, index) => (
                                                <option key={`${tz.value}-${index}`} value={tz.value}>
                                                    {tz.label}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-[10px] text-gray-400 ml-1">
                                            Used to show sleeping status 😴
                                        </p>
                                    </div>
                                </div>

                                <div className="h-px bg-gray-100" />

                                {/* Countdown Section */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
                                        <Heart className="w-4 h-4" /> Hug Countdown
                                    </h3>
                                    <div className="space-y-1">
                                        <label className="text-xs text-[var(--text-secondary)] ml-1">Next Meet Date</label>
                                        <input
                                            type="date"
                                            value={formData.meetDate}
                                            onChange={(e) => setFormData({ ...formData, meetDate: e.target.value })}
                                            className="w-full bg-white border-2 border-portal-pink/20 rounded-xl px-3 py-2 text-[var(--text-primary)] focus:border-portal-pink focus:outline-none transition-colors text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-6 flex justify-between items-center relative z-10">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleLogout}
                                    className="px-4 py-2 rounded-xl font-medium text-red-400 hover:text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2 text-sm"
                                >
                                    <LogOut className="w-4 h-4" /> Log Out
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSave}
                                    className="bg-portal-pink text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
                                >
                                    <Save className="w-4 h-4" /> Save
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

