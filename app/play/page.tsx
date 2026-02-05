import LoveTapWar from '@/components/LoveTapWar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Love Tap War 🎮 | The Portal',
    description: 'Tap faster than your cutie!',
};

export default function PlayPage() {
    return <LoveTapWar />;
}
