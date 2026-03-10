"use client";

import Link from "next/link";
import BunkerBackground from "@/components/BunkerBackground";
import SkeletalButton from "@/components/SkeletalButton";

export default function GuidePage() {
    return (
        <main className="min-h-screen bg-[#0d0b09] text-white p-8 md:p-16 relative overflow-hidden">
            <BunkerBackground />
            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <header className="mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
                    <Link href="/" className="text-[10px] font-black uppercase tracking-[0.4em] text-[#f5a623] mb-4 inline-block hover:translate-x-2 transition-transform">
                        ← RETURN_TO_BASE
                    </Link>
                    <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase leading-tight relative">
                        AKSHAR_OPERATIVE_MANUAL
                        <div className="absolute -top-4 -right-8 text-[8px] font-mono text-[#f5a623] opacity-50 animate-pulse">
                            [ CONFIDENTIAL // LEVEL 4 CLEARANCE ]
                        </div>
                    </h1>
                    <p className="text-white/40 font-mono text-sm mt-4">
                        AKSHAR // TACTICAL_TYPING_SURVIVAL_PROTOCOL
                    </p>
                </header>

                <div className="space-y-24 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">

                    {/* Core Philosophy */}
                    <section className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#f5a623]/5 blur-3xl rounded-full -z-10" />
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-1.5 h-8 bg-[#f5a623]" />
                            <h2 className="text-3xl font-black tracking-tighter uppercase italic">The Core Loop</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <h3 className="text-[#f5a623] font-black uppercase tracking-widest text-xs">Typing is Tactical Execution</h3>
                                <p className="text-white/70 leading-relaxed italic">
                                    In AKSHAR, your keyboard is your interface to the grid. Accuracy is your signal stability. Words per Minute (WPM) is your uplink bandwidth.
                                </p>
                                <div className="pt-4 flex gap-4">
                                    <div className="h-px flex-1 bg-gradient-to-r from-[#f5a623] to-transparent opacity-30" />
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-6 rounded-sm relative group overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#f5a623]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <ul className="space-y-4 text-sm relative z-10">
                                    <li className="flex items-start gap-3">
                                        <span className="text-[#f5a623] font-black">01</span>
                                        <span><b className="text-white">Errors = Signal Noise:</b> Typos cause signal interference. Backspace to clear the noise and resume execution.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-[#f5a623] font-black">02</span>
                                        <span><b className="text-white">Precision = Efficiency:</b> Maintaining 100% accuracy maximizes ability resonance. Any typo stalls charging for 2 seconds.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* HUD Interface Guide */}
                    <section>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-1.5 h-8 bg-[#f5a623]" />
                            <h2 className="text-3xl font-black tracking-tighter uppercase italic">HUD Interface</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[
                                { title: "Resonance Core", desc: "Bottom-center bar. Shows current ability charge % and cooldown state." },
                                { title: "Uplink Metrics", desc: "Top-left readout. Real-time WPM, Accuracy, and Grid Progress." },
                                { title: "Network Status", desc: "The progress bars behind your text track your position relative to other operatives." }
                            ].map((item, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-sm hover:border-[#f5a623]/40 transition-colors">
                                    <div className="w-8 h-1 bg-[#f5a623]/20 mb-3" />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#f5a623] mb-2">{item.title}</h4>
                                    <p className="text-[11px] text-white/50 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Ability System */}
                    <section>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-1.5 h-8 bg-[#f5a623]" />
                            <h2 className="text-3xl font-black tracking-tighter uppercase italic">Operative Roster</h2>
                        </div>
                        <div className="space-y-12">
                            <p className="text-white/70 leading-relaxed italic">
                                Each operative possesses a <b className="text-white underline">Passive Protocol</b> and a signature <b className="text-white underline">Active Ability</b>. Execute your active ability with <kbd className="bg-white/10 px-2 py-1 rounded text-[#f5a623] font-black border border-white/10">TAB</kbd> once resonance reaches 100%.
                            </p>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 text-[#f5a623] font-black uppercase tracking-widest text-[10px]">
                                            <th className="py-4 px-2">Operative</th>
                                            <th className="py-4 px-2">Passive Protocol</th>
                                            <th className="py-4 px-2">Active Ability (TAB)</th>
                                            <th className="py-4 px-2 text-right text-white/40">Loadout Mod</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 font-medium">
                                        {[
                                            { name: "VAYU", passive: "Speed Multiply on 10+ streak", active: "Slipstream (Next 5 words)", mod: "1.4x" },
                                            { name: "BIJLI", passive: "Faster charge on every use", active: "Fault Line (Blind opponents)", mod: "1.5x" },
                                            { name: "CHHAYA", passive: "Stealth Progress Bar", active: "Absence (Hides words)", mod: "1.0x" },
                                            { name: "VISHA", passive: "Toxic tint on near rivals", active: "Compound (Scramble words)", mod: "1.0x" },
                                            { name: "YANTRA", passive: "Type-triggered Traps", active: "Last Tuesday (Lock input)", mod: "0.7x" },
                                            { name: "KALI", passive: "Soul Harvest (Time Bonus)", active: "Devour (Typos reverse progress)", mod: "1.2x" },
                                            { name: "SUTRA", passive: "Mistake Auto-Correct", active: "Foretold (Effect Immunity)", mod: "0.8x" },
                                            { name: "AGNI", passive: "30% reduced typo penalty", active: "Rewrite (Blur screen)", mod: "1.0x" },
                                        ].sort((a, b) => b.mod.localeCompare(a.mod)).map((agent, i) => (
                                            <tr key={i} className="hover:bg-white/5 transition-colors group italic uppercase font-black">
                                                <td className="py-4 px-2 text-[#f5a623] group-hover:translate-x-1 transition-transform">{agent.name}</td>
                                                <td className="py-4 px-2 text-white/50 text-[11px]">{agent.passive}</td>
                                                <td className="py-4 px-2 text-white/90">{agent.active}</td>
                                                <td className="py-4 px-2 text-right font-mono text-white/30">{agent.mod}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {/* The Math */}
                    <section className="bg-[#f5a623]/5 border-y border-[#f5a623]/20 py-12 -mx-8 px-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-1.5 h-8 bg-[#f5a623]" />
                            <h2 className="text-3xl font-black tracking-tighter uppercase italic">System Logic</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <div className="col-span-1 md:col-span-2 space-y-8">
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#f5a623] mb-4 underline">Resonance_Charge_Formula</h3>
                                    <div className="bg-black/40 p-6 rounded-sm font-mono text-sm leading-relaxed border border-white/5 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 text-[10px] p-2 bg-white/5 uppercase opacity-30">V.04_ALGO</div>
                                        <code className="text-[#f5a623]">
                                            Charge_Inc = (WPM / 60) * (Acc / 100)^2 * Mod / 5
                                        </code>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-white/20 uppercase font-black">Bandwidth Weight</span>
                                            <div className="h-1 bg-white/10 w-full rounded-full overflow-hidden">
                                                <div className="bg-white/40 h-full w-[40%]" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-[#f5a623]/60 uppercase font-black">Integrity Weight</span>
                                            <div className="h-1 bg-white/10 w-full rounded-full overflow-hidden">
                                                <div className="bg-[#f5a623] h-full w-[100%]" />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-white/30 mt-4 font-mono italic">
                                        *Integrity is squared. High signal quality (Accuracy) is significantly more important than raw speed for ability generation. Errors cause a 2-second lockout.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="text-xs font-black uppercase mb-2">Targeting Protocols</h4>
                                        <p className="text-xs text-white/50 leading-relaxed uppercase italic font-black">
                                            <b className="text-white">LEADER:</b> Focus disruption on highest progress node.<br />
                                            <b className="text-white">RANDOM:</b> Target arbitrary rival node.<br />
                                            <b className="text-white">GLOBAL:</b> Broadcast disruption to entire lobby.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black uppercase mb-2">Network Logs</h4>
                                        <ul className="text-[9px] font-mono text-white/30 space-y-1">
                                            <li>CHARGE_TIC_RATE: 200ms</li>
                                            <li>SIGNAL_TIMEOUT: 2000ms</li>
                                            <li>NOISE_GATING: ENABLED</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center items-center text-center p-8 border border-white/10 bg-white/5 rounded-sm">
                                <div className="text-5xl font-black text-[#f5a623] mb-2">8s</div>
                                <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Average Uplink<br />Generation Time</div>
                            </div>
                        </div>
                    </section>

                    {/* Advanced Tactical Protocols */}
                    <section>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-1.5 h-8 bg-[#f5a623]" />
                            <h2 className="text-3xl font-black tracking-tighter uppercase italic">Tactical Doctrines</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-sm">
                                    <h4 className="text-white font-black uppercase text-sm mb-2 italic">01 // Noise Cancellation</h4>
                                    <p className="text-xs text-white/50 leading-relaxed italic">
                                        Clearing system noise (typos) immediately is critical. Stalling on an error halts resonance generation, giving rivals an advantage in the ability economy.
                                    </p>
                                </div>
                                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-sm">
                                    <h4 className="text-white font-black uppercase text-sm mb-2 italic">02 // Pattern Recognition</h4>
                                    <p className="text-xs text-white/50 leading-relaxed italic">
                                        Complex code clusters (long words) act as signal resistance. Modulate your speed during these sequences to maintain 100% integrity and protect your charge multiplier.
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-sm">
                                    <h4 className="text-white font-black uppercase text-sm mb-2 italic">03 // Strategic Disruption</h4>
                                    <p className="text-xs text-white/50 leading-relaxed italic">
                                        Timing is everything. Deploy abilities when rivals encounter high-resistance clusters to maximize the psychological and mechanical impact of your disruption.
                                    </p>
                                </div>
                                <div className="p-6 border border-[#f5a623]/20 bg-[#f5a623]/5 rounded-sm flex items-center gap-4">
                                    <div className="text-3xl font-black text-[#f5a623]">TIP</div>
                                    <p className="text-[11px] font-bold text-white/70 italic uppercase">
                                        "The fastest operative doesn't win. The one who breaks the opposition's rhythm wins."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Footer / Call to Action */}
                    <footer className="text-center pt-20 pb-32">
                        <div className="p-12 border border-white/5 bg-white/[0.02] rounded-sm backdrop-blur-sm relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-[#f5a623]/20" />
                            <h2 className="text-3xl font-black italic uppercase mb-8 relative z-10">Combat Ready?</h2>
                            <div className="flex flex-wrap justify-center gap-6 relative z-10">
                                <Link href="/test">
                                    <SkeletalButton className="px-16 h-16">
                                        ENTER_TRAINING_GROUNDS
                                    </SkeletalButton>
                                </Link>
                                <Link href="/">
                                    <SkeletalButton variant="secondary" className="px-16 h-16">
                                        RETURN_TO_BASE
                                    </SkeletalButton>
                                </Link>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
            {/* Background Decorations */}
            <div className="fixed top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#f5a623]/[0.02] to-transparent pointer-events-none -z-10" />
            <div className="fixed bottom-0 left-0 p-8 opacity-5 font-mono text-[8px] uppercase tracking-[1em] vertical-rl">AKSHAR_SYSTEM_v1.0.4 // Jaisalmer_Node</div>
        </main>
    );
}
