'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Smile, PenTool, Star } from 'lucide-react';

interface NavButtonProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    color: string;
    disabled?: boolean;
}

function NavButton({ href, icon, label, color, disabled }: NavButtonProps) {
    const content = (
        <motion.div
            className={`
        flex flex-col items-center justify-center p-4 rounded-2xl
        ${color} shadow-md min-w-[80px]
        ${disabled ? 'opacity-40' : 'cursor-pointer'}
      `}
            whileHover={!disabled ? { scale: 1.08, y: -5 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
        >
            <span className="text-[var(--text-primary)] mb-1">{icon}</span>
            <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
        </motion.div>
    );

    if (disabled) return content;
    return <Link href={href}>{content}</Link>;
}

export default function HomeNavButtons() {
    return (
        <div className="flex justify-center gap-4">
            <NavButton
                href="/mood"
                icon={<Smile className="w-8 h-8" />}
                label="Mood"
                color="bg-portal-pink/60"
            />
            <NavButton
                href="/draw"
                icon={<PenTool className="w-8 h-8" />}
                label="Draw"
                color="bg-portal-purple/60"
            />
            <NavButton
                href="#"
                icon={<Star className="w-8 h-8" />}
                label="Stars"
                color="bg-portal-sky/60"
                disabled
            />
        </div>
    );
}
