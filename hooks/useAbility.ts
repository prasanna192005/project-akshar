import { useState, useEffect, useCallback, useRef } from "react";
import { ref, update, get } from "firebase/database";
import { db, logTacticalEvent } from "../lib/firebase";
import { AGENTS, AgentType } from "../lib/agents";
import { calculateChargeIncrement } from "../lib/gameEngine";
import { Room, RoomStatus, Player, PlayerEffects, RoomConfig } from "../types";

export const useAbility = (
    agentType: AgentType | null,
    wpm: number,
    accuracy: number,
    roomId: string,
    playerId: string,
    opponents: Player[],
    lastInputAt: number,
    isError: boolean,
    progress: number,
    config?: RoomConfig,
    onSkipWords?: (count: number) => void
) => {
    const [charge, setCharge] = useState(0);
    const [onCooldown, setOnCooldown] = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);

    const agent = agentType ? AGENTS[agentType] : null;

    // Use refs for values that change frequently to avoid resetting the charging interval
    const wpmRef = useRef(wpm);
    const accuracyRef = useRef(accuracy);
    const lastInputAtRef = useRef(lastInputAt);
    const isErrorRef = useRef(isError);
    const progressRef = useRef(progress);
    const prevProgressRef = useRef(progress);

    useEffect(() => { wpmRef.current = wpm; }, [wpm]);
    useEffect(() => { accuracyRef.current = accuracy; }, [accuracy]);
    useEffect(() => { lastInputAtRef.current = lastInputAt; }, [lastInputAt]);
    useEffect(() => { isErrorRef.current = isError; }, [isError]);
    useEffect(() => { progressRef.current = progress; }, [progress]);

    // Charge logic
    useEffect(() => {
        if (!agent || onCooldown || charge >= 1) return;

        const interval = setInterval(() => {
            // Restrictions:
            // 1. Only charge if player has typed in the last 2 seconds
            // 2. ONLY charge if there is NO error in their current input
            // 3. ONLY charge if they are making forward progress (avoid backspace farming)
            if (Date.now() - lastInputAtRef.current > 2000) return;
            if (isErrorRef.current) return;

            const currentProgress = progressRef.current;
            if (currentProgress <= prevProgressRef.current) return;

            // Advance the baseline for the next charging tick
            prevProgressRef.current = currentProgress;

            setCharge(prev => {
                if (prev >= 1) return 1;

                // Ability speed multiplier from config
                let speedMultiplier = 1.0;
                if (config?.abilitySpeed === 'fast') speedMultiplier = 1.5;
                if (config?.abilitySpeed === 'slow') speedMultiplier = 0.6;

                // Delta time is now 0.2s for 200ms updates
                const increment = calculateChargeIncrement(
                    wpmRef.current,
                    accuracyRef.current,
                    agent.chargeRateModifier * speedMultiplier,
                    0.2
                );
                const next = prev + increment;
                return next >= 1 ? 1 : next;
            });
        }, 200);

        return () => clearInterval(interval);
    }, [agent, onCooldown, config?.abilitySpeed]);

    // Sync charge to Firebase
    useEffect(() => {
        if (!roomId || !playerId) return;
        const playerRef = ref(db, `rooms/${roomId}/players/${playerId}`);
        update(playerRef, { abilityCharge: charge });
    }, [charge, roomId, playerId]);

    const activateAbility = useCallback(async () => {
        if (!agent || charge < 1 || onCooldown) return;

        // Log tactical event
        logTacticalEvent("ability_deployed", { agent: agent.name, ability: agent.id });

        // Targeting logic based on config
        let targets: Player[] = [];
        if (opponents.length > 0) {
            if (config?.targeting === 'all') {
                targets = [...opponents];
            } else if (config?.targeting === 'leader') {
                targets = [[...opponents].sort((a, b) => b.progress - a.progress)[0]];
            } else {
                targets = [opponents[Math.floor(Math.random() * opponents.length)]];
            }
        }

        // Apply effect based on agent
        let effectUpdate: Record<string, any> = {};
        switch (agent.id) {
            case 'REYNA':
                effectUpdate = { 'effects/empress': true };
                break;
            case 'PYRA':
                effectUpdate = { 'effects/blurred': true };
                break;
            case 'VIPER':
                effectUpdate = { 'effects/scrambledWords': ['SCRAMBLED'] };
                break;
            case 'OMEN':
                effectUpdate = { 'effects/paranoia': true };
                break;
            case 'BREACH':
                effectUpdate = { 'effects/flashed': true };
                break;
            case 'KILLJOY':
                effectUpdate = { 'effects/inputLocked': true };
                break;
            case 'SAGE':
                effectUpdate = { 'effects/frozen': true }; // Sage's current implementation prevents targeting if frozen
                break;
            case 'ZEPHYR':
                if (onSkipWords) onSkipWords(5);
                break;
        }

        if (Object.keys(effectUpdate).length > 0 && targets.length > 0 && roomId !== 'tutorial') {
            const updates: Record<string, any> = {};
            targets.forEach(t => {
                Object.entries(effectUpdate).forEach(([field, value]) => {
                    updates[`rooms/${roomId}/players/${t.id}/${field}`] = value;
                });
            });
            await update(ref(db), updates);

            const duration = agent.duration * 1000;
            setTimeout(async () => {
                const clearUpdates: Record<string, any> = {};
                targets.forEach(t => {
                    if (agent.id === 'REYNA') clearUpdates[`rooms/${roomId}/players/${t.id}/effects/empress`] = false;
                    if (agent.id === 'PYRA') clearUpdates[`rooms/${roomId}/players/${t.id}/effects/blurred`] = false;
                    if (agent.id === 'BREACH') clearUpdates[`rooms/${roomId}/players/${t.id}/effects/flashed`] = false;
                    if (agent.id === 'KILLJOY') clearUpdates[`rooms/${roomId}/players/${t.id}/effects/inputLocked`] = false;
                    if (agent.id === 'OMEN') clearUpdates[`rooms/${roomId}/players/${t.id}/effects/paranoia`] = false;
                    if (agent.id === 'VIPER') clearUpdates[`rooms/${roomId}/players/${t.id}/effects/scrambledWords`] = [];
                    if (agent.id === 'SAGE') clearUpdates[`rooms/${roomId}/players/${t.id}/effects/frozen`] = false;
                });
                await update(ref(db), clearUpdates);
            }, duration);
        }

        // Set cooldown
        setCharge(0);
        setOnCooldown(true);
        setCooldownRemaining(agent.cooldown);

        const cooldownInterval = setInterval(() => {
            setCooldownRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(cooldownInterval);
                    setOnCooldown(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

    }, [agent, charge, onCooldown, opponents, roomId, playerId, config, onSkipWords]);

    return { charge, setCharge, isReady: charge >= 1, onCooldown, cooldownRemaining, activateAbility };
};
