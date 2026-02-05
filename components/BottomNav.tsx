'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Smile, PenTool, Sparkles, Star } from 'lucide-react';

interface NavItem {
    href: string;
    icon: React.ReactNode;
    label: string;
    disabled?: boolean;
}

const navItems: NavItem[] = [
    { href: '/', icon: <Home className="w-5 h-5" />, label: 'Home' },
    { href: '/mood', icon: <Smile className="w-5 h-5" />, label: 'Mood' },
    { href: '/draw', icon: <PenTool className="w-5 h-5" />, label: 'Draw' },
    { href: '#', icon: <Sparkles className="w-5 h-5" />, label: 'Play', disabled: true },
    { href: '/stars', icon: <Star className="w-5 h-5" />, label: 'Stars' },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <motion.nav
            className="fixed bottom-0 left-0 right-0 z-50 p-2 pb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className="max-w-md mx-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-lg py-2 px-3">
                <div className="flex justify-around items-center">
                    {navItems.map((item) => {
                        const isActive = !item.disabled && pathname === item.href;
                        const isDisabled = item.disabled;

                        return (
                            <Link
                                key={item.label}
                                href={isDisabled ? '#' : item.href}
                                className={isDisabled ? 'pointer-events-none' : ''}
                            >
                                <motion.div
                                    className={`
                    flex flex-col items-center p-2 rounded-xl min-w-[50px] transition-all
                    ${isActive
                                            ? 'bg-portal-pink/40 text-[var(--text-primary)]'
                                            : isDisabled
                                                ? 'opacity-30 text-gray-400'
                                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                        }
                  `}
                                    whileHover={!isDisabled ? { scale: 1.05 } : {}}
                                    whileTap={!isDisabled ? { scale: 0.95 } : {}}
                                >
                                    {item.icon}
                                    <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </motion.nav>
    );
}
