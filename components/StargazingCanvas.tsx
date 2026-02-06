'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, FileText, Sparkles, Trash2 } from 'lucide-react';
import BottomNav from './BottomNav';
import { createClient } from '@/utils/supabase/client';
import { useAuthUser } from '@/hooks/useAuthUser';

interface StarMemory {
    id: string;
    x: number;
    y: number;
    message: string | null;
    image_url: string | null;
    created_at: string;
    user_id: string;
}

// Plant Star Modal
function PlantStarModal({
    isOpen,
    onClose,
    position,
    onSubmit
}: {
    isOpen: boolean;
    onClose: () => void;
    position: { x: number; y: number };
    onSubmit: (type: 'photo' | 'note', content: string, caption?: string) => void;
}) {
    const [mode, setMode] = useState<'choose' | 'photo' | 'note'>('choose');
    const [note, setNote] = useState('');
    const [caption, setCaption] = useState('');
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if (mode === 'photo' && photoPreview) {
            onSubmit('photo', photoPreview, caption);
        } else if (mode === 'note' && note.trim()) {
            onSubmit('note', note.trim());
        }
        // Reset
        setMode('choose');
        setNote('');
        setCaption('');
        setPhotoPreview(null);
        onClose();
    };

    const reset = () => {
        setMode('choose');
        setNote('');
        setCaption('');
        setPhotoPreview(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={reset}
        >
            <motion.div
                className="bg-gradient-to-b from-indigo-900/95 to-purple-900/95 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-white/20"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-300" />
                        Plant a Star ⭐
                    </h2>
                    <button onClick={reset} className="text-white/60 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {mode === 'choose' && (
                    <div className="space-y-3">
                        <p className="text-white/80 text-sm text-center mb-4">
                            What kind of memory would you like to save?
                        </p>
                        <button
                            onClick={() => setMode('photo')}
                            className="w-full py-4 bg-gradient-to-r from-pink-500/30 to-purple-500/30 hover:from-pink-500/50 hover:to-purple-500/50 rounded-xl text-white font-medium flex items-center justify-center gap-3 transition-all"
                        >
                            <Camera className="w-6 h-6" />
                            Upload a Photo 📸
                        </button>
                        <button
                            onClick={() => setMode('note')}
                            className="w-full py-4 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 hover:from-blue-500/50 hover:to-indigo-500/50 rounded-xl text-white font-medium flex items-center justify-center gap-3 transition-all"
                        >
                            <FileText className="w-6 h-6" />
                            Write a Note 💌
                        </button>
                    </div>
                )}

                {mode === 'photo' && (
                    <div className="space-y-4">
                        {!photoPreview ? (
                            <label className="block">
                                <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center cursor-pointer hover:border-white/50 transition-colors">
                                    <Camera className="w-12 h-12 mx-auto text-white/50 mb-2" />
                                    <p className="text-white/70 text-sm">Tap to upload a photo</p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePhotoUpload}
                                />
                            </label>
                        ) : (
                            <div className="relative">
                                <img
                                    src={photoPreview}
                                    alt="Preview"
                                    className="w-full h-40 object-cover rounded-xl"
                                />
                                <button
                                    onClick={() => setPhotoPreview(null)}
                                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        )}
                        <input
                            type="text"
                            placeholder="Add a caption... (optional)"
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setMode('choose')}
                                className="flex-1 py-3 bg-white/10 rounded-xl text-white font-medium"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!photoPreview}
                                className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl text-black font-bold disabled:opacity-50"
                            >
                                Plant Star ⭐
                            </button>
                        </div>
                    </div>
                )}

                {mode === 'note' && (
                    <div className="space-y-4">
                        <textarea
                            placeholder="Write your memory here... 💭"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 resize-none"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setMode('choose')}
                                className="flex-1 py-3 bg-white/10 rounded-xl text-white font-medium"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!note.trim()}
                                className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl text-black font-bold disabled:opacity-50"
                            >
                                Plant Star ⭐
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

// View Star Modal
function ViewStarModal({
    star,
    onClose,
    onDelete
}: {
    star: StarMemory | null;
    onClose: () => void;
    onDelete: (id: string) => void;
}) {
    if (!star) return null;

    const formattedDate = new Date(star.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const isPhoto = !!star.image_url;

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-gradient-to-b from-indigo-900/95 to-purple-900/95 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-white/20"
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <span className="text-white/60 text-sm">{formattedDate}</span>
                    <button onClick={onClose} className="text-white/60 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {isPhoto ? (
                    <div className="space-y-3">
                        <img
                            src={star.image_url!}
                            alt="Memory"
                            className="w-full rounded-xl"
                        />
                        {star.message && (
                            <p className="text-white text-center">{star.message}</p>
                        )}
                    </div>
                ) : (
                    <div className="bg-white/10 rounded-xl p-4">
                        <p className="text-white text-lg leading-relaxed">{star.message}</p>
                    </div>
                )}

                <button
                    onClick={() => {
                        onDelete(star.id);
                        onClose();
                    }}
                    className="mt-4 w-full py-2 text-red-300 hover:text-red-200 flex items-center justify-center gap-2 text-sm"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete this star
                </button>
            </motion.div>
        </motion.div>
    );
}

