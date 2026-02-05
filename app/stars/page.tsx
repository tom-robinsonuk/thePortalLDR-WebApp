import StargazingCanvas from '@/components/StargazingCanvas';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Our Stars ⭐ | The Portal',
    description: 'Plant memories in the sky',
};

export default function StarsPage() {
    return <StargazingCanvas />;
}
