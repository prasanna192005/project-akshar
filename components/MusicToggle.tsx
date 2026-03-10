"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from '@/context/AudioContext';

const MusicToggle: React.FC = () => {
    const { isMuted, toggleMute, volume, setVolume, mode, setMode } = useAudio();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showCredits, setShowCredits] = useState(false);
    const hideTimeout = useRef<NodeJS.Timeout | null>(null);

    // Show credits when mode starts
    useEffect(() => {
        if (mode === 'intense' || mode === 'chill') {
            setShowCredits(true);
            const timer = setTimeout(() => setShowCredits(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [mode]);

    const getCreditsText = () => {
        if (mode === 'intense') return "Raga Bhairav (1982) — Charanjit Singh";
        if (mode === 'chill') return "Signs — Badmarsh & Shri";
        return "";
    };

    const getProtocolLabel = () => {
        if (mode === 'intense') return "[ SIGNAL_IDENTIFIED ]";
        if (mode === 'chill') return "[ AMBIENT_PROTOCOL ]";
        return "";
    };

    // Auto-hide volume slider
    useEffect(() => {
        if (isExpanded) {
            if (hideTimeout.current) clearTimeout(hideTimeout.current);
            hideTimeout.current = setTimeout(() => setIsExpanded(false), 3000);
        }
        return () => {
            if (hideTimeout.current) clearTimeout(hideTimeout.current);
        };
    }, [isExpanded, volume]);

    return (
        <>
            {/* The Control Node (Bottom-Left) */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => {
                        setIsExpanded(!isExpanded);
                        if (isMuted) toggleMute(); // Unmute on interaction if muted
                    }}
                    className={`relative w-10 h-10 flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 ${isExpanded || !isMuted ? 'text-[#f5a623]' : 'text-white/20'}`}
                >
                    {/* Hexagon Background SVG */}
                    <svg className="absolute inset-0 w-full h-full drop-shadow-[0_0_8px_rgba(245,166,35,0.3)]" viewBox="0 0 100 100">
                        <path
                            d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z"
                            fill="currentColor"
                            fillOpacity="0.05"
                            stroke="currentColor"
                            strokeWidth="2"
                        />
                    </svg>

                    {/* Waveform Animation (Only when playing) */}
                    {!isMuted && mode !== 'none' ? (
                        <div className="flex items-end gap-[2px] h-3">
                            <div className="w-[2px] bg-current animate-[wave_1s_ease-in-out_infinite]" style={{ height: '60%' }} />
                            <div className="w-[2px] bg-current animate-[wave_1.2s_ease-in-out_infinite]" style={{ height: '100%' }} />
                            <div className="w-[2px] bg-current animate-[wave_0.8s_ease-in-out_infinite]" style={{ height: '40%' }} />
                        </div>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 5L6 9H2v6h4l5 4V5z" />
                            {isMuted && <line x1="23" y1="9" x2="17" y2="15" />}
                        </svg>
                    )}
                </button>

                {/* Slide-out Volume Slider */}
                <div className={`flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-sm transition-all duration-500 origin-left ${isExpanded ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 -translate-x-4 pointer-events-none'}`}>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => {
                            setVolume(parseFloat(e.target.value));
                            if (hideTimeout.current) clearTimeout(hideTimeout.current);
                            hideTimeout.current = setTimeout(() => setIsExpanded(false), 3000);
                        }}
                        className="w-24 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#f5a623]"
                    />
                    <button
                        onClick={() => setMode(mode)}
                        className="text-[8px] font-black text-white/40 hover:text-[#f5a623] tracking-widest transition-colors"
                    >
                        SYNC
                    </button>
                </div>
            </div>

            {/* Timed Credits (Bottom-Right, Fixed) */}
            <div className={`fixed bottom-10 right-10 z-[100] transition-all duration-700 transform ${showCredits ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                        <div className="h-[2px] w-8 bg-[#f5a623] animate-[grow_0.5s_ease-out]" />
                        <span className="text-[9px] font-black text-[#f5a623] tracking-[0.3em] uppercase">{getProtocolLabel()}</span>
                    </div>
                    <span className="text-[11px] font-black italic text-white/80 tracking-tight uppercase">
                        {getCreditsText()}
                    </span>
                    <div className="flex gap-1 mt-1">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-1 h-1 bg-[#f5a623]/20 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes wave {
                    0%, 100% { height: 30%; }
                    50% { height: 100%; }
                }
                @keyframes grow {
                    from { width: 0; }
                    to { width: 32px; }
                }
            `}</style>
        </>
    );
};

export default MusicToggle;