// Twinkling background stars (client-only to avoid hydration mismatch)
function TwinklingStars() {
    const [starPositions, setStarPositions] = useState<Array<{ left: number; top: number; duration: number; delay: number }>>([]);

    // Seeded random number generator (Mulberry32)
    const seededRandom = (seed: number) => {
        return () => {
            let t = seed += 0x6D2B79F5;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    };

    // Generate seeded hash from string
    const cyrb128 = (str: string) => {
        let h1 = 1779033703, h2 = 3144134277,
            h3 = 1013904242, h4 = 2773480762;
        for (let i = 0, k; i < str.length; i++) {
            k = str.charCodeAt(i);
            h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
            h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
            h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
            h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
        }
        h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
        h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
        h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
        h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
        return (h1 ^ h2 ^ h3 ^ h4) >>> 0;
    };

    // Generate random positions using "Halfway Point" seed
    useEffect(() => {
        // "Halfway Point" Logic
        // Combine Today's Date + My City Lat + Her City Lat -> Unique Seed for "Us"
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const myCityLat = 7.0084;   // Hat Yai (Songkhla)
        const herCityLat = 51.5074; // London
        const seedString = `${today}-${myCityLat + herCityLat}-stargazing-v1`;

        const seed = cyrb128(seedString);
        const random = seededRandom(seed);

        // Generate 50 consistent stars based on the seed
        const positions = [...Array(50)].map(() => ({
            left: random() * 100,
            top: random() * 100,
            duration: 2 + random() * 3,
            delay: random() * 2,
        }));
        setStarPositions(positions);
    }, []);

    if (starPositions.length === 0) return null;

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {starPositions.map((pos, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    style={{
                        left: `${pos.left}%`,
                        top: `${pos.top}%`,
                    }}
                    animate={{
                        opacity: [0.2, 1, 0.2],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: pos.duration,
                        repeat: Infinity,
                        delay: pos.delay,
                    }}
                />
            ))}
        </div>
    );
}

