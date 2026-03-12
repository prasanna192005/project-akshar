"use client";

import Link from "next/link";
import BunkerBackground from "@/components/BunkerBackground";
import SkeletalButton from "@/components/SkeletalButton";
import DecryptedText from "@/components/DecryptedText";

export default function NotFound() {
    return (
        <main className="h-screen bg-[#0d0b09] text-white flex flex-col items-center justify-center p-8 relative overflow-hidden selection:bg-[#f5a623] selection:text-black">
            <BunkerBackground />

            {/* Background Error Code */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.02]">
                <span className="text-[40vw] font-black italic tracking-tighter leading-none uppercase">
                    404
                </span>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-2xl">
                <div className="space-y-4">
                    <div className="flex items-center justify-center gap-4 mb-2">
                        <div className="h-px w-12 bg-[#f5a623]/40" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#f5a623] animate-pulse">
                            SIGNAL_LOST // SECTOR_UNKNOWN
                        </span>
                        <div className="h-px w-12 bg-[#f5a623]/40" />
                    </div>

                    <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter leading-tight uppercase drop-shadow-[0_0_30px_rgba(245,166,35,0.2)]">
                        OPS_STATUS: <span className="text-[#f5a623]">OFFLINE</span>
                    </h1>

                    <p className="text-white/40 font-bold uppercase tracking-widest text-sm max-w-lg mx-auto leading-loose">
                        The requested transmission path (URI) does not exist in the AKSHAR databank.
                        The operative at this location has either been
                        <span className="text-white"> neutralized </span>
                        or
                        <span className="text-white"> nunca existió</span>.
                    </p>
                </div>

                <div className="pt-8 border-t border-white/5 w-full flex flex-col items-center gap-6">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">System Diagnostics:</span>
                        <div className="text-xs font-mono text-[#f5a623]/60 italic">
                            ERROR_CODE: <DecryptedText text="0xDEAD_PAGE" hoverText="0X404_NOT_FOUND" />
                        </div>
                    </div>

                    <Link href="/">
                        <SkeletalButton variant="primary" className="px-12 py-4">
                            <span className="text-xs font-black uppercase tracking-[0.4em]">Initialize Return to HQ</span>
                        </SkeletalButton>
                    </Link>
                </div>
            </div>

            {/* Decorative Overlays */}
            <div className="absolute top-12 left-12 text-[8px] font-mono text-white/10 uppercase tracking-[0.2em] pointer-events-none">
                UPLINK_STATUS: TERMINATED<br />
                ERROR_LOG_ID: {Math.random().toString(16).substring(2, 10).toUpperCase()}
            </div>

            <div className="absolute bottom-12 right-12 text-[8px] font-mono text-white/10 uppercase tracking-[0.2em] pointer-events-none text-right">
                AKSHAR_CORE_SYSTEMS<br />
                RE-ROUTING_ATTEMPT_1
            </div>
        </main>
    );
}
