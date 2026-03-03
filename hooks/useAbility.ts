import { useState, useEffect, useCallback, useRef } from "react";
import { ref, update, get } from "firebase/database";
import { db } from "../lib/firebase";
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

    useEffect(() => { wpmRef.current = wpm; }, [wpm]);
    useEffect(() => { accuracyRef.current = accuracy; }, [accuracy]);
    useEffect(() => { lastInputAtRef.current = lastInputAt; }, [lastInputAt]);

    // Charge logic
    useEffect(() => {
        if (!agent || onCooldown || charge >= 1) return;

        const interval = setInterval(() => {
            // Only charge if player has typed in the last 2 seconds
            if (Date.now() - lastInputAtRef.current > 2000) return;

            setCharge(prev => {
                if (prev >= 1) return 1;

                // Ability speed multiplier from config
                let speedMultiplier = 1.0;
                if (config?.abilitySpeed === 'fast') speedMultiplier = 1.5;
                if (config?.abilitySpeed === 'slow') speedMultiplier = 0.6;

                const increment = calculateChargeIncrement(
                    wpmRef.current,
                    accuracyRef.current,
                    agent.chargeRateModifier * speedMultiplier,
                    1
                );
                const next = prev + increment;
                return next >= 1 ? 1 : next;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [agent, onCooldown, config?.abilitySpeed]);

    // Sync charge to Firebase
    useEffect(() => {
        if (!roomId || !playerId) return;
        const playerRef = ref(db, `rooms/${roomId}/players/${playerId}`);
        update(playerRef, { abilityCharge: charge });
    }, [charge, roomId, playerId]);

    const activateAbility = useCallback(async () => {
        if (!agent || charge < 1 || onCooldown || opponents.length === 0) return;

        // Targeting logic based on config
        let targets: Player[] = [];
        if (config?.targeting === 'all') {
            targets = [...opponents];
        } else if (config?.targeting === 'leader') {
            targets = [[...opponents].sort((a, b) => b.progress - a.progress)[0]];
        } else {
            targets = [opponents[Math.floor(Math.random() * opponents.length)]];
        }

        // Apply effect based on agent
        let effectUpdate = {};
        switch (agent.id) {
            case 'PYRA':
                effectUpdate = { blurred: true };
                break;
            case 'VIPER':
                effectUpdate = { scrambledWords: ['SCRAMBLED'] };
                break;
            case 'OMEN':
                effectUpdate = { paranoia: true };
                break;
            case 'BREACH':
                effectUpdate = { flashed: true };
                break;
            case 'KILLJOY':
                effectUpdate = { inputLocked: true };
                break;
            case 'ZEPHYR':
                if (onSkipWords) onSkipWords(5);
                break;
            case 'REYNA':
                const isLeading = opponents.every(opp => wpmRef.current > opp.wpm);
                if (isLeading && onSkipWords) onSkipWords(5);
                break;
            // Self-buffs handled separately if needed
        }

        if (Object.keys(effectUpdate).length > 0) {
            const updates: Record<string, any> = {};
            targets.forEach(t => {
                updates[`rooms/${roomId}/players/${t.id}/effects`] = effectUpdate;
            });
            await update(ref(db), updates);
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

    }, [agent, charge, onCooldown, opponents, roomId, playerId, config]);

    return { charge, isReady: charge >= 1, onCooldown, cooldownRemaining, activateAbility };
};