// Memory Star
function MemoryStar({ star, onClick }: { star: StarMemory; onClick: () => void }) {
    return (
        <motion.button
            className="absolute"
            style={{ left: `${star.x}%`, top: `${star.y}%` }}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.5 }}
            whileTap={{ scale: 0.9 }}
        >
            <motion.div
                className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 shadow-lg shadow-yellow-400/50"
                animate={{
                    boxShadow: [
                        '0 0 10px 2px rgba(250, 204, 21, 0.5)',
                        '0 0 20px 4px rgba(250, 204, 21, 0.8)',
                        '0 0 10px 2px rgba(250, 204, 21, 0.5)',
                    ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
            />
        </motion.button>
    );
}

export default function StargazingCanvas() {
    const [stars, setStars] = useState<StarMemory[]>([]);
    const [showPlantModal, setShowPlantModal] = useState(false);
    const [clickPosition, setClickPosition] = useState({ x: 50, y: 50 });
    const [selectedStar, setSelectedStar] = useState<StarMemory | null>(null);

    // Supabase
    const supabase = createClient();
    const { user } = useAuthUser();
    const [coupleId, setCoupleId] = useState<string | null>(null);

    // Fetch Couple ID
    useEffect(() => {
        if (!user) return;
        const fetchCouple = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('couple_id')
                .eq('id', user.id)
                .single();
            if (data?.couple_id) setCoupleId(data.couple_id);
        };
        fetchCouple();
    }, [user]);

    // Load stars from DB
    useEffect(() => {
        if (!coupleId) return;

        const fetchStars = async () => {
            const { data } = await supabase
                .from('stars')
                .select('*')
                .eq('couple_id', coupleId)
                .order('created_at', { ascending: true });

            if (data) setStars(data);
        };
        fetchStars();

        // Realtime Subscription
        const channel = supabase.channel('stars-updates')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'stars', filter: `couple_id=eq.${coupleId}` },
                (payload) => {
                    setStars(prev => [...prev, payload.new as StarMemory]);
                }
            )
            .on('postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'stars' },
                (payload) => {
                    setStars(prev => prev.filter(s => s.id !== payload.old.id));
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [coupleId]);

    // Handle sky click
    const handleSkyClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setClickPosition({ x, y });
        setShowPlantModal(true);
    }, []);

    // Handle plant star
    const handlePlantStar = async (type: 'photo' | 'note', content: string, caption?: string) => {
        if (!user || !coupleId) return;

        let imageUrl = null;
        let message = caption || content; // Default message logic

        // If photo, upload first
        if (type === 'photo') {
            // content is Base64 here from the modal, but Supabase Storage needs Blob/File
            // Convert Base64 to Blob
            const res = await fetch(content);
            const blob = await res.blob();

            const filename = `${coupleId}/${Date.now()}-star.png`;
            const { error: uploadError } = await supabase.storage
                .from('memories')
                .upload(filename, blob);

            if (uploadError) {
                console.error('Star upload failed', uploadError);
                return;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('memories')
                .getPublicUrl(filename);

            imageUrl = publicUrl;
            message = caption || ''; // Caption becomes the message
        } else {
            // Note
            message = content;
        }

        // Insert to DB
        const { data: newStar, error } = await supabase
            .from('stars')
            .insert({
                user_id: user.id,
                couple_id: coupleId,
                x: clickPosition.x,
                y: clickPosition.y,
                message: message,
                image_url: imageUrl
            })
            .select() // Return the inserted row
            .single();

        if (error) {
            console.error('Plant Star Error:', error);
        } else if (newStar) {
            // Optimistically add to state (avoids refresh requirement)
            setStars(prev => [...prev, newStar as StarMemory]);
        }
    };

    // Handle delete star
    const handleDeleteStar = async (id: string) => {
        // Optimistic delete
        setStars(prev => prev.filter(s => s.id !== id));

        const { error } = await supabase
            .from('stars')
            .delete()
            .eq('id', id);

        if (error) console.error('Delete star error:', error);
    };

    return (
        <div className="fixed inset-0 flex flex-col">
            {/* Night Sky Background */}
            <div
                className="flex-1 relative bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#2a1a4a] cursor-crosshair"
                onClick={handleSkyClick}
            >
                {/* Title */}
                <motion.div
                    className="absolute top-4 left-1/2 -translate-x-1/2 z-10"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-xl font-bold text-white/90 flex items-center gap-2">
                        <span>⭐</span>
                        Our Stars
                        <span>⭐</span>
                    </h1>
                    <p className="text-center text-white/50 text-xs mt-1">
                        Tap the sky to plant a memory
                    </p>
                </motion.div>

                {/* Twinkling Background Stars */}
                <TwinklingStars />

                {/* Memory Stars */}
                {stars.map((star) => (
                    <MemoryStar
                        key={star.id}
                        star={star}
                        onClick={() => setSelectedStar(star)}
                    />
                ))}

                {/* Shooting star decoration */}
                <motion.div
                    className="absolute w-1 h-1 bg-white rounded-full"
                    initial={{ left: '10%', top: '20%', opacity: 0 }}
                    animate={{
                        left: ['10%', '30%'],
                        top: ['20%', '40%'],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 8,
                    }}
                />
            </div>

            {/* Plant Star Modal */}
            <AnimatePresence>
                {showPlantModal && (
                    <PlantStarModal
                        isOpen={showPlantModal}
                        onClose={() => setShowPlantModal(false)}
                        position={clickPosition}
                        onSubmit={handlePlantStar}
                    />
                )}
            </AnimatePresence>

            {/* View Star Modal */}
            <AnimatePresence>
                {selectedStar && (
                    <ViewStarModal
                        star={selectedStar}
                        onClose={() => setSelectedStar(null)}
                        onDelete={handleDeleteStar}
                    />
                )}
            </AnimatePresence>

            {/* Bottom Navigation */}
            <BottomNav />
        </div>
    );
}
