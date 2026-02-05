import MoodTracker from '@/components/MoodTracker';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Mood 💭 | The Portal',
    description: 'How are you feeling today?',
};

export default function MoodPage() {
    const userId = 'tom';
    const partnerId = 'arty';

    return (
        <main className="min-h-screen flex flex-col p-4 pb-24">
            <div className="portal-container space-y-4">
                <Header />
                <MoodTracker userId={userId} partnerId={partnerId} />
            </div>
            <BottomNav />
        </main>
    );
}
