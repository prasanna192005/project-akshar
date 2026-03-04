"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { AGENTS, Agent } from "@/lib/agents";
import { useTyping } from "@/hooks/useTyping";
import TypingInput from "@/components/TypingInput";
import AbilityBar from "@/components/AbilityBar";
import EffectOverlay from "@/components/EffectOverlay";
import { PlayerEffects } from "@/types";
import { calculateChargeIncrement } from "@/lib/gameEngine";

const TEST_PROMPT = "The quick brown fox jumps over the lazy dog. Programming is the art of algorithm design and the craft of debugging errant code. Mastery of the keyboard is the first step towards digital dominance.";

export default function TestingRange() {
    const [selectedAgentId, setSelectedAgentId] = useState<string>("PYRA");
    const [effects, setEffects] = useState<PlayerEffects>({
        flashed: false,
        blurred: false,
        inputLocked: false,
        scrambledWords: [],
        frozen: false,
        progressHidden: false,
        paranoia: false,
        empress: false
    });

    // Mock Charge state for testing
    const [charge, setCharge] = useState(0);
    const [onCooldown, setOnCooldown] = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);
    const [effectRemaining, setEffectRemaining] = useState(0);

    const agent = AGENTS[selectedAgentId as keyof typeof AGENTS];

    const {
        currentWordIndex,
        currentInput,
        handleInput,
        wpm,
        accuracy,
        isComplete,
        words,
        reset,
        skipWords,
        lastInputAt,
        isError
    } = useTyping(TEST_PROMPT, true, null, effects.inputLocked, effects.empress);

    // Charge logic mock
    useEffect(() => {
        if (onCooldown) {
            const timer = setInterval(() => {
                setCooldownRemaining(prev => {
                    if (prev <= 1) {
                        setOnCooldown(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }

        const chargeTimer = setInterval(() => {
            if (charge < 1 && !onCooldown) {
                // Restrictions:
                // 1. Only charge if player has typed in the last 2 seconds
                // 2. ONLY charge if there is NO error in their current input
                if (Date.now() - lastInputAt > 2000) return;
                if (isError) return;

                // Sync with production 8s base fill logic
                // Delta time is 0.2s for 200ms updates
                const increment = calculateChargeIncrement(
                    wpm,
                    accuracy,
                    agent.chargeRateModifier,
                    0.2
                );
                setCharge(prev => Math.min(1, prev + increment));
            }
        }, 200);

        return () => clearInterval(chargeTimer);
    }, [wpm, accuracy, charge, onCooldown, agent, lastInputAt, isError]);

    const activateAbility = useCallback(() => {
        if (charge < 1 || onCooldown) return;

        // In test mode, we apply the effect to OURSELVES to see what it looks like
        // (unless it's a self-buff, which already hits self)
        const effectUpdate: Partial<PlayerEffects> = {};

        switch (agent.id) {
            case 'PYRA': effectUpdate.blurred = true; break;
            case 'BREACH': effectUpdate.flashed = true; break;
            case 'KILLJOY': effectUpdate.inputLocked = true; break;
            case 'OMEN': effectUpdate.paranoia = true; break;
            case 'VIPER': effectUpdate.scrambledWords = ['SCRAMBLED']; break;
            case 'ZEPHYR': skipWords(5); break;
            case 'REYNA': effectUpdate.empress = true; break;
        }

        setEffects(prev => ({ ...prev, ...effectUpdate }));
        setCharge(0);
        setOnCooldown(true);
        setCooldownRemaining(agent.cooldown);

        // Sync duration with production values from agent data
        const durationSeconds = agent.duration;
        setEffectRemaining(durationSeconds);

        // Precise state clearance using setTimeout
        const clearTimer = setTimeout(() => {
            setEffects({ flashed: false, blurred: false, inputLocked: false, scrambledWords: [], frozen: false, progressHidden: false, paranoia: false, empress: false });
            setEffectRemaining(0);
        }, durationSeconds * 1000);

        // UI countdown using higher precision interval
        const effectTimer = setInterval(() => {
            setEffectRemaining(prev => {
                const next = Math.max(0, prev - 0.1);
                if (next <= 0) {
                    clearInterval(effectTimer);
                    return 0;
                }
                return next;
            });
        }, 100);

        return () => {
            clearTimeout(clearTimer);
            clearInterval(effectTimer);
        };
    }, [charge, onCooldown, agent, wpm, skipWords]);

    // Handle Tab key for abilities
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                activateAbility();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activateAbility]);

    return (
        <main className="min-h-screen bg-[#0F1923] text-white p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <Link href="/" className="text-[10px] font-black uppercase tracking-[.3em] text-white/40 hover:text-[#FF4655] transition-colors mb-4 block">
                            ← Exit Range
                        </Link>
                        <h1 className="text-5xl font-black italic tracking-tighter">
                            TESTING <span className="text-[#FF4655]">RANGE</span>
                        </h1>
                        <p className="text-white/40 uppercase text-[10px] font-bold tracking-widest mt-2">
                            Operator Authorization: Active // Sandbox Environment
                        </p>
                    </div>

                    <div className="flex bg-white/5 border border-white/10 p-4 rounded gap-8">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-white/20 block mb-1">Current Speed</span>
                            <span className="text-2xl font-mono font-black">{wpm} WPM</span>
                        </div>
                        <div className="w-px bg-white/10" />
                        <div>
                            <span className="text-[10px] uppercase font-bold text-white/20 block mb-1">Precision</span>
                            <span className="text-2xl font-mono font-black">{accuracy}%</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Agent Selector */}
                    <div className="lg:col-span-1 space-y-4">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Select Operator</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                            {Object.values(AGENTS).map((a) => (
                                <button
                                    key={a.id}
                                    onClick={() => setSelectedAgentId(a.id)}
                                    className={`p-3 text-left border transition-all relative overflow-hidden group ${selectedAgentId === a.id ? 'bg-[#FF4655] border-[#FF4655]' : 'bg-white/5 border-white/10 hover:border-white/30'}`}
                                >
                                    <span className={`text-xs font-black uppercase tracking-widest relative z-10 ${selectedAgentId === a.id ? 'text-black' : 'text-white/60'}`}>
                                        {a.name}
                                    </span>
                                    {selectedAgentId === a.id && (
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Firing Line */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Agent Summary Card */}
                        <div className="bg-white/5 border border-white/10 p-6 rounded-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 text-[40px] font-black text-white/[0.03] pointer-events-none select-none">
                                {agent.id}
                            </div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-2 h-8" style={{ backgroundColor: agent.color }} />
                                <div>
                                    <h3 className="text-2xl font-black italic tracking-tighter uppercase">{agent.name}</h3>
                                    <p className="text-[9px] font-bold text-[#FF4655] tracking-widest uppercase">Specialist Dossier</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <span className="text-[9px] uppercase font-black tracking-widest text-white/30 block mb-2">Passive Data</span>
                                    <p className="text-xs font-bold leading-relaxed">{agent.passive}</p>
                                </div>
                                <div>
                                    <span className="text-[9px] uppercase font-black tracking-widest text-white/30 block mb-2">Ultimate Data</span>
                                    <p className="text-xs font-bold leading-relaxed">{agent.active}</p>
                                </div>
                            </div>
                        </div>

                        {/* Sandbox Typing 영역 */}
                        <div className="relative">
                            <div className="absolute -top-6 left-0 text-[9px] font-black uppercase tracking-widest flex gap-4">
                                <span className={effects.inputLocked ? "text-[#FF4655]" : "text-white/40"}>
                                    {effects.inputLocked ? ">> CRITICAL ERROR: INPUT_LOCKED" : ">> STATUS: OPERATIONAL"}
                                </span>
                                {effectRemaining > 0 && (
                                    <span className="text-[#C84FA8] animate-pulse">
                                        {">> "} ACTIVE_EFFECT: {effectRemaining.toFixed(1)}s REMAINING
                                    </span>
                                )}
                            </div>
                            <TypingInput
                                words={words}
                                currentWordIndex={currentWordIndex}
                                currentInput={currentInput}
                                handleInput={handleInput}
                                accentColor={agent.color}
                                isActive={true}
                                isBlurred={effects.blurred}
                                isScrambled={(effects.scrambledWords?.length ?? 0) > 0}
                                isParanoid={effects.paranoia}
                                agentId={agent?.id}
                            />
                        </div>

                        {/* Ability Controller */}
                        <div className="bg-white/5 border border-white/10 p-8 rounded-sm">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="flex-1 w-full">
                                    <AbilityBar
                                        agent={agent}
                                        charge={charge}
                                        onCooldown={onCooldown}
                                        cooldownRemaining={cooldownRemaining}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCharge(1)}
                                        className="px-4 py-3 bg-white/10 hover:bg-white/20 text-[9px] font-black uppercase tracking-widest transition-all rounded shadow-inner"
                                    >
                                        Force Charge
                                    </button>
                                    <button
                                        onClick={() => {
                                            reset();
                                            setEffects({ flashed: false, blurred: false, inputLocked: false, scrambledWords: [], frozen: false, progressHidden: false, paranoia: false, empress: false });
                                            setCharge(0);
                                            setOnCooldown(false);
                                            setCooldownRemaining(0);
                                        }}
                                        className="px-4 py-3 bg-white/10 hover:bg-[#FF4655] hover:text-black text-white text-[9px] font-black uppercase tracking-widest transition-all rounded border border-white/10"
                                    >
                                        Full Reset
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/5">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/20 block mb-4">Manual Visual Test (Test these effects on yourself)</span>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => setEffects(p => ({ ...p, flashed: true }))} className="px-3 py-2 bg-white/5 hover:bg-white/10 text-[8px] font-black uppercase tracking-widest rounded transition-all">Test Flash</button>
                                <button onClick={() => setEffects(p => ({ ...p, blurred: true }))} className="px-3 py-2 bg-white/5 hover:bg-white/10 text-[8px] font-black uppercase tracking-widest rounded transition-all">Test Blur</button>
                                <button onClick={() => setEffects(p => ({ ...p, inputLocked: true }))} className="px-3 py-2 bg-white/5 hover:bg-white/10 text-[8px] font-black uppercase tracking-widest rounded transition-all">Test Lock</button>
                                <button onClick={() => setEffects(p => ({ ...p, scrambledWords: ['SCRAMBLED'] }))} className="px-3 py-2 bg-white/5 hover:bg-white/10 text-[8px] font-black uppercase tracking-widest rounded transition-all">Test Scramble</button>
                                <button onClick={() => setEffects(p => ({ ...p, frozen: true }))} className="px-3 py-2 bg-white/5 hover:bg-white/10 text-[8px] font-black uppercase tracking-widest rounded transition-all">Test Freeze</button>
                                <button onClick={() => setEffects(p => ({ ...p, paranoia: true }))} className="px-3 py-2 bg-white/5 hover:bg-white/10 text-[8px] font-black uppercase tracking-widest rounded transition-all">Test Paranoia</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Effect Overlays */}
            <EffectOverlay effects={effects} />

            {/* Background Decorations */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-[0.03]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[300px] font-black tracking-tighter italic">SANDBOX</div>
            </div>
        </main>
    );
}
