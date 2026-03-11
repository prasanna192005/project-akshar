"use client";

import { AGENTS, AgentType } from "@/lib/agents";
import { AGENT_LORE } from "@/lib/lore";
import BunkerBackground from "@/components/BunkerBackground";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

export default function RosterPage() {
    const agentOrder: AgentType[] = ['BREACH', 'SAGE', 'ZEPHYR', 'PYRA', 'KILLJOY', 'VIPER', 'OMEN', 'REYNA'];
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') {
                scrollToAgent(Math.min(agentOrder.length - 1, currentIndex + 1));
            } else if (e.key === 'ArrowLeft') {
                scrollToAgent(Math.max(0, currentIndex - 1));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex]);

    const scrollToAgent = (index: number) => {
        if (scrollRef.current) {
            const width = scrollRef.current.clientWidth;
            scrollRef.current.scrollTo({
                left: width * index,
                behavior: 'smooth'
            });
            setCurrentIndex(index);
        }
    };

    // Update index on manual scroll
    const handleScroll = () => {
        if (scrollRef.current) {
            const width = scrollRef.current.clientWidth;
            const newIndex = Math.round(scrollRef.current.scrollLeft / width);
            if (newIndex !== currentIndex) {
                setCurrentIndex(newIndex);
            }
        }
    };

    return (
        <main className="h-screen bg-[#0d0b09] text-white selection:bg-[#f5a623] selection:text-black overflow-hidden flex flex-col">
            <BunkerBackground />

            {/* Navigation Overlay */}
            <nav className="fixed top-0 left-0 w-full p-8 z-[100] flex justify-between items-center pointer-events-none">
                <Link href="/" className="pointer-events-auto group flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center border border-white/20 bg-black/40 backdrop-blur-md group-hover:border-[#f5a623] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 group-hover:text-white transition-colors">Return to HQ</span>
                </Link>

                <div className="pointer-events-auto flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-[10px] font-black text-[#f5a623] tracking-[0.3em] uppercase">ROSTER_CONTROL</div>
                        <div className="text-[8px] font-bold text-white/20 uppercase">USE_ARROW_KEYS_TO_NAVIGATE</div>
                    </div>
                    <div className="w-px h-8 bg-white/10 mx-2" />
                    <div className="text-[10px] font-black tracking-[0.5em] text-white/40 italic uppercase">AKSHAR // SYSTEMS</div>
                </div>
            </nav>

            {/* Scroll Container (Horizontal) */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
            >
                {agentOrder.map((id, index) => {
                    const agent = AGENTS[id];
                    const lore = AGENT_LORE[id];

                    return (
                        <section
                            key={id}
                            className="relative min-w-full h-full flex flex-col items-center justify-center p-8 md:p-24 overflow-hidden snap-start"
                        >
                            {/* Background Image Container - Adjusted to prevent face covering */}
                            <div className="absolute inset-0 z-0">
                                <img
                                    src={lore.image}
                                    alt={agent.name}
                                    className="w-full h-full object-cover object-top opacity-40 grayscale-[0.5] hover:grayscale-0 transition-all duration-[2s]"
                                />
                                {/* Soft Vignette and Gradient to keep text readable without blocking center/top (face) */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b09] via-transparent to-[#0d0b09]/60" />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#0d0b09] via-transparent to-[#0d0b09]" />
                                <div className="absolute inset-0 bg-[#f5a623]/5 mix-blend-overlay" />
                            </div>

                            {/* Full-screen Background Text - Moved slightly to background and made even more subtle */}
                            <div className="absolute inset-x-0 bottom-24 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-[0.03]">
                                <h2 className="text-[25vw] font-black italic tracking-tighter leading-none uppercase">
                                    {agent.name}
                                </h2>
                            </div>

                            {/* Tactical Content - Shifted downwards to keep faces clear */}
                            <div className="relative z-20 max-w-6xl w-full pt-32">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">

                                    {/* Left Side: Identity */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 animate-in slide-in-from-left-4 duration-500">
                                            <span className="px-3 py-1 bg-[#f5a623] text-black text-[10px] font-black uppercase tracking-widest">Archive ID: {agent.name}</span>
                                            <span className="px-3 py-1 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest">Age: {agent.age}</span>
                                            <span className="px-3 py-1 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest">Origin: {agent.region}</span>
                                        </div>

                                        <div className="space-y-0">
                                            <h3 className="text-[12px] font-black uppercase tracking-[0.8em] text-[#f5a623] mb-2">OPERATIVE_MANIFEST</h3>
                                            <h2 className="text-8xl md:text-[10rem] font-black italic tracking-tighter leading-[0.85] text-white uppercase drop-shadow-[0_0_30px_rgba(245,166,35,0.2)]">
                                                {agent.name}
                                            </h2>
                                            <div className="flex items-center gap-6 mt-4">
                                                <div className="h-0.5 w-24" style={{ backgroundColor: agent.color }} />
                                                <span className="text-xl font-bold tracking-[.4em] uppercase text-white opacity-40 italic">{agent.tagline}</span>
                                            </div>
                                        </div>

                                        <div className="pt-8">
                                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">Real Identity:</span>
                                            <p className="text-2xl font-black italic text-white/80">{agent.realName}</p>
                                        </div>
                                    </div>

                                    {/* Right Side: Abilities - Moved lower and aligned right */}
                                    <div className="flex flex-col gap-6 lg:pb-12 lg:ml-12">
                                        <div className="p-8 bg-white/[0.03] border border-white/10 backdrop-blur-md relative group hover:bg-[#f5a623]/5 transition-colors">
                                            <div className="absolute top-0 right-0 p-2 text-[8px] font-black text-white/10 uppercase tracking-widest">SYSTEM_PASSIVE</div>
                                            <h4 className="text-[10px] font-black text-[#f5a623] uppercase tracking-[0.4em] mb-3">Protocol: Stability</h4>
                                            <p className="text-xl font-black italic tracking-tight text-white/90 group-hover:text-white transition-colors leading-relaxed">{agent.passive}</p>
                                        </div>

                                        <div className="p-8 bg-black/40 border-l-4 backdrop-blur-md relative group hover:bg-[#f5a623]/5 transition-colors" style={{ borderLeftColor: agent.color }}>
                                            <div className="absolute top-0 right-0 p-2 text-[8px] font-black text-white/10 uppercase tracking-widest text-right">SIGNATURE_ABILITY<br />[ {agent.abilityKey} ]</div>
                                            <h4 className="text-[10px] font-black text-[#f5a623] uppercase tracking-[0.4em] mb-3">Primary Tech: Engagement</h4>
                                            <p className="text-2xl font-black italic tracking-tight text-white uppercase group-hover:text-[#f5a623] transition-all leading-tight">{agent.active}</p>
                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">Module Fully Functional</span>
                                                </div>
                                                <Link
                                                    href={`/lore?agent=${id}`}
                                                    className="px-4 py-2 bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-[#f5a623] hover:text-black transition-all"
                                                >
                                                    Read Story
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Corner Metadata */}
                            <div className="absolute top-24 right-12 text-[8px] font-mono text-white/10 text-right pointer-events-none hidden md:block">
                                <div>UPLINK_STRENGTH: 98%</div>
                                <div>ENCRYPTION: AES_256_AKSHAR</div>
                                <div>LATENCY: 42ms</div>
                                <div className="mt-4 text-[#f5a623]/40">INDEX: 0{index + 1} / 0{agentOrder.length}</div>
                            </div>
                        </section>
                    );
                })}
            </div>

            {/* Pagination Dots */}
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 z-[100]">
                {agentOrder.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => scrollToAgent(i)}
                        className={`transition-all duration-300 ${i === currentIndex ? 'w-8 h-1 bg-[#f5a623]' : 'w-2 h-1 bg-white/20 hover:bg-white/40'}`}
                    />
                ))}
            </div>

            {/* Navigation Arrows (Visual only for hint) */}
            <div className="fixed bottom-12 right-12 flex gap-4 z-[100] opacity-30 hover:opacity-100 transition-opacity">
                <button
                    onClick={() => scrollToAgent(Math.max(0, currentIndex - 1))}
                    className="w-10 h-10 flex items-center justify-center border border-white/20 bg-black/40 backdrop-blur-md hover:border-[#f5a623] transition-colors"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                </button>
                <button
                    onClick={() => scrollToAgent(Math.min(agentOrder.length - 1, currentIndex + 1))}
                    className="w-10 h-10 flex items-center justify-center border border-white/20 bg-black/40 backdrop-blur-md hover:border-[#f5a623] transition-colors"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </button>
            </div>
        </main>
    );
}
