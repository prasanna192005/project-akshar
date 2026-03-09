"use client";

import { useEffect, useState } from "react";
import { AGENT_TIPS } from "@/lib/tips";
import BunkerBackground from "./BunkerBackground";

export default function LoadingScreen() {
    const [tip, setTip] = useState("");

    useEffect(() => {
        const randomTip = AGENT_TIPS[Math.floor(Math.random() * AGENT_TIPS.length)];
        setTip(randomTip);
    }, []);

    return (
        <div className="fixed inset-0 z-[200] bg-[#0d0b09] flex flex-col items-center justify-center p-8 overflow-hidden font-mono">
            <BunkerBackground />

            {/* Logo/Name */}
            <div className="mb-12 text-center relative z-10">
                <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-[#f5a623] mb-2 animate-pulse drop-shadow-[0_0_30px_rgba(245,166,35,0.3)]">
                    AKSHAR
                </h1>
                <div className="h-1.5 w-32 bg-[#f5a623] mx-auto shadow-[0_0_15px_rgba(245,166,35,0.5)]" />
            </div>

            {/* Spinner */}
            <div className="relative w-20 h-20 mb-16 z-10">
                <div className="absolute inset-0 border-[6px] border-[#f5a623]/10 rounded-full" />
                <div className="absolute inset-0 border-[6px] border-[#f5a623] rounded-full border-t-transparent animate-spin shadow-[0_0_20px_rgba(245,166,35,0.3)]" />
            </div>

            {/* Tip Section */}
            <div className="max-w-md w-full text-center relative z-10">
                <span className="text-[10px] uppercase font-black tracking-[0.4em] text-[#f5a623] block mb-4">
                    [ TACTICAL_INTEL ]
                </span>
                <p className="text-white/80 text-lg font-bold leading-relaxed italic border-x border-[#f5a623]/20 px-6">
                    "{tip}"
                </p>
            </div>

            {/* Corner Accents */}
            <div className="absolute top-12 left-12 w-16 h-16 border-t-2 border-l-2 border-[#f5a623]/20 z-10" />
            <div className="absolute bottom-12 right-12 w-16 h-16 border-b-2 border-r-2 border-[#f5a623]/20 z-10" />

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[10px] uppercase font-black tracking-[0.6em] text-[#f5a623]/40 z-10">
                ESTABLISHING_SECURE_UPLINK...
            </div>
        </div>
    );
}
