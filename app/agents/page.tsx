"use client";

import { AGENTS, AgentType } from "@/lib/agents";
import { AGENT_LORE } from "@/lib/lore";
import BunkerBackground from "@/components/BunkerBackground";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

export default function AgentsPage() {
    const agentOrder: AgentType[] = ['BREACH', 'SAGE', 'ZEPHYR', 'PYRA', 'KILLJOY', 'VIPER', 'OMEN', 'REYNA'];
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Keyboard and Wheel Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') {
                scrollToAgent(Math.min(agentOrder.length - 1, currentIndex + 1));
            } else if (e.key === 'ArrowLeft') {
                scrollToAgent(Math.max(0, currentIndex - 1));
            }
        };

        const handleWheel = (e: WheelEvent) => {
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                if (scrollRef.current) {
                    scrollRef.current.scrollLeft += e.deltaY;
                    e.preventDefault();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        const scrollEl = scrollRef.current;
        if (scrollEl) {
            scrollEl.addEventListener('wheel', handleWheel as any, { passive: false });
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (scrollEl) {
                scrollEl.removeEventListener('wheel', handleWheel as any);
            }
        };
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
                        <div className="text-[10px] font-black text-[#f5a623] tracking-[0.3em] uppercase">OPERATIVE_MANIFEST</div>
                        <div className="text-[8px] font-bold text-white/20 uppercase">SCROLL_VERTICALLY_TO_NAVIGATE</div>
                    </div>
                    <div className="w-px h-8 bg-white/10 mx-2" />
                    <div className="text-[10px] font-black tracking-[0.5em] text-white/40 italic uppercase">AKSHAR // SYSTEMS</div>
                </div>
            </nav>

            {/* Scroll Container (Horizontal) */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 flex overflow-x-auto snap-x snap-mandatory scrollbar-none scroll-smooth"
                style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
            >
                {agentOrder.map((id, index) => {
                    const agent = AGENTS[id];
                    const lore = AGENT_LORE[id];

                    // Specific positioning based on agent artwork composition
                    const getObjectPosition = (agentId: string) => {
                        if (agentId === 'SAGE') return '40% top'; // Nudge Meera Nair (Sutra) to the left
                        if (agentId === 'OMEN') return 'center top';
                        return 'top';
                    };

                    return (
                        <section
                            key={id}
                            className="relative min-w-full h-full flex flex-col items-center justify-center p-8 md:p-24 overflow-hidden snap-start"
                        >
                            {/* Background Image Container - Face Priority */}
                            <div className="absolute inset-0 z-0">
                                <img
                                    src={lore.image}
                                    alt={agent.name}
                                    className={`w-full h-full object-cover opacity-50 grayscale-[0.3] hover:grayscale-0 transition-all duration-[2s] ${id === 'SAGE' ? 'scale-x-[1]' : ''}`}
                                    style={{ objectPosition: getObjectPosition(id) }}
                                />
                                {/* Progressive Fade for readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b09] via-transparent to-[#0d0b09]/40" />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#0d0b09] via-transparent to-[#0d0b09]" />
                                <div className="absolute inset-0 bg-[#f5a623]/5 mix-blend-overlay" />
                            </div>

                            {/* Ultra-Subtle Watermark */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-[0.02]">
                                <h2 className="text-[30vw] font-black italic tracking-tighter leading-none uppercase">
                                    {agent.name}
                                </h2>
                            </div>

                            {/* Tactical Content - Identity back to Bottom-Left, keeping Abilities at Bottom-Right */}
                            <div className="relative z-20 max-w-[95vw] w-full pt-40 md:pt-48 lg:pt-56">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">

                                    {/* Left Side: Identity - Back to Bottom-Left */}
                                    <div className="space-y-4 mb-8 lg:mb-12">
                                        <div className="flex items-center gap-4 animate-in slide-in-from-left-4 duration-500">
                                            <span className="px-3 py-1 bg-[#f5a623] text-black text-[10px] font-black uppercase tracking-widest">Archive ID: {agent.name}</span>
                                            <span className="px-3 py-1 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest">Age: {agent.age}</span>
                                            <span className="px-3 py-1 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest">Origin: {agent.region}</span>
                                        </div>

                                        <div className="space-y-0">
                                            <h3 className="text-[12px] font-black uppercase tracking-[0.8em] text-[#f5a623] mb-2 font-mono">OPERATIVE_MANIFEST</h3>
                                            <h2 className="text-7xl md:text-[9rem] font-black italic tracking-tighter leading-[0.85] text-white uppercase drop-shadow-[0_0_40px_rgba(245,166,35,0.3)]">
                                                {agent.name}
                                            </h2>
                                            <div className="flex items-center gap-6 mt-4">
                                                <div className="h-0.5 w-24" style={{ backgroundColor: agent.color }} />
                                                <span className="text-xl font-bold tracking-[.4em] uppercase text-white opacity-50 italic">{agent.tagline}</span>
                                            </div>
                                        </div>

                                        <div className="pt-8 space-y-4">
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">Real Identity:</span>
                                                <p className="text-2xl font-black italic text-white/80">{agent.realName}</p>
                                            </div>
                                            <div className="max-w-md">
                                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">Archive Summary:</span>
                                                <p className="text-xs font-bold text-white/40 leading-relaxed mt-1 uppercase tracking-wider">{agent.lore}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Side: Abilities - Shifted to absolute BOTTOM RIGHT */}
                                    <div className="flex flex-col gap-4 pb-2 lg:pb-4 lg:ml-auto lg:max-w-lg lg:mr-[-35px]">
                                        <div className="flex gap-4">
                                            <div className="flex-1 p-3 bg-white/[0.03] border border-white/10 backdrop-blur-md relative group hover:bg-[#f5a623]/5 transition-colors">
                                                <div className="absolute top-0 right-0 p-2 text-[6px] font-black text-white/10 uppercase tracking-widest">CHARGE_VELOCITY</div>
                                                <h4 className="text-[8px] font-black text-[#f5a623] uppercase tracking-[0.2em] mb-1 font-mono text-xs">Kinetic Potential</h4>
                                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-1">
                                                    <div
                                                        className="h-full bg-[#f5a623] shadow-[0_0_10px_#f5a623]"
                                                        style={{ width: `${(agent.chargeRateModifier / 1.5) * 100}%` }}
                                                    />
                                                </div>
                                                <div className="mt-1 text-[7px] font-bold text-white/20 uppercase tracking-widest flex justify-between">
                                                    <span>{agent.chargeRateModifier}x</span>
                                                    <span>Optimal</span>
                                                </div>
                                            </div>
                                            <div className="w-24 p-3 bg-white/[0.03] border border-white/10 backdrop-blur-md relative group hover:bg-[#f5a623]/5 transition-colors text-center flex flex-col justify-center">
                                                <div className="absolute top-0 right-0 p-2 text-[6px] font-black text-white/10 uppercase tracking-widest">COOLDOWN</div>
                                                <h4 className="text-[8px] font-black text-[#f5a623] uppercase tracking-[0.2em] mb-0 font-mono text-[9px]">Reset</h4>
                                                <div className="text-xl font-black italic text-white leading-none">{agent.cooldown}s</div>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-white/[0.03] border border-white/10 backdrop-blur-md relative group hover:bg-[#f5a623]/5 transition-colors">
                                            <div className="absolute top-0 right-0 p-2 text-[7px] font-black text-white/10 uppercase tracking-widest">SYSTEM_PASSIVE</div>
                                            <h4 className="text-[9px] font-black text-[#f5a623] uppercase tracking-[0.3em] mb-2 font-mono">Protocol: Stability</h4>
                                            <p className="text-lg font-black italic tracking-tight text-white/90 group-hover:text-white transition-colors leading-tight">{agent.passive}</p>
                                        </div>

                                        <div className="p-6 bg-black/70 border-l-4 backdrop-blur-md relative group hover:bg-[#f5a623]/5 transition-colors" style={{ borderLeftColor: agent.color }}>
                                            <div className="absolute top-0 right-0 p-2 text-[7px] font-black text-white/10 uppercase tracking-widest text-right font-mono">SIGNATURE_ABILITY<br />[ {agent.abilityKey} ]</div>
                                            <h4 className="text-[9px] font-black text-[#f5a623] uppercase tracking-[0.3em] mb-2 font-mono">Primary Tech: Engagement</h4>
                                            <p className="text-2xl font-black italic tracking-tight text-white uppercase group-hover:text-[#f5a623] transition-all leading-none">{agent.active}</p>

                                            <div className="mt-6 flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse" />
                                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.1em] italic">Functional</span>
                                                </div>
                                                <Link
                                                    href={`/lore?agent=${id}`}
                                                    className="px-4 py-1.5 bg-[#f5a623]/10 border border-[#f5a623]/20 text-[9px] font-black uppercase tracking-[0.2em] text-[#f5a623] hover:bg-[#f5a623] hover:text-black transition-all text-center group/btn"
                                                >
                                                    Access History
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Metadata */}
                            <div className="absolute top-24 right-12 text-[9px] font-mono text-white/10 text-right pointer-events-none hidden lg:block uppercase tracking-widest leading-loose">
                                <div className="text-[#f5a623]/40 mb-2">OPERATIVE_ID: 0{index + 1}</div>
                                <div>UPLINK_STATUS: STABLE</div>
                                <div>NEURAL_LINK: ACTIVE</div>
                                <div>X_COORDS: {index * 100}W</div>
                            </div>
                        </section>
                    );
                })}
            </div>

            {/* Pagination / Tactical UI */}
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 z-[100] bg-black/40 backdrop-blur-lg border border-white/5 py-3 px-8 rounded-full">
                <button
                    onClick={() => scrollToAgent(Math.max(0, currentIndex - 1))}
                    className="group"
                    title="Previous Operative"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-all ${currentIndex > 0 ? 'text-white/60 group-hover:text-[#f5a623] group-hover:-translate-x-1' : 'text-white/10 mb-[-2px]'}`}>
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                </button>

                <div className="flex items-center gap-4">
                    {agentOrder.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => scrollToAgent(i)}
                            className={`transition-all duration-300 ${i === currentIndex ? 'w-10 h-1 bg-[#f5a623]' : 'w-2 h-1 bg-white/10 hover:bg-white/40'}`}
                        />
                    ))}
                </div>

                <button
                    onClick={() => scrollToAgent(Math.min(agentOrder.length - 1, currentIndex + 1))}
                    className="group"
                    title="Next Operative"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-all ${currentIndex < agentOrder.length - 1 ? 'text-white/60 group-hover:text-[#f5a623] group-hover:translate-x-1' : 'text-white/10 mb-[-2px]'}`}>
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </button>
            </div>

            <style jsx global>{`
                .scrollbar-none::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-none {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </main>
    );
}
