"use client";

import { useEffect } from "react";
import BunkerBackground from "@/components/BunkerBackground";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an analytics service or dashboard
        console.error("CRITICAL_SYSTEM_FAILURE:", error);
    }, [error]);

    return (
        <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#0d0b09] text-[#f5a623] font-rajdhani">
            <BunkerBackground />

            {/* Tactical Noise Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-50 overflow-hidden">
                <div className="absolute inset-0 bg-[#f5a623]/20 animate-pulse" />
            </div>

            <div className="relative z-10 flex flex-col items-center max-w-2xl px-6 text-center">
                {/* Warning Icon/Symbol */}
                <div className="mb-8 p-6 border-2 border-[#f5a623] animate-pulse">
                    <div className="text-6xl font-black italic tracking-tighter">! ERROR !</div>
                </div>

                <h1 className="text-4xl font-black italic tracking-tighter mb-4 uppercase">
                    SYSTEM_PROTOCOL_BREACHED
                </h1>

                <p className="text-lg font-medium opacity-60 mb-12 uppercase tracking-widest max-w-md">
                    A critical malfunction has occurred in the neural uplink. Operative connection is unstable.
                    Uncaught exception detected in sector: <span className="text-white opacity-40 font-mono">[{error.digest || "GLOBAL_KERNEL"}]</span>
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <button
                        onClick={() => reset()}
                        className="px-10 py-4 bg-[#f5a623] text-black font-black uppercase tracking-[0.2em] hover:bg-[#ffb347] transition-all transform active:scale-95 shadow-[0_0_20px_rgba(245,166,35,0.3)]"
                    >
                        REBOOT_INTERFACE
                    </button>

                    <button
                        onClick={() => window.location.href = "/"}
                        className="px-10 py-4 border border-[#f5a623]/50 text-[#f5a623] font-black uppercase tracking-[0.2em] hover:bg-[#f5a623]/10 transition-all transform active:scale-95"
                    >
                        ABORT_MISSION
                    </button>
                </div>

                <div className="mt-16 pt-8 border-t border-[#f5a623]/10 w-full text-[10px] font-mono opacity-20 uppercase tracking-[0.3em]">
                    Error Logged // Session ID: {Math.random().toString(36).substring(7).toUpperCase()} // Stand by for diagnostics
                </div>
            </div>
        </main>
    );
}
