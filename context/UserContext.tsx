'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserContextType {
    userName: string;
    partnerName: string;
    partnerTimezone: string; // Storing as UTC offset string e.g., "+09:00" or simple number "9"
    meetDate: string; // ISO date string
    updateSettings: (settings: Partial<UserSettings>) => void;
}

interface UserSettings {
    userName: string;
    partnerName: string;
    partnerTimezone: string;
    meetDate: string;
}

const defaultSettings: UserSettings = {
    userName: 'Me',
    partnerName: 'Cutie',
    partnerTimezone: '0', // UTC
    meetDate: '2026-04-03', // User requested default
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<UserSettings>(defaultSettings);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem('portal_user_settings');
            if (stored) {
                setSettings({ ...defaultSettings, ...JSON.parse(stored) });
            }
        } catch (e) {
            console.error("Failed to load user settings", e);
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage whenever settings change (after initial load)
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('portal_user_settings', JSON.stringify(settings));
        }
    }, [settings, isLoaded]);

    const updateSettings = React.useCallback((newSettings: Partial<UserSettings>) => {
        setSettings((prev) => ({ ...prev, ...newSettings }));
    }, []);

    return (
        <UserContext.Provider
            value={{
                ...settings,
                updateSettings,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
