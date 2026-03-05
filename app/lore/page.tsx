"use client";

import { useState } from "react";
import Link from "next/link";
import { AGENTS, AgentType } from "@/lib/agents";
import { AGENT_LORE, WORLD_LORE, AGENT_FILES_INTRO } from "@/lib/lore";

export default function LorePage() {
    const [selectedView, setSelectedView] = useState<AgentType | 'WORLD' | 'AGENT_FILES'>('WORLD');
    const [activeSection, setActiveSection] = useState<string>("GENESIS");

    const worldSections = [
        { id: "GENESIS", label: "GENESIS", trigger: "PROLOGUE" },
        { id: "COLLAPSE", label: "COLLAPSE", trigger: "PART ONE" },
        { id: "FACILITY", label: "FACILITY", trigger: "PART TWO" },
        { id: "THE_EIGHT", label: "THE EIGHT", trigger: "PART THREE" },
        { id: "THE_GAME", label: "THE GAME", trigger: "PART FOUR" },
        { id: "EPILOGUE", label: "EPILOGUE", trigger: "EPILOGUE" },
    ];

    const isWorldView = selectedView === 'WORLD';
    const isAgentFilesIntro = selectedView === 'AGENT_FILES';
    const lore = isWorldView
        ? WORLD_LORE
        : isAgentFilesIntro
            ? { title: "AKSHAR — AGENT FILES", image: "/lore/world_hero.png", content: AGENT_FILES_INTRO }
            : AGENT_LORE[selectedView as AgentType];
    const agent = (!isWorldView && !isAgentFilesIntro) ? AGENTS[selectedView as AgentType] : null;

    // Helper to group content into sections
    const getVisibleContent = () => {
        if (!isWorldView) return lore.content;

        const sections: Record<string, string[]> = {};
        let currentSection = "GENESIS";

        lore.content.forEach(p => {
            const matchedSection = worldSections.find(s => p.startsWith(s.trigger));
            if (matchedSection) {
                currentSection = matchedSection.id;
            }
            if (!sections[currentSection]) sections[currentSection] = [];
            sections[currentSection].push(p);
        });

        return sections[activeSection] || [];
    };

    const visibleContent = getVisibleContent();

    return (
        <main className="min-h-screen bg-[#0F1923] text-white flex flex-col lg:flex-row relative overflow-hidden">
            {/* Background Decorative Element */}
            <div className="fixed top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none select-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] text-[40rem] font-black italic tracking-tighter leading-none uppercase">
                    {isWorldView ? 'AKSHAR' : agent?.name}
                </div>
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-80 h-screen overflow-y-auto border-r border-white/10 bg-[#0F1923]/80 backdrop-blur-xl z-10 p-6 flex flex-col">
                <div className="mb-12">
                    <Link href="/" className="inline-flex items-center gap-2 group mb-8">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6" /></svg>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Back to HQ</span>
                    </Link>
                    <h1 className="text-3xl font-black italic tracking-tighter mb-2">TACTICAL ARCHIVES</h1>
                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40">Protocol: Origin Stories</p>
                </div>

                <nav className="flex-1 space-y-2">
                    {/* World Lore Button */}
                    <button
                        onClick={() => setSelectedView('WORLD')}
                        className={`w-full group relative flex items-center gap-4 p-4 transition-all border-l-4 mb-8
                            ${isWorldView
                                ? 'bg-[#FF4655]/20 border-[#FF4655] translate-x-1'
                                : 'hover:bg-white/5 border-transparent hover:border-white/20'
                            }
                        `}
                    >
                        <div className="w-2 h-2 rounded-full bg-[#FF4655] shadow-[0_0_10px_#FF4655]" />
                        <div className="text-left">
                            <span className={`block text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${isWorldView ? 'text-[#FF4655]' : 'text-white/40'}`}>
                                MISSION BRIEFING
                            </span>
                            <span className={`block text-xl font-black italic tracking-tighter leading-none ${isWorldView ? 'text-white' : 'text-white/60'}`}>
                                THE COLLAPSE
                            </span>
                        </div>
                    </button>

                    {/* Agent Dossiers Header */}
                    <button
                        onClick={() => setSelectedView('AGENT_FILES')}
                        className={`w-full text-left mt-8 mb-4 pt-8 border-t border-white/10 transition-all group
                            ${isAgentFilesIntro ? 'translate-x-1' : ''}
                        `}
                    >
                        <h2 className={`text-xs font-black italic tracking-[0.2em] mb-4 transition-colors ${isAgentFilesIntro ? 'text-white' : 'text-[#FF4655] group-hover:text-white'}`}>
                            AKSHAR — AGENT FILES
                        </h2>
                        {/* {isAgentFilesIntro && (
                            <div className="space-y-4 px-2 mb-6 animate-in fade-in slide-in-from-left-2 transition-all">
                                <div className="text-[9px] font-bold text-white/60 leading-tight">
                                    <span className="block text-white">Classified. Level 4 Clearance Required.</span>
                                    <span className="block italic mt-1 text-white/40">"Know your operators. Know your network."</span>
                                    <span className="block text-right mt-1">— Dr. Aditi Bhosle, Sept 2038</span>
                                </div>
                                <div className="text-[10px] text-white/30 leading-relaxed italic border-l border-white/10 pl-3">
                                    These files were compiled by AKSHAR's intelligence division. Each represents a complete picture of an agent's life.
                                </div>
                            </div>
                        )}
                        {!isAgentFilesIntro && (
                            <div className="text-[8px] font-black uppercase tracking-widest text-white/20 px-2 group-hover:text-white/40 transition-colors">
                                Click to View Classified Brief
                            </div>
                        )} */}
                    </button>

                    {(['BREACH', 'SAGE', 'ZEPHYR', 'PYRA', 'KILLJOY', 'VIPER', 'OMEN', 'REYNA'] as AgentType[]).map((id) => (
                        <button
                            key={id}
                            onClick={() => setSelectedView(id)}
                            className={`w-full group relative flex items-center gap-4 p-4 transition-all border-l-4 
                                ${selectedView === id
                                    ? 'bg-white/10 border-[#FF4655] translate-x-1'
                                    : 'hover:bg-white/5 border-transparent hover:border-white/20'
                                }
                            `}
                        >
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: AGENTS[id].color }}
                            />
                            <div className="text-left">
                                <span className={`block text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${selectedView === id ? 'text-[#FF4655]' : 'text-white/40'}`}>
                                    {AGENT_LORE[id].title.split(' — ')[0]}
                                </span>
                                <span className={`block text-xl font-black italic tracking-tighter leading-none ${selectedView === id ? 'text-white' : 'text-white/60'}`}>
                                    {AGENTS[id].name}
                                </span>
                            </div>
                            {selectedView === id && (
                                <div className="absolute right-4 animate-in fade-in slide-in-from-right-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF4655" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                </div>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto hidden lg:block pt-8 border-t border-white/5">
                    <div className="text-[8px] uppercase font-bold tracking-[0.3em] text-white/20 leading-loose">
                        // SECURE UPLINK ESTABLISHED<br />
                        // ARCHIVE DATA STABLE<br />
                        // PENDING CLEARANCE
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <section className="flex-1 h-screen overflow-y-auto z-10 relative story-scroll-container">
                {/* Hero Header */}
                <div className="relative h-[60vh] flex items-end p-12 overflow-hidden border-b border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F1923] via-[#0F1923]/40 to-transparent z-10" />

                    {/* Hero Image */}
                    <div className="absolute inset-0 z-0 bg-neutral-900 group">
                        <img
                            src={lore.image}
                            alt={isWorldView ? 'AKSHAR' : agent?.name}
                            className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-[10s] ease-linear"
                        />
                        <div className="absolute inset-0 bg-[#FF4655]/10 mix-blend-overlay opacity-50" />
                        <div className="absolute inset-0 flex items-center justify-center text-[20vw] font-black italic text-white/[0.02] select-none uppercase tracking-tighter">
                            {isWorldView ? 'AKSHAR' : isAgentFilesIntro ? 'DOSSIER' : agent?.name}
                        </div>
                    </div>

                    <div className="relative z-20 max-w-4xl w-full">
                        <div className="flex items-center gap-4 mb-4 animate-in slide-in-from-left-4 duration-500">
                            <span className="px-3 py-1 bg-[#FF4655] text-white text-[10px] font-black uppercase tracking-widest">Archive ID: {isWorldView ? 'AKSHAR-00' : agent?.id}</span>
                            {!isWorldView && agent && (
                                <>
                                    <span className="px-3 py-1 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-left-4 duration-650">
                                        Age: {agent.age}
                                    </span>
                                    <span className="px-3 py-1 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-left-4 duration-700">
                                        Origin: {agent.region}
                                    </span>
                                </>
                            )}
                            {isWorldView && <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/60 italic">UNCLASSIFIED</span>}
                        </div>
                        {!isWorldView && agent && (
                            <div className="mb-2 animate-in slide-in-from-left-6 duration-600">
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#FF4655]">Operative Identified:</span>
                                <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                                    {agent.realName}
                                </h3>
                            </div>
                        )}
                        <h2 className="text-8xl font-black italic tracking-tighter leading-none mb-4 animate-in slide-in-from-left-8 duration-700">
                            {isWorldView ? 'THE COLLAPSE' : isAgentFilesIntro ? 'AGENT FILES' : agent?.name.toUpperCase()}
                        </h2>
                        <div className="flex items-center gap-6">
                            <div className="h-0.5 w-24" style={{ backgroundColor: isWorldView ? '#FF4655' : agent?.color }} />
                            <span className="text-lg font-bold tracking-[.3em] uppercase opacity-60 text-white italic">{isWorldView ? 'REBUILDING THE WORLD FROM SCRATCH' : agent?.tagline}</span>
                        </div>
                    </div>
                </div>

                {/* World Lore Sub-Navigation */}
                {isWorldView && (
                    <div className="sticky top-0 z-30 bg-[#0F1923]/95 backdrop-blur-sm border-b border-white/10 flex gap-4 px-12 py-6 overflow-x-auto scrollbar-none">
                        {worldSections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`whitespace-nowrap px-6 py-2 text-[10px] font-black tracking-[0.3em] uppercase rounded-sm transition-all border ${activeSection === section.id
                                    ? 'bg-[#FF4655] border-[#FF4655] text-white shadow-[0_0_20px_rgba(255,70,85,0.4)]'
                                    : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'}`}
                            >
                                {section.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Story Content */}
                <div className="p-12 pb-32">
                    <div className="max-w-3xl space-y-12">
                        {visibleContent.map((paragraph: string, idx: number) => {
                            if (paragraph === "---") {
                                return (
                                    <hr key={idx} className="border-t border-white/10 my-12" />
                                );
                            }

                            if (paragraph.startsWith("# ")) {
                                return (
                                    <h1 key={idx} className="text-5xl font-black italic tracking-tighter text-white mb-8">
                                        {paragraph.replace("# ", "")}
                                    </h1>
                                );
                            }

                            if (paragraph.startsWith("## ")) {
                                return (
                                    <h2 key={idx} className="text-4xl font-black italic tracking-tighter text-[#FF4655] pt-8 mb-6 uppercase">
                                        {paragraph.replace("## ", "")}
                                    </h2>
                                );
                            }

                            if (paragraph.startsWith("### ")) {
                                return (
                                    <h3 key={idx} className="text-xl font-black italic tracking-tighter text-[#FF4655]/80 mb-4 uppercase">
                                        {paragraph.replace("### ", "").replace(/\*/g, "")}
                                    </h3>
                                );
                            }

                            if (paragraph.startsWith("> ")) {
                                return (
                                    <blockquote key={idx} className="border-l-4 border-white/20 pl-8 my-8 italic text-white/40 text-lg leading-relaxed">
                                        {paragraph.replace("> ", "")}
                                    </blockquote>
                                );
                            }

                            // Determine if paragraph is a world-lore header (Legacy support for old format)
                            const isLegacyHeader = paragraph.startsWith("PART") ||
                                paragraph.startsWith("PROLOGUE") ||
                                paragraph.startsWith("EPILOGUE") ||
                                paragraph.includes("THIS IS AKSHAR");

                            if (isLegacyHeader) {
                                return (
                                    <h3
                                        key={idx}
                                        className="text-4xl font-black italic tracking-tighter text-[#FF4655] pt-8 border-t border-white/5"
                                    >
                                        {paragraph}
                                    </h3>
                                );
                            }

                            // Check if it's an Operative detail line (starts with ** in data)
                            const isAgentProfile = paragraph.startsWith("**");

                            // Check if it's a representation line
                            const isRepresentation = paragraph.includes("What he represents:") || paragraph.includes("What she represents:") || paragraph.includes("What they represent:");

                            // Check if it's a Devanagari dialogue (rough check for Devanagari range)
                            const isDevanagari = /[\u0900-\u097F]/.test(paragraph);

                            // Clean text (remove markdown symbols if they leak)
                            const cleanParagraph = paragraph.replace(/\*\*/g, '').replace(/\*/g, '').replace(/^"|"$/g, '');

                            return (
                                <p
                                    key={idx}
                                    className={`text-2xl font-medium leading-relaxed transition-all duration-700 animate-in fade-in slide-in-from-bottom-4 
                                        ${isAgentProfile ? 'text-white font-black py-4 text-3xl' :
                                            isRepresentation ? 'text-white/40 text-lg uppercase tracking-widest' :
                                                isDevanagari ? 'text-white font-bold py-2 border-l-2 border-[#FF4655] pl-6' : 'text-white/70 italic'}`}
                                >
                                    {cleanParagraph}
                                </p>
                            );
                        })}

                        {!isWorldView && agent && (
                            <div className="pt-20 border-t border-white/10 grid grid-cols-2 gap-12">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 mb-6">Tactical Passive</h3>
                                    <div className="p-6 bg-white/5 border border-white/5 rounded-sm">
                                        <p className="text-lg font-black italic tracking-tight">{agent.passive}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 mb-6">Signature Ability</h3>
                                    <div className="p-6 bg-white/5 border border-white/5 rounded-sm" style={{ borderLeftColor: agent.color, borderLeftWidth: '4px' }}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs uppercase font-bold tracking-widest" style={{ color: agent.color }}>[ {agent.abilityKey} ]</span>
                                            <span className="text-[10px] opacity-40 uppercase font-black">Ready</span>
                                        </div>
                                        <p className="text-lg font-black italic tracking-tight uppercase">{agent.active}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-12 pt-12 border-t border-white/5 flex flex-col sm:flex-row items-center justify-end gap-6">
                            {isWorldView ? (
                                activeSection !== "EPILOGUE" ? (
                                    <button
                                        onClick={() => {
                                            const currentIndex = worldSections.findIndex(s => s.id === activeSection);
                                            const nextSection = worldSections[currentIndex + 1];
                                            if (nextSection) {
                                                setActiveSection(nextSection.id);
                                                document.querySelector('.story-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' });
                                            }
                                        }}
                                        className="group relative h-16 w-full sm:w-80 flex items-center justify-center overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-white/5 border border-white/20 skew-x-[-12deg] group-hover:bg-[#FF4655] group-hover:border-[#FF4655] transition-all" />
                                        <span className="relative z-10 text-white font-black uppercase tracking-[0.3em] flex items-center gap-3">
                                            Next Chapter
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="m9 18 6-6-6-6" /></svg>
                                        </span>
                                    </button>
                                ) : (
                                    <Link
                                        href="/lobby/create"
                                        className="group relative h-16 w-full sm:w-80 flex items-center justify-center overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-[#FF4655] skew-x-[-12deg] group-hover:bg-white transition-colors" />
                                        <span className="relative z-10 text-white group-hover:text-black font-black uppercase tracking-[0.3em]">
                                            Join the Resistance
                                        </span>
                                    </Link>
                                )
                            ) : (
                                <>
                                    {(() => {
                                        const agentOrder: AgentType[] = ['BREACH', 'SAGE', 'ZEPHYR', 'PYRA', 'KILLJOY', 'VIPER', 'OMEN', 'REYNA'];

                                        if (isAgentFilesIntro) {
                                            return (
                                                <button
                                                    onClick={() => {
                                                        setSelectedView('BREACH');
                                                        document.querySelector('.story-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }}
                                                    className="group relative h-16 w-full sm:w-80 flex items-center justify-center overflow-hidden"
                                                >
                                                    <div className="absolute inset-0 bg-[#FF4655] skew-x-[-12deg] group-hover:bg-white transition-colors" />
                                                    <span className="relative z-10 text-white group-hover:text-black font-black uppercase tracking-[0.3em] flex items-center gap-3">
                                                        Open First File: BIJLI
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="m9 18 6-6-6-6" /></svg>
                                                    </span>
                                                </button>
                                            );
                                        }

                                        const currentIndex = agentOrder.indexOf(selectedView as AgentType);
                                        const nextAgentId = agentOrder[currentIndex + 1];

                                        if (nextAgentId) {
                                            return (
                                                <button
                                                    onClick={() => {
                                                        setSelectedView(nextAgentId);
                                                        document.querySelector('.story-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }}
                                                    className="group relative h-16 w-full sm:w-80 flex items-center justify-center overflow-hidden"
                                                >
                                                    <div className="absolute inset-0 bg-white/5 border border-white/20 skew-x-[-12deg] group-hover:bg-[#FF4655] group-hover:border-[#FF4655] transition-all" />
                                                    <span className="relative z-10 text-white font-black uppercase tracking-[0.3em] flex items-center gap-3">
                                                        Next File: {AGENTS[nextAgentId].name}
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="m9 18 6-6-6-6" /></svg>
                                                    </span>
                                                </button>
                                            );
                                        }
                                        return null;
                                    })()}

                                    {!isAgentFilesIntro && (
                                        <Link
                                            href="/lobby/create"
                                            className="group relative h-16 w-full sm:w-80 flex items-center justify-center overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-[#FF4655] skew-x-[-12deg] group-hover:bg-white transition-colors" />
                                            <span className="relative z-10 text-white group-hover:text-black font-black uppercase tracking-[0.3em]">
                                                Join the Resistance
                                            </span>
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
