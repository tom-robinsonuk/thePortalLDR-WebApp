'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eraser, Trash2, ArrowLeft, Sparkles, Save, History, X } from 'lucide-react';
import { saveDrawing, getDrawings, deleteDrawing, SavedDrawing } from '@/lib/drawingStore';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Pastel color palette
const COLORS = {
    pink: '#FFB6C1',
    blue: '#87CEEB',
    yellow: '#FFE4B5',
    eraser: '#FFFFFF',
};

type ColorKey = keyof typeof COLORS;

interface Point {
    x: number;
    y: number;
}

interface Stroke {
    id: string;
    points: Point[];
    color: string;
    size: number;
}

export default function DrawingCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentColor, setCurrentColor] = useState<ColorKey>('pink');
    const [brushSize] = useState(8);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
    const [showClearAnimation, setShowClearAnimation] = useState(false);
    const [showSaveAnimation, setShowSaveAnimation] = useState(false);
    const [savedDrawings, setSavedDrawings] = useState<SavedDrawing[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [selectedDrawing, setSelectedDrawing] = useState<SavedDrawing | null>(null);
    const lastPointRef = useRef<Point | null>(null);

    // Resize canvas to fill screen
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            }
            // Redraw all strokes after resize
            redrawCanvas();
        };

        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    // Redraw canvas whenever strokes change
    const redrawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw all strokes
        strokes.forEach(stroke => {
            if (stroke.points.length < 2) return;

            ctx.beginPath();
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.size;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }
            ctx.stroke();
        });
    }, [strokes]);

    useEffect(() => {
        redrawCanvas();
    }, [strokes, redrawCanvas]);

    // Subscribe to realtime drawing updates
    useEffect(() => {
        if (!isSupabaseConfigured || !supabase) return;

        const channel = supabase
            .channel('drawing-room')
            .on('broadcast', { event: 'stroke' }, ({ payload }) => {
                if (payload.stroke) {
                    setStrokes(prev => [...prev, payload.stroke]);
                }
            })
            .on('broadcast', { event: 'clear' }, () => {
                setStrokes([]);
                setShowClearAnimation(true);
                setTimeout(() => setShowClearAnimation(false), 800);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Load saved drawings on mount
    useEffect(() => {
        setSavedDrawings(getDrawings());
    }, []);

    // Get coordinates from event
    const getCoordinates = (e: React.MouseEvent | React.TouchEvent): Point | null => {
        const canvas = canvasRef.current;
        if (!canvas) return null;

        const rect = canvas.getBoundingClientRect();

        if ('touches' in e) {
            const touch = e.touches[0];
            if (!touch) return null;
            return {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top,
            };
        } else {
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        }
    };

    // Draw line between two points
    const drawLine = (from: Point, to: Point, color: string, size: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
    };

    // Start drawing
    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const point = getCoordinates(e);
        if (!point) return;

        setIsDrawing(true);
        setCurrentStroke([point]);
        lastPointRef.current = point;
    };

    // Continue drawing
    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        e.preventDefault();

        const point = getCoordinates(e);
        if (!point || !lastPointRef.current) return;

        const color = COLORS[currentColor];
        const size = currentColor === 'eraser' ? brushSize * 3 : brushSize;

        drawLine(lastPointRef.current, point, color, size);
        setCurrentStroke(prev => [...prev, point]);
        lastPointRef.current = point;
    };

    // Stop drawing
    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);

        if (currentStroke.length > 1) {
            const newStroke: Stroke = {
                id: Date.now().toString(),
                points: currentStroke,
                color: COLORS[currentColor],
                size: currentColor === 'eraser' ? brushSize * 3 : brushSize,
            };

            setStrokes(prev => [...prev, newStroke]);

            // Broadcast to partner
            if (isSupabaseConfigured && supabase) {
                supabase.channel('drawing-room').send({
                    type: 'broadcast',
                    event: 'stroke',
                    payload: { stroke: newStroke },
                });
            }
        }

        setCurrentStroke([]);
        lastPointRef.current = null;
    };

    // Clear all
    const handleClear = () => {
        setStrokes([]);
        setShowClearAnimation(true);
        setTimeout(() => setShowClearAnimation(false), 800);

        // Broadcast clear to partner
        if (isSupabaseConfigured && supabase) {
            supabase.channel('drawing-room').send({
                type: 'broadcast',
                event: 'clear',
                payload: {},
            });
        }
    };

    // Save current drawing
    const handleSave = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Export canvas as PNG data URL
        const dataUrl = canvas.toDataURL('image/png');
        const newDrawing = saveDrawing(dataUrl);
        setSavedDrawings(prev => [newDrawing, ...prev]);

        // Show save animation
        setShowSaveAnimation(true);
        setTimeout(() => setShowSaveAnimation(false), 800);
    };

    // Delete a drawing from history
    const handleDeleteDrawing = (id: string) => {
        deleteDrawing(id);
        setSavedDrawings(prev => prev.filter(d => d.id !== id));
        setSelectedDrawing(null);
    };

    return (
        <div className="fixed inset-0 flex flex-col bg-white">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 z-10 p-3 flex items-center justify-between">
                <Link href="/">
                    <motion.button
                        className="p-2 rounded-full bg-portal-pink/80 backdrop-blur-sm shadow-md"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ArrowLeft className="w-5 h-5 text-[var(--text-primary)]" />
                    </motion.button>
                </Link>

                <motion.h1
                    className="text-lg font-semibold text-[var(--text-primary)] bg-white/80 backdrop-blur-sm px-4 py-1 rounded-full shadow-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    Scribble Nook 🎨
                </motion.h1>

                <div className="w-9" /> {/* Spacer for centering */}
            </div>

            {/* Clear Animation */}
            <AnimatePresence>
                {showClearAnimation && (
                    <motion.div
                        className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: 0 }}
                            animate={{ scale: [0, 1.5, 0], rotate: 180 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <Sparkles className="w-24 h-24 text-portal-purple" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Save Animation */}
            <AnimatePresence>
                {showSaveAnimation && (
                    <motion.div
                        className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.2, 1] }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="bg-portal-purple/90 rounded-full p-4"
                        >
                            <Save className="w-12 h-12 text-white" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Canvas */}
            <canvas
                ref={canvasRef}
                className="flex-1 touch-none cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />

            {/* Bottom Toolbar */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 p-4 flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="bg-white/90 backdrop-blur-md rounded-full px-4 py-3 shadow-lg flex items-center gap-3">
                    {/* Color buttons */}
                    {(['pink', 'blue', 'yellow'] as const).map((color) => (
                        <motion.button
                            key={color}
                            onClick={() => setCurrentColor(color)}
                            className={`w-10 h-10 rounded-full transition-all ${currentColor === color
                                ? 'ring-4 ring-[var(--text-primary)] ring-offset-2 scale-110'
                                : 'hover:scale-105'
                                }`}
                            style={{ backgroundColor: COLORS[color] }}
                            whileHover={{ scale: currentColor === color ? 1.1 : 1.08 }}
                            whileTap={{ scale: 0.95 }}
                        />
                    ))}

                    {/* Divider */}
                    <div className="w-px h-8 bg-gray-200 mx-1" />

                    {/* Eraser */}
                    <motion.button
                        onClick={() => setCurrentColor('eraser')}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border-2 border-gray-200 ${currentColor === 'eraser'
                            ? 'ring-4 ring-[var(--text-primary)] ring-offset-2 scale-110 bg-gray-100'
                            : 'bg-white hover:bg-gray-50'
                            }`}
                        whileHover={{ scale: currentColor === 'eraser' ? 1.1 : 1.08 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Eraser className="w-5 h-5 text-gray-500" />
                    </motion.button>

                    {/* Clear All */}
                    <motion.button
                        onClick={handleClear}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-portal-purple/20 hover:bg-portal-purple/30 transition-colors"
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Trash2 className="w-5 h-5 text-portal-purple-dark" />
                    </motion.button>

                    {/* Divider */}
                    <div className="w-px h-8 bg-gray-200 mx-1" />

                    {/* Save */}
                    <motion.button
                        onClick={handleSave}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-portal-sky/30 hover:bg-portal-sky/50 transition-colors"
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Save className="w-5 h-5 text-[var(--text-primary)]" />
                    </motion.button>

                    {/* History */}
                    <motion.button
                        onClick={() => setShowHistory(true)}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-portal-pink/30 hover:bg-portal-pink/50 transition-colors"
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <History className="w-5 h-5 text-[var(--text-primary)]" />
                    </motion.button>
                </div>
            </motion.div>

            {/* Demo Mode indicator */}
            {!isSupabaseConfigured && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 text-xs text-[var(--text-secondary)] bg-portal-purple/20 px-3 py-1 rounded-full">
                    ✨ Demo Mode
                </div>
            )}

            {/* History Drawer (Glassmorphism sidebar) */}
            <AnimatePresence>
                {showHistory && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="fixed inset-0 z-30 bg-black/30"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowHistory(false)}
                        />

                        {/* Drawer */}
                        <motion.div
                            className="fixed top-0 right-0 bottom-0 z-40 w-72 sm:w-80"
                            style={{
                                background: 'rgba(255, 255, 255, 0.15)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                borderLeft: '1px solid rgba(255, 255, 255, 0.3)',
                            }}
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-white/20">
                                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                                    📜 History
                                </h2>
                                <motion.button
                                    onClick={() => setShowHistory(false)}
                                    className="p-2 rounded-full bg-white/30 hover:bg-white/50"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <X className="w-5 h-5 text-[var(--text-primary)]" />
                                </motion.button>
                            </div>

                            {/* Thumbnail Grid */}
                            <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
                                {savedDrawings.length === 0 ? (
                                    <div className="text-center text-[var(--text-secondary)] py-12">
                                        <Save className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>No drawings saved yet!</p>
                                        <p className="text-sm mt-1">Tap 💾 to save your art</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {savedDrawings.map((drawing) => (
                                            <motion.button
                                                key={drawing.id}
                                                onClick={() => setSelectedDrawing(drawing)}
                                                className="aspect-square rounded-xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <img
                                                    src={drawing.imageData}
                                                    alt="Saved drawing"
                                                    className="w-full h-full object-cover"
                                                />
                                            </motion.button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Drawing Modal (Full view) */}
            <AnimatePresence>
                {selectedDrawing && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedDrawing(null)}
                    >
                        <motion.div
                            className="bg-white rounded-3xl p-4 max-w-lg w-full shadow-2xl"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-[var(--text-secondary)]">
                                    {new Date(selectedDrawing.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </span>
                                <motion.button
                                    onClick={() => setSelectedDrawing(null)}
                                    className="p-2 rounded-full hover:bg-gray-100"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <X className="w-5 h-5 text-[var(--text-primary)]" />
                                </motion.button>
                            </div>

                            {/* Drawing Image */}
                            <img
                                src={selectedDrawing.imageData}
                                alt="Saved drawing"
                                className="w-full rounded-xl shadow-inner"
                            />

                            {/* Delete Button */}
                            <motion.button
                                onClick={() => handleDeleteDrawing(selectedDrawing.id)}
                                className="mt-4 w-full py-2 text-red-400 hover:text-red-500 flex items-center justify-center gap-2 text-sm"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete drawing
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
