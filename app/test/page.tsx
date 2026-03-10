"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { AGENTS, Agent, AgentType } from "@/lib/agents";
import { useTyping } from "@/hooks/useTyping";
import TypingInput from "@/components/TypingInput";
import AbilityBar from "@/components/AbilityBar";
import EffectOverlay from "@/components/EffectOverlay";
import { PlayerEffects } from "@/types";
import { calculateChargeIncrement } from "@/lib/gameEngine";
import BunkerBackground from "@/components/BunkerBackground";
import SkeletalButton from "@/components/SkeletalButton";
import { useRouter, useSearchParams } from "next/navigation";
import { createSoloRoom } from "@/lib/roomUtils";
import { v4 as uuidv4 } from "uuid";

import { useAbility } from "@/hooks/useAbility";

const TEST_PROMPT = "The quick brown fox jumps over the lazy dog. Programming is the art of algorithm design and the craft of debugging errant code. Mastery of the keyboard is the first step towards digital dominance.";

function TestingRangeContent() {
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

    const router = useRouter();
    const searchParams = useSearchParams();
    const isTutorial = searchParams.get('tutorial') === 'true';
    const [tutorialStep, setTutorialStep] = useState(0);
    const [hasFiredAbility, setHasFiredAbility] = useState(false);

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
        isError,
        progress
    } = useTyping(TEST_PROMPT, true, null, effects.inputLocked, effects.empress);

    const {
        charge,
        setCharge,
        onCooldown,
        cooldownRemaining,
        activateAbility: triggerAbilityBase
    } = useAbility(
        selectedAgentId as AgentType,
        wpm,
        accuracy,
        "tutorial",
        "tutorial-player",
        [],
        lastInputAt,
        isError,
        progress || 0,
        undefined,
        skipWords
    );

    // Dynamic effect timer for UI feedback
    const [effectRemaining, setEffectRemaining] = useState(0);

    const activateAbility = useCallback(() => {
        if (charge < 1 || onCooldown) return;

        // In test mode, we apply the effect to OURSELVES to see what it looks like
        const effectUpdate: Partial<PlayerEffects> = {};

        switch (agent.id) {
            case 'PYRA': effectUpdate.blurred = true; break;
            case 'BREACH': effectUpdate.flashed = true; break;
            case 'KILLJOY': effectUpdate.inputLocked = true; break;
            case 'OMEN': effectUpdate.paranoia = true; break;
            case 'VIPER': effectUpdate.scrambledWords = ['SCRAMBLED']; break;
            case 'ZEPHYR': skipWords(5); break;
            case 'REYNA': effectUpdate.empress = true; break;
            case 'SAGE': effectUpdate.frozen = true; break;
        }

        setEffects(prev => ({ ...prev, ...effectUpdate }));
        setEffectRemaining(agent.duration);

        // Use the base hook's activation for cooldown sync and charge reset
        triggerAbilityBase();

        // Precise state clearance
        const durationSeconds = agent.duration;
        const clearTimer = setTimeout(() => {
            setEffects({
                flashed: false,
                blurred: false,
                inputLocked: false,
                scrambledWords: [],
                frozen: false,
                progressHidden: false,
                paranoia: false,
                empress: false
            });
            setEffectRemaining(0);
        }, durationSeconds * 1000);

        // UI countdown
        const effectTimer = setInterval(() => {
            setEffectRemaining(prev => Math.max(0, prev - 0.1));
        }, 100);

        return () => {
            clearTimeout(clearTimer);
            clearInterval(effectTimer);
        };
    }, [charge, onCooldown, agent, triggerAbilityBase, skipWords]);

    const handleDeployToSolo = async () => {
        let playerId = sessionStorage.getItem('typeagents_player_id');
        if (!playerId) {
            playerId = uuidv4();
            sessionStorage.setItem('typeagents_player_id', playerId);
        }
        const playerName = localStorage.getItem('typeagents_player_name') || "OPERATIVE";

        try {
            const rid = await createSoloRoom(playerId, playerName);
            router.push(`/lobby/${rid}`);
        } catch (err) {
            console.error("Solo deployment failed:", err);
        }
    };

    // Handle Tab key for abilities
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                activateAbility();
                if (isTutorial && tutorialStep === 2) {
                    setHasFiredAbility(true);
                    setTutorialStep(3);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activateAbility, isTutorial, tutorialStep]);

    // Auto-advance tutorial if charged
    useEffect(() => {
        if (isTutorial && tutorialStep === 1 && charge >= 1) {
            setTutorialStep(2);
        }
    }, [charge, isTutorial, tutorialStep]);

    return (
        <main className="min-h-screen bg-[#0d0b09] text-white p-8 relative overflow-hidden">
            <BunkerBackground />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <Link href="/" className="text-[10px] font-black uppercase tracking-[.3em] text-[#f5a623]/40 hover:text-[#f5a623] transition-colors mb-4 block">
                            ← EXIT_RANGE
                        </Link>
                        <h1 className="text-5xl font-black italic tracking-tighter">
                            TESTING <span className="text-[#f5a623]">RANGE_S1</span>
                        </h1>
                        <p className="text-[#f5a623]/40 uppercase text-[10px] font-bold tracking-widest mt-2 italic">
                            Authorization_Key: Active // Sandbox_Environment_v1.2
                        </p>
                    </div>

                    <div className="flex bg-white/5 border border-[#f5a623]/20 p-4 rounded gap-8 backdrop-blur-md">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-[#f5a623]/40 block mb-1">Signal Speed</span>
                            <span className="text-2xl font-mono font-black text-[#f5a623]">{wpm} WPM</span>
                        </div>
                        <div className="w-px bg-[#f5a623]/10" />
                        <div>
                            <span className="text-[10px] uppercase font-bold text-[#f5a623]/40 block mb-1">Precision</span>
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
                                    onClick={() => {
                                        setSelectedAgentId(a.id);
                                        if (isTutorial && tutorialStep === 0) setTutorialStep(1);
                                    }}
                                    className={`p-3 text-left border transition-all relative overflow-hidden group ${selectedAgentId === a.id ? 'bg-[#f5a623] border-[#f5a623]' : 'bg-white/5 border-white/10 hover:border-[#f5a623]/40'} ${isTutorial && tutorialStep === 0 ? 'ring-2 ring-[#f5a623] animate-pulse' : ''}`}
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
                            <div className="absolute top-0 right-0 p-4 text-[40px] font-black text-white/[0.03] pointer-events-none select-none uppercase">
                                {agent.name}
                            </div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-2 h-8" style={{ backgroundColor: agent.color }} />
                                <div>
                                    <h3 className="text-2xl font-black italic tracking-tighter uppercase">{agent.name}</h3>
                                    <p className="text-[9px] font-bold text-[#f5a623] tracking-widest uppercase italic">Specialist_Dossier</p>
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
                            <div className="absolute -top-6 left-0 text-[10px] font-black uppercase tracking-widest flex gap-4">
                                <span className={effects.inputLocked ? "text-[#f5a623]" : "text-[#f5a623]/40"}>
                                    {effects.inputLocked ? ">> CRITICAL_ERROR: INPUT_LOCKED" : ">> STATUS: OPERATIONAL"}
                                </span>
                                {effectRemaining > 0 && (
                                    <span className="text-[#f5a623] animate-pulse">
                                        {">> "} SIGNAL_INTERRUPTION: {effectRemaining.toFixed(1)}s REMAINING
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
                                {/* Admin/Debug Mock Logic - Sync with state */}
                                <div className="flex gap-4 mb-4">
                                    <SkeletalButton
                                        variant="secondary"
                                        className="h-10 px-6 text-[10px]"
                                        onClick={reset}
                                    >
                                        RESET_TRIAL
                                    </SkeletalButton>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => {
                                            setCharge(1);
                                        }}
                                        className={isTutorial && tutorialStep === 1 ? 'ring-4 ring-[#f5a623] animate-pulse rounded-lg' : ''}
                                    >
                                        <SkeletalButton variant="secondary" className="h-14 px-6 text-[10px]">
                                            FORCE_CHARGE
                                        </SkeletalButton>
                                    </button>
                                    <button
                                        onClick={() => {
                                            reset();
                                            setEffects({ flashed: false, blurred: false, inputLocked: false, scrambledWords: [], frozen: false, progressHidden: false, paranoia: false, empress: false });
                                        }}
                                    >
                                        <SkeletalButton className="h-14 px-8 text-[10px]">
                                            FULL_RESET_SEQUENCE
                                        </SkeletalButton>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-[#f5a623]/10">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#f5a623]/20 block mb-4 italic">SIGNAL_STRESS_TEST // Apply effects to local node</span>
                            <div className="flex flex-wrap gap-3">
                                <SkeletalButton onClick={() => setEffects(p => ({ ...p, flashed: true }))} borderClassName="border-[#f5a623]/20" className="h-10 px-4 text-[9px]" variant="secondary">TEST_FLASH</SkeletalButton>
                                <SkeletalButton onClick={() => setEffects(p => ({ ...p, blurred: true }))} borderClassName="border-[#f5a623]/20" className="h-10 px-4 text-[9px]" variant="secondary">TEST_BLUR</SkeletalButton>
                                <SkeletalButton onClick={() => setEffects(p => ({ ...p, inputLocked: true }))} borderClassName="border-[#f5a623]/20" className="h-10 px-4 text-[9px]" variant="secondary">TEST_LOCK</SkeletalButton>
                                <SkeletalButton onClick={() => setEffects(p => ({ ...p, scrambledWords: ['SCRAMBLED'] }))} borderClassName="border-[#f5a623]/20" className="h-10 px-4 text-[9px]" variant="secondary">TEST_SCRAMBLE</SkeletalButton>
                                <SkeletalButton onClick={() => setEffects(p => ({ ...p, frozen: true }))} borderClassName="border-[#f5a623]/20" className="h-10 px-4 text-[9px]" variant="secondary">TEST_FREEZE</SkeletalButton>
                                <SkeletalButton onClick={() => setEffects(p => ({ ...p, paranoia: true }))} borderClassName="border-[#f5a623]/20" className="h-10 px-4 text-[9px]" variant="secondary">TEST_ABSENCE</SkeletalButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Effect Overlays */}
            <EffectOverlay effects={effects} />

            {/* Tutorial HUD Overlay */}
            {isTutorial && (
                <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xl">
                    <div className="bg-[#0b0907] border-2 border-[#f5a623] p-6 shadow-[0_0_40px_rgba(245,166,35,0.2)] animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 border border-[#f5a623] flex items-center justify-center font-black italic text-[#f5a623]">
                                0{tutorialStep + 1}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-[10px] font-black tracking-[0.4em] uppercase text-[#f5a623] mb-1">Training_Module</h4>
                                <p className="text-sm font-bold text-white leading-tight uppercase tracking-tight">
                                    {tutorialStep === 0 && "Select your specialist from the roster on the left."}
                                    {tutorialStep === 1 && "Generate tactical power: either start typing the sector below or use the [FORCE_CHARGE] override."}
                                    {tutorialStep === 2 && "Power normalized. Press [TAB] to engage your specialist ultimate."}
                                    {tutorialStep === 3 && "Training complete. You are ready for live combat."}
                                </p>
                            </div>
                            {tutorialStep === 3 && (
                                <div className="flex gap-3">
                                    <SkeletalButton
                                        onClick={handleDeployToSolo}
                                        className="px-6 h-12 text-[10px] !border-[#f5a623]"
                                    >
                                        DEPLOY_SOLO_MISSION
                                    </SkeletalButton>
                                    <SkeletalButton
                                        variant="secondary"
                                        onClick={() => router.push('/')}
                                        className="px-6 h-12 text-[10px]"
                                    >
                                        RETURN_TO_HUB
                                    </SkeletalButton>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Background Decorations */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-[0.02]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[300px] font-black tracking-tighter italic text-[#f5a623]">SANDBOX</div>
            </div>
        </main>
    );
}

export default function TestingRange() {
    return (
        <React.Suspense fallback={<BunkerBackground />}>
            <TestingRangeContent />
        </React.Suspense>
    );
}
