// Star memory store for demo mode (persists in localStorage)
// When Supabase is configured, this will sync via database instead

export interface StarMemory {
    id: string;
    x: number; // percentage position
    y: number; // percentage position
    type: 'photo' | 'note';
    content: string; // base64 image or text note
    caption?: string;
    createdAt: string;
    createdBy: string;
}

const STORAGE_KEY = 'portal_stars';

// Get all stars from localStorage
export function getStars(): StarMemory[] {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

// Add a new star
export function addStar(star: Omit<StarMemory, 'id' | 'createdAt'>): StarMemory {
    const newStar: StarMemory = {
        ...star,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
    };

    const stars = getStars();
    stars.push(newStar);

    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stars));
    }

    return newStar;
}

// Get a specific star by ID
export function getStar(id: string): StarMemory | undefined {
    return getStars().find(s => s.id === id);
}

// Delete a star
export function deleteStar(id: string): void {
    const stars = getStars().filter(s => s.id !== id);
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stars));
    }
}
