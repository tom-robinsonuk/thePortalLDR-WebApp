// Drawing store for demo mode (persists in localStorage)
// When Supabase is configured, this will sync via database instead

export interface SavedDrawing {
    id: string;
    imageData: string; // base64 data URL
    createdAt: string;
    createdBy: string;
}

const STORAGE_KEY = 'portal_drawings';

// Get all drawings from localStorage
export function getDrawings(): SavedDrawing[] {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

// Add a new drawing
export function saveDrawing(imageData: string, createdBy: string = 'me'): SavedDrawing {
    const newDrawing: SavedDrawing = {
        id: Date.now().toString(),
        imageData,
        createdAt: new Date().toISOString(),
        createdBy,
    };

    const drawings = getDrawings();
    drawings.unshift(newDrawing); // Add to beginning

    // Keep only last 20 drawings to save space
    const trimmed = drawings.slice(0, 20);

    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    }

    return newDrawing;
}

// Get a specific drawing by ID
export function getDrawing(id: string): SavedDrawing | undefined {
    return getDrawings().find(d => d.id === id);
}

// Delete a drawing
export function deleteDrawing(id: string): void {
    const drawings = getDrawings().filter(d => d.id !== id);
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(drawings));
    }
}
