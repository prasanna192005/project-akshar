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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="text-center">
                <div className="text-[10px] uppercase tracking-[0.8em] font-black opacity-30 mb-8 animate-pulse">
                    Prepare for Battle
                </div>
                <div className="text-[180px] font-black italic tracking-tighter leading-none text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.3)] animate-bounce">
                    {count}
                </div>
            </div>
        </div>
    );
};

export default CountdownOverlay;
