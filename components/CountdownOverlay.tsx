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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0b09]/95 backdrop-blur-2xl animate-in fade-in duration-500 select-none">
            <div className="text-center relative">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#f5a623]/10 blur-[100px] rounded-full -z-10" />

                <div className="text-[10px] uppercase font-black tracking-[0.8em] text-[#f5a623]/40 mb-12 animate-pulse flex items-center justify-center gap-4">
                    <div className="h-px w-8 bg-[#f5a623]/20" />
                    PREPARING_SECTOR
                    <div className="h-px w-8 bg-[#f5a623]/20" />
                </div>

                <div className="relative">
                    <div className="text-[180px] font-black italic tracking-tighter leading-none text-[#f5a623] drop-shadow-[0_0_80px_rgba(245,166,35,0.4)] animate-bounce select-none">
                        {count}
                    </div>
                    {/* Shadow Copy for depth */}
                    <div className="absolute top-2 left-2 text-[180px] font-black italic tracking-tighter leading-none text-[#f5a623]/5 -z-10 pointer-events-none">
                        {count}
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center gap-2">
                    <div className="text-[8px] uppercase font-bold tracking-[0.4em] text-white/20">Establishing Neural Link...</div>
                    <div className="w-48 h-[2px] bg-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[#f5a623]/40 animate-progress" style={{ width: count === 'GO!' ? '100%' : `${100 - (Number(count) || 0) * 33}%` }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CountdownOverlay;
