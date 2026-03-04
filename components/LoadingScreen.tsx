"use client";

import { useEffect, useState } from "react";
import { AGENT_TIPS } from "@/lib/tips";

export default function LoadingScreen() {
    const [tip, setTip] = useState("");

    useEffect(() => {
        const randomTip = AGENT_TIPS[Math.floor(Math.random() * AGENT_TIPS.length)];
        setTip(randomTip);
    }, []);

    return (
        <div className="fixed inset-0 z-[200] bg-[#0F1923] flex flex-col items-center justify-center p-8">
            {/* Logo/Name */}
            <div className="mb-12 text-center">
                <h1 className="text-6xl font-black italic tracking-tighter text-white mb-2 animate-pulse">
                    TYPHÖÖN
                </h1>
                <div className="h-1 w-24 bg-[#FF4655] mx-auto" />
            </div>

            {/* Spinner */}
            <div className="relative w-16 h-16 mb-16">
                <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
                <div className="absolute inset-0 border-4 border-[#FF4655] rounded-full border-t-transparent animate-spin" />
            </div>

            {/* Tip Section */}
            <div className="max-w-md w-full text-center">
                <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#FF4655] block mb-3">
                    Tactical Intel
                </span>
                <p className="text-white text-lg font-medium leading-relaxed italic opacity-80">
                    "{tip}"
                </p>
            </div>

            {/* Corner Accents */}
            <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-white/10" />
            <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-white/10" />

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[10px] uppercase font-black tracking-[0.5em] text-white/5 opacity-50">
                Loading Environment
            </div>
        </div>
    );
}
