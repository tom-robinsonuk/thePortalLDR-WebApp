import DrawingCanvas from '@/components/DrawingCanvas';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Scribble Nook 🎨 | The Portal',
    description: 'Draw together in real-time!',
};

export default function DrawPage() {
    return <DrawingCanvas />;
}
