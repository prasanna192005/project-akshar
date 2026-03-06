"use client";

import React from "react";
import Link from "next/link";
import { AGENTS } from "@/lib/agents";
import BunkerBackground from "@/components/BunkerBackground";

export default function AgentsIntel() {
    return (
        <main className="min-h-screen bg-[#0d0b09] text-white p-8 md:p-16 lg:p-24 overflow-x-hidden relative">
            <BunkerBackground />
            {/* Header section */}
            <div className="max-w-7xl mx-auto mb-20 relative z-10">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-white/40 hover:text-[#f5a623] transition-colors mb-8 group"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    <span className="text-[10px] uppercase font-black tracking-[0.3em]">Back to HQ</span>
                </Link>

                <div className="relative">
                    <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-none mb-4 animate-in slide-in-from-left duration-700">
                        AGENT <span className="text-[#f5a623]">INTEL</span>
                    </h1>
                    <div className="h-1 w-24 bg-[#f5a623] mb-6 animate-in zoom-in duration-1000" />
                    <p className="text-white/40 max-w-xl text-sm leading-relaxed tracking-wide uppercase font-bold">
                        Detailed dossiers on the operational typing specialists. Master their passives and ultimates to dominate the battlefield.
                    </p>
                </div>

                {/* Decorative background text */}
                <div className="absolute top-0 right-0 text-[180px] font-black text-white/[0.02] select-none pointer-events-none -mr-40 hidden lg:block uppercase italic">
                    AKSHAR
                </div>
            </div>

            {/* Agents Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 relative z-10">
                {Object.values(AGENTS).map((agent, idx) => (
                    <div
                        key={agent.id}
                        className="group relative flex flex-col animate-in fade-in slide-in-from-bottom duration-700"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        {/* Agent accent background bar */}
                        <div
                            className="absolute -left-6 top-0 bottom-0 w-1 transition-all duration-500 group-hover:w-2"
                            style={{ backgroundColor: agent.color }}
                        />

                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <span className="text-[10px] uppercase font-black tracking-[0.4em] opacity-30 mb-2 block">
                                    Operator {agent.name.substring(0, 3)}
                                </span>
                                <h2 className="text-4xl font-black italic tracking-tighter leading-none group-hover:text-[#f5a623] transition-colors">
                                    {agent.name}
                                </h2>
                            </div>
                            <div className="text-[10px] uppercase font-black tracking-widest px-3 py-1 bg-white/5 border border-white/10 rounded">
                                {agent.cooldown}s CD
                            </div>
                        </div>

                        <p className="text-[#f5a623] text-xs font-black uppercase tracking-[0.2em] mb-4 italic">
                            "{agent.tagline}"
                        </p>

                        <div className="space-y-6">
                            <div className="p-4 bg-white/5 border border-white/5 rounded-sm hover:bg-white/10 transition-colors">
                                <span className="text-[10px] uppercase font-black tracking-[0.2em] text-white/40 block mb-2">Passive Ability</span>
                                <p className="text-sm font-bold text-white/80 leading-relaxed">
                                    {agent.passive}
                                </p>
                            </div>

                            <div className="p-4 bg-white/5 border border-white/5 rounded-sm hover:bg-white/10 transition-colors">
                                <span
                                    className="text-[10px] uppercase font-black tracking-[0.2em] block mb-2"
                                    style={{ color: agent.color }}
                                >
                                    Ultimate Ability: {agent.active.split('—')[0]}
                                </span>
                                <p className="text-sm font-bold text-white/80 leading-relaxed">
                                    {agent.active.split('—')[1]}
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1 p-3 bg-white/5 rounded-sm">
                                    <span className="text-[9px] uppercase font-black tracking-widest text-white/30 block mb-1">Charge Speed</span>
                                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${(agent.chargeRateModifier / 1.5) * 100}%`,
                                                backgroundColor: agent.color
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 p-3 bg-white/5 rounded-sm">
                                    <span className="text-[9px] uppercase font-black tracking-widest text-white/30 block mb-1">Dossier</span>
                                    <p className="text-[11px] font-bold text-white/60 truncate">
                                        {agent.lore}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Large background number */}
                        <div className="absolute -bottom-8 -right-4 text-[120px] font-black text-white/[0.03] select-none pointer-events-none group-hover:text-white/[0.05] transition-colors leading-none">
                            {(idx + 1).toString().padStart(2, '0')}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="max-w-7xl mx-auto mt-32 pt-12 border-t border-white/5 text-center relative z-10">
                <span className="text-[10px] uppercase font-black tracking-[0.5em] text-white/20">
                    AKSHAR_SYSTEMS // OPERATIVE_END_OF_FILE
                </span>
            </div>
        </main>
    );
}
