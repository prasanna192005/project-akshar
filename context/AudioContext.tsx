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
    const hasInteracted = useRef(false);

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

        console.log("[AudioEngine] Audio instances initialized. Default Volume: 0.15");

        // Failsafe: Try to play on first user interaction if blocked
        const handleFirstInteraction = () => {
            if (hasInteracted.current) return;
            hasInteracted.current = true;

            console.log("[AudioEngine] First interaction detected. Syncing audio state...");
            if (mode === 'chill' && chillAudio.current?.paused) {
                chillAudio.current.play().catch(e => console.warn("Failed to play chill on interaction:", e));
            } else if (mode === 'intense' && intenseAudio.current?.paused) {
                intenseAudio.current.play().catch(e => console.warn("Failed to play intense on interaction:", e));
            }

            window.removeEventListener('click', handleFirstInteraction);
            window.removeEventListener('keydown', handleFirstInteraction);
        };

        window.addEventListener('click', handleFirstInteraction);
        window.addEventListener('keydown', handleFirstInteraction);

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
        };
    }, [mode]); // Re-run failsafe listener if mode changes while waiting for interaction

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

    // Mode Transition logic (Cross-fade)
    useEffect(() => {
        if (!chillAudio.current || !intenseAudio.current) return;

        console.log(`[AudioEngine] Transitioning to mode: ${mode}`);

        if (mode === 'chill') {
            intenseAudio.current.pause();
            chillAudio.current.play().then(() => {
                console.log("[AudioEngine] Playing chill_menu");
            }).catch((err) => {
                console.warn("[AudioEngine] Chill playback blocked:", err);
            });
        } else if (mode === 'intense') {
            chillAudio.current.pause();
            intenseAudio.current.play().then(() => {
                console.log("[AudioEngine] Playing intense_race");
            }).catch((err) => {
                console.warn("[AudioEngine] Intense playback blocked:", err);
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
