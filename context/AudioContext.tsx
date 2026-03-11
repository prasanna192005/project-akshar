"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

type AudioMode = 'chill' | 'intense' | 'none';

interface AudioContextType {
    mode: AudioMode;
    setMode: (mode: AudioMode) => void;
    isMuted: boolean;
    setIsMuted: (muted: boolean) => void;
    volume: number;
    setVolume: (volume: number) => void;
    toggleMute: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<AudioMode>('none');
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0.15); // Lower default volume
    const pathname = usePathname();

    const chillAudio = useRef<HTMLAudioElement | null>(null);
    const intenseAudio = useRef<HTMLAudioElement | null>(null);
    const modeRef = useRef<AudioMode>('none');
    const hasInteracted = useRef(false);

    // Sync modeRef to avoid effect re-runs
    useEffect(() => {
        modeRef.current = mode;
    }, [mode]);

    // Initialize audio on mount
    useEffect(() => {
        const chill = new Audio('/audio/chill_menu.mp3');
        chill.loop = true;
        chill.preload = "auto";
        chillAudio.current = chill;

        const intense = new Audio('/audio/intense_race.mp3');
        intense.loop = true;
        intense.preload = "auto";
        intenseAudio.current = intense;

        console.log("[AudioEngine] Initialized. Default Volume: 0.15");

        const handleFirstInteraction = () => {
            if (hasInteracted.current) return;
            hasInteracted.current = true;

            console.log("[AudioEngine] First interaction. Syncing state for mode:", modeRef.current);
            if (modeRef.current === 'chill') {
                chill.play().catch(() => { });
            } else if (modeRef.current === 'intense') {
                intense.play().catch(() => { });
            }

            window.removeEventListener('click', handleFirstInteraction);
            window.removeEventListener('keydown', handleFirstInteraction);
            window.removeEventListener('touchstart', handleFirstInteraction);
        };

        window.addEventListener('click', handleFirstInteraction);
        window.addEventListener('keydown', handleFirstInteraction);
        window.addEventListener('touchstart', handleFirstInteraction);

        // Load preferences
        const savedMute = localStorage.getItem('akshar_audio_muted');
        const savedVolume = localStorage.getItem('akshar_audio_volume');
        if (savedMute) setIsMuted(savedMute === 'true');
        if (savedVolume) setVolume(parseFloat(savedVolume));

        return () => {
            chill.pause();
            intense.pause();
            window.removeEventListener('click', handleFirstInteraction);
            window.removeEventListener('keydown', handleFirstInteraction);
            window.removeEventListener('touchstart', handleFirstInteraction);
        };
    }, []); // FIXED: Sync only once on mount

    // Handle Mute/Volume changes
    useEffect(() => {
        if (chillAudio.current) {
            chillAudio.current.muted = isMuted;
            chillAudio.current.volume = volume;
        }
        if (intenseAudio.current) {
            intenseAudio.current.muted = isMuted;
            intenseAudio.current.volume = volume;
        }
        localStorage.setItem('akshar_audio_muted', isMuted.toString());
        localStorage.setItem('akshar_audio_volume', volume.toString());
    }, [isMuted, volume]);

    // Mode Transition logic
    useEffect(() => {
        if (!chillAudio.current || !intenseAudio.current) return;

        console.log(`[AudioEngine] Mode Transition -> ${mode}`);

        if (mode === 'chill') {
            intenseAudio.current.pause();
            chillAudio.current.play().catch(() => {
                console.log("[AudioEngine] Play blocked. Awaiting interaction.");
            });
        } else if (mode === 'intense') {
            chillAudio.current.pause();
            intenseAudio.current.play().catch(() => {
                console.log("[AudioEngine] Play blocked. Awaiting interaction.");
            });
        } else {
            chillAudio.current.pause();
            intenseAudio.current.pause();
        }
    }, [mode]);

    // Auto-detect mode based on path if not explicitly controlled
    useEffect(() => {
        if (pathname === '/') {
            setMode('chill');
        } else if (pathname.startsWith('/game')) {
            // Keep chill until race status overrides it
            setMode('chill');
        } else if (pathname.startsWith('/lobby') || pathname.startsWith('/results') || pathname.startsWith('/leaderboard')) {
            setMode('chill');
        }
    }, [pathname]);

    const toggleMute = () => setIsMuted(prev => !prev);

    return (
        <AudioContext.Provider value={{ mode, setMode, isMuted, setIsMuted, volume, setVolume, toggleMute }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};
