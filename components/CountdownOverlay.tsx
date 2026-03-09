"use client";

import React, { useState, useEffect } from 'react';

interface CountdownOverlayProps {
    startAt: number; // Timestamp when countdown hits 0
    onComplete: () => void;
}

const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ startAt, onComplete }) => {
    const [count, setCount] = useState<number | string>(3);
    const onCompleteRef = React.useRef(onComplete);

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, Math.ceil((startAt - now) / 1000));

            if (remaining <= 0) {
                setCount("GO!");
                clearInterval(interval);
                setTimeout(() => onCompleteRef.current(), 1000);
            } else {
                setCount(remaining);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [startAt]);

    const DEVANAGARI_MAP: Record<string, string> = {
        '3': '३',
        '2': '२',
        '1': '१',
        'GO!': 'चलो!'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0b09]/95 backdrop-blur-2xl animate-in fade-in duration-500 select-none overflow-hidden">
            {/* Background Glitch interference */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
                style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, #f5a623 1px, #f5a623 2px)', backgroundSize: '100% 4px' }} />

            <div className="text-center relative z-10">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#f5a623]/10 blur-[120px] rounded-full -z-10" />

                <div className="text-[10px] uppercase font-black tracking-[0.8em] text-[#f5a623]/40 mb-12 animate-pulse flex items-center justify-center gap-4">
                    <div className="h-px w-8 bg-[#f5a623]/20" />
                    SECTOR_INITIALIZATION
                    <div className="h-px w-8 bg-[#f5a623]/20" />
                </div>

                <div className="relative group">
                    <div className="text-[220px] font-black italic tracking-tighter leading-none text-[#f5a623] drop-shadow-[0_0_80px_rgba(245,166,35,0.4)] animate-bounce select-none">
                        {count}
                    </div>
                    {/* Devanagari Accent */}
                    <div className="absolute -top-12 -right-8 text-6xl font-black text-[#f5a623]/10 italic select-none pointer-events-none">
                        {DEVANAGARI_MAP[count.toString()] || ''}
                    </div>
                    {/* Shadow Copy for depth */}
                    <div className="absolute top-4 left-4 text-[220px] font-black italic tracking-tighter leading-none text-[#f5a623]/5 -z-10 pointer-events-none">
                        {count}
                    </div>
                </div>

                <div className="mt-16 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-4 text-[8px] uppercase font-bold tracking-[0.6em] text-white/30">
                        <span>LATENCY_SYNC: OPTIMAL</span>
                        <div className="w-1 h-1 bg-[#f5a623] rounded-full animate-ping" />
                        <span>BUFFER: CLEAR</span>
                    </div>
                    <div className="w-64 h-[2px] bg-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[#f5a623]/60 transition-all duration-300"
                            style={{ width: count === 'GO!' ? '100%' : `${100 - (Number(count) || 0) * 33}%` }} />
                    </div>
                </div>
            </div>

            {/* Corner Metadata */}
            <div className="absolute top-12 left-12 text-[8px] font-mono text-[#f5a623]/20 flex flex-col gap-1">
                <span>UPLINK_STRENGTH: 98%</span>
                <span>PACKET_LOSS: 0.00%</span>
            </div>
            <div className="absolute bottom-12 right-12 text-[8px] font-mono text-[#f5a623]/20 text-right flex flex-col gap-1">
                <span>CALIBRATION_NODE: JAISALMER_S1</span>
                <span>SYSTEM_STATE: ARMED</span>
            </div>
        </div>
    );
};

export default CountdownOverlay;
