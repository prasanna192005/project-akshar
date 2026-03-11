"use client";

import { useState, useEffect, useRef } from 'react';
import { AgentType, AGENTS } from '@/lib/agents';
import { Player } from '@/types';

type DemoState = 'LOBBY' | 'COUNTDOWN' | 'RACING' | 'RESULTS';

export function useDemoDirector() {
    const [state, setState] = useState<DemoState>('LOBBY');
    const [players, setPlayers] = useState<Player[]>([]);
    const [mainPlayerId, setMainPlayerId] = useState<string>('');
    const [progress, setProgress] = useState(0);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [currentInput, setCurrentInput] = useState("");
    const [effects, setEffects] = useState<any>({});
    const [charge, setCharge] = useState(0);

    const prompt = "In the heart of the digital wasteland, the AKSHAR protocol hums with ancient power. Every keystroke is a heartbeat, every word a tactical strike. We are the architects of the new world, the silent storm that breaks the chains of the old systems.";
    const words = prompt.split(" ");

    // Initialize players on mount
    useEffect(() => {
        const agentKeys = Object.keys(AGENTS) as AgentType[];
        const mockPlayers: Player[] = agentKeys.map((type, i) => ({
            id: `p-${i}`,
            name: AGENTS[type].name,
            agent: type,
            ready: true,
            progress: 0,
            wpm: 0,
            accuracy: 100,
            abilityCharge: 0,
            abilityCooldown: false,
            finishedAt: null,
            placement: null,
            effects: {
                blurred: false,
                flashed: false,
                scrambledWords: [],
                frozen: false,
                inputLocked: false,
                progressHidden: false,
                paranoia: false,
                empress: false
            }
        }));
        setPlayers(mockPlayers);
        setMainPlayerId(mockPlayers[0].id); // ZEPHYR is the main player
    }, []);

    // State: LOBBY -> COUNTDOWN -> RACING
    const startRecording = () => {
        setState('COUNTDOWN');
        setTimeout(() => setState('RACING'), 4000);
    };

    // Main Loop (Racing)
    useEffect(() => {
        if (state !== 'RACING') return;

        let interval = setInterval(() => {
            setPlayers(prev => {
                const next = [...prev].map(p => ({ ...p, effects: { ...p.effects } }));

                // 1. Update Main Player Typing Simulation
                const main = next.find(p => p.id === mainPlayerId);
                if (main && main.progress < 100) {
                    // Variable progress based on "WPM"
                    const speed = 0.5 + Math.random() * 0.3; // Steady climb
                    const newProgress = Math.min(100, main.progress + speed);
                    main.progress = newProgress;
                    main.wpm = Math.floor(115 + Math.random() * 15);
                    setProgress(newProgress);
                    setWpm(main.wpm);

                    // Sync charge
                    setCharge(prev => Math.min(100, prev + 0.8));

                    // Auto-type input simulation (Current word)
                    const currentWordIdx = Math.floor((newProgress / 100) * words.length);
                    const targetWord = words[currentWordIdx] || "";
                    // Flickering effect for "typing" feel
                    if (Math.random() > 0.4) {
                        setCurrentInput(targetWord.substring(0, Math.floor(Math.random() * targetWord.length + 1)));
                    }

                    // --- CHOREOGRAPHED SEQUENCE ---

                    // 15%: ZEPHYR SLIPSTREAM (Surge)
                    if (newProgress > 15 && newProgress < 17) {
                        main.progress += 2; // Subtle boost
                    }

                    // 40%: BIJLI (Bot) Flashes
                    if (newProgress > 40 && newProgress < 41) {
                        setEffects((prev: any) => ({ ...prev, flashed: true }));
                        setTimeout(() => setEffects((prev: any) => ({ ...prev, flashed: false })), 2000);
                    }

                    // 55%: YANTRA (Bot) Locks Input
                    if (newProgress > 55 && newProgress < 56) {
                        setEffects((prev: any) => ({ ...prev, inputLocked: true }));
                        setTimeout(() => setEffects((prev: any) => ({ ...prev, inputLocked: false })), 1500);
                    }

                    // 70%: OMEN (Bot) Paranoia
                    if (newProgress > 70 && newProgress < 70.5) {
                        setEffects((prev: any) => ({ ...prev, paranoia: true }));
                        setTimeout(() => setEffects((prev: any) => ({ ...prev, paranoia: false })), 3000);
                    }

                    // 85%: KALI (Main) Activates EMPRESS
                    if (newProgress > 85 && newProgress < 86) {
                        setEffects((prev: any) => ({ ...prev, empress: true }));
                    }

                    if (main.progress >= 100) {
                        setTimeout(() => setState('RESULTS'), 3000);
                    }
                }

                // 2. Update Bots (Competitive behavior)
                next.forEach((p, idx) => {
                    if (p.id !== mainPlayerId) {
                        // Bots 1-3 are faster, 4-7 are slower
                        const baseSpeed = idx < 4 ? 0.45 : 0.35;
                        const jitter = Math.random() * 0.2;
                        p.progress = Math.min(98.5, p.progress + baseSpeed + jitter);
                        p.wpm = Math.floor(90 + Math.random() * 20);

                        // Bot abilities (Visual in leaderboard)
                        if (Math.random() > 0.99) {
                            p.effects.frozen = true;
                            setTimeout(() => { p.effects.frozen = false; }, 3000);
                        }
                    }
                });

                return next;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [state, mainPlayerId]);

    return {
        state,
        players,
        mainPlayerId,
        progress,
        wpm,
        accuracy,
        currentInput,
        effects,
        charge,
        prompt,
        startRecording
    };
}
