"use client";

import Link from "next/link";

export default function GuidePage() {
    return (
        <main className="min-h-screen bg-[#0F1923] text-white p-8 md:p-16">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
                    <Link href="/" className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF4655] mb-4 inline-block hover:translate-x-2 transition-transform">
                        ← RETURN_TO_BASE
                    </Link>
                    <h1 className="text-7xl font-black italic tracking-tighter uppercase leading-tight relative">
                        PROTOCOL_GUIDE
                        <div className="absolute -top-4 -right-8 text-[8px] font-mono text-[#FF4655] opacity-50 animate-pulse">
                            [ CONFIDENTIAL // EYES ONLY ]
                        </div>
                    </h1>
                    <p className="text-white/40 font-mono text-sm mt-4">
                        TYPHÖÖN // TACTICAL_TYPING_SURVIVAL_MANUAL
                    </p>
                </header>

                <div className="space-y-24 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">

                    {/* Core Philosophy */}
                    <section className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF4655]/5 blur-3xl rounded-full -z-10" />
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-1.5 h-8 bg-[#FF4655]" />
                            <h2 className="text-3xl font-black tracking-tighter uppercase italic">The Core Loop</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <h3 className="text-[#FF4655] font-black uppercase tracking-widest text-xs">Typing is Shooting</h3>
                                <p className="text-white/70 leading-relaxed italic">
                                    In TYPHÖÖN, your keyboard is your weapon. Accuracy isn't just a stat—it's your recoil control. Words per Minute (WPM) isn't just speed—it's your rate of fire.
                                </p>
                                <div className="pt-4 flex gap-4">
                                    <div className="h-px flex-1 bg-gradient-to-r from-[#FF4655] to-transparent opacity-30" />
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-6 rounded-sm relative group overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#FF4655]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <ul className="space-y-4 text-sm relative z-10">
                                    <li className="flex items-start gap-3">
                                        <span className="text-[#FF4655] font-black">01</span>
                                        <span><b className="text-white">Mistakes = Jams:</b> Key jams prevent further input. Correct the typo to resume fire.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-[#FF4655] font-black">02</span>
                                        <span><b className="text-white">Accuracy = Lethality:</b> A single typo halts all ability charging for 2 seconds.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* NEW: HUD Interface Guide */}
                    <section>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-1.5 h-8 bg-[#FF4655]" />
                            <h2 className="text-3xl font-black tracking-tighter uppercase italic">HUD Interface</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[
                                { title: "Ability Core", desc: "Bottom-center bar. Shows current charge % and cooldown timers.", icon: "PWR" },
                                { title: "Dossier Readout", desc: "Top-left metrics. Real-time WPM, Accuracy, and Progress.", icon: "LOG" },
                                { title: "Rival Tracking", desc: "The progress bars behind your text show your distance to enemies.", icon: "DST" }
                            ].map((item, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-sm hover:border-[#FF4655]/40 transition-colors">
                                    <div className="text-2xl mb-3">{item.icon}</div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#FF4655] mb-2">{item.title}</h4>
                                    <p className="text-[11px] text-white/50 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Ability System */}
                    <section>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-1.5 h-8 bg-[#FF4655]" />
                            <h2 className="text-3xl font-black tracking-tighter uppercase italic">Agent Roster</h2>
                        </div>
                        <div className="space-y-12">
                            <p className="text-white/70 leading-relaxed italic">
                                Each agent has a unique <b className="text-white underline">Passive</b> (always active) and an <b className="text-white underline">Active</b> ability. Press <kbd className="bg-white/10 px-2 py-1 rounded text-[#FF4655] font-black border border-white/10">TAB</kbd> once fully charged.
                            </p>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 text-[#FF4655] font-black uppercase tracking-widest text-[10px]">
                                            <th className="py-4 px-2">Agent</th>
                                            <th className="py-4 px-2">Passive Ability</th>
                                            <th className="py-4 px-2">Active Ability (TAB)</th>
                                            <th className="py-4 px-2 text-right text-white/40">Modifier</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 font-medium">
                                        {[
                                            { name: "ZEPHYR", passive: "Speed Multiply on 10+ streak", active: "Tailwind (Next 5 words)", mod: "1.4x" },
                                            { name: "BREACH", passive: "Faster charge on every use", active: "Flash (Blind opponents)", mod: "1.5x" },
                                            { name: "OMEN", passive: "Stealth Progress Bar", active: "Paranoia (Hides words)", mod: "1.0x" },
                                            { name: "VIPER", passive: "Toxic tint on near rivals", active: "Poison (Scramble words)", mod: "1.0x" },
                                            { name: "KILLJOY", passive: "Type-triggered Traps", active: "Lockdown (Lock input)", mod: "0.7x" },
                                            { name: "REYNA", passive: "Soul Harvest (Time Bonus)", active: "Empress (Typos reverse progress)", mod: "1.2x" },
                                            { name: "SAGE", passive: "Mistake Auto-Correct", active: "Barrier (Effect Immunity)", mod: "0.8x" },
                                            { name: "PYRA", passive: "30% reduced typo penalty", active: "Blaze (Blur screen)", mod: "1.0x" },
                                        ].sort((a, b) => b.mod.localeCompare(a.mod)).map((agent, i) => (
                                            <tr key={i} className="hover:bg-white/5 transition-colors group italic uppercase font-black">
                                                <td className="py-4 px-2 text-[#FF4655] group-hover:translate-x-1 transition-transform">{agent.name}</td>
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
                    <section className="bg-[#FF4655]/5 border-y border-[#FF4655]/20 py-12 -mx-8 px-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-1.5 h-8 bg-[#FF4655]" />
                            <h2 className="text-3xl font-black tracking-tighter uppercase italic">The Math</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <div className="col-span-1 md:col-span-2 space-y-8">
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#FF4655] mb-4 underline">Ability_Charge_Formula</h3>
                                    <div className="bg-black/40 p-6 rounded-sm font-mono text-sm leading-relaxed border border-white/5 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 text-[10px] p-2 bg-white/5 uppercase opacity-30">V.04_ALGO</div>
                                        <code className="text-[#FF4655]">
                                            Charge_Inc = (WPM / 60) * (Acc / 100)^2 * Mod / 5
                                        </code>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-white/20 uppercase font-black">Velocity Weight</span>
                                            <div className="h-1 bg-white/10 w-full rounded-full overflow-hidden">
                                                <div className="bg-white/40 h-full w-[40%]" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-[#FF4655]/60 uppercase font-black">Precision Weight</span>
                                            <div className="h-1 bg-white/10 w-full rounded-full overflow-hidden">
                                                <div className="bg-[#FF4655] h-full w-[100%]" />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-white/30 mt-4 font-mono italic">
                                        *Precision is squared. A 50% accuracy player charges 4x slower than a 100% accuracy player at the same WPM. Error-gating adds a 2s penalty to any typo before charging resumes.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="text-xs font-black uppercase mb-2">Targeting Modes</h4>
                                        <p className="text-xs text-white/50 leading-relaxed uppercase italic font-black">
                                            <b className="text-white">LEADER:</b> Targets highest % progress.<br />
                                            <b className="text-white">RANDOM:</b> Targets a random rival.<br />
                                            <b className="text-white">GLOBAL:</b> Targets everyone in lobby.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black uppercase mb-2">Technical Logs</h4>
                                        <ul className="text-[9px] font-mono text-white/30 space-y-1">
                                            <li>CHARGE_TIC_RATE: 200ms</li>
                                            <li>IDLE_TIMEOUT: 2000ms</li>
                                            <li>ERR_GATING: ENABLED</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center items-center text-center p-8 border border-white/10 bg-white/5 rounded-sm">
                                <div className="text-5xl font-black text-[#FF4655] mb-2">8s</div>
                                <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Base Average<br />Charge Time</div>
                            </div>
                        </div>
                    </section>

                    {/* NEW: Advanced Tactical Protocols */}
                    <section>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-1.5 h-8 bg-[#FF4655]" />
                            <h2 className="text-3xl font-black tracking-tighter uppercase italic">Tactical Protocols</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-sm">
                                    <h4 className="text-white font-black uppercase text-sm mb-2 italic">01 // Mistake Mitigation</h4>
                                    <p className="text-xs text-white/50 leading-relaxed italic">
                                        Fixing a typo immediately is faster than ignoring it. Because charging halts during errors, being "stuck" on a typo is the fastest way to lose the ability economy battle.
                                    </p>
                                </div>
                                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-sm">
                                    <h4 className="text-white font-black uppercase text-sm mb-2 italic">02 // Burst Performance</h4>
                                    <p className="text-xs text-white/50 leading-relaxed italic">
                                        High-difficulty words (long, symbols) act as "Recoil." Slow down during these sections to protect your accuracy modifier. A 100% slow burst is better than a fast, messy spray.
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-sm">
                                    <h4 className="text-white font-black uppercase text-sm mb-2 italic">03 // Tactical Economy</h4>
                                    <p className="text-xs text-white/50 leading-relaxed italic">
                                        Don't trigger abilities immediately. Wait until a rival is in a "Long Word Zone" (check their upcoming text) to maximize the disruption of effects like Scramble or Blur.
                                    </p>
                                </div>
                                <div className="p-6 border border-[#FF4655]/20 bg-[#FF4655]/5 rounded-sm flex items-center gap-4">
                                    <div className="text-3xl font-black text-[#FF4655]">TIP</div>
                                    <p className="text-[11px] font-bold text-white/70 italic uppercase">
                                        "The best typist doesn't win. The one who breaks the other's rhythm wins."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Footer / Call to Action */}
                    <footer className="text-center pt-16 pb-32">
                        <div className="p-12 border border-white/5 bg-white/[0.02]">
                            <h2 className="text-3xl font-black italic uppercase mb-6">Ready to Practice?</h2>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link href="/test" className="px-8 py-4 bg-[#FF4655] text-white font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                                    Enter Testing Range
                                </Link>
                                <Link href="/" className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                                    Back to Home
                                </Link>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>

            {/* Background Decorations */}
            <div className="fixed top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#FF4655]/[0.02] to-transparent pointer-events-none -z-10" />
            <div className="fixed bottom-0 left-0 p-8 opacity-5 font-mono text-[8px] uppercase tracking-[1em] vertical-rl">Tactical_Typing_System_v0.1.0</div>
        </main>
    );
}
