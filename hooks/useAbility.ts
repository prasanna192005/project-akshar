import { useState, useEffect, useCallback, useRef } from "react";
import { ref, update, get } from "firebase/database";
import { db } from "../lib/firebase";
import { AGENTS, AgentType } from "../lib/agents";
import { calculateChargeIncrement } from "../lib/gameEngine";
import { Player } from "../types";

export const useAbility = (
    agentType: AgentType | null,
    wpm: number,
    accuracy: number,
    roomId: string,
    playerId: string,
    opponents: Player[],
    lastInputAt: number
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
                const increment = calculateChargeIncrement(
                    wpmRef.current,
                    accuracyRef.current,
                    agent.chargeRateModifier,
                    1
                );
                const next = prev + increment;
                return next >= 1 ? 1 : next;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [agent, onCooldown]); // Only restart if agent or cooldown status changes

    // Sync charge to Firebase
    useEffect(() => {
        if (!roomId || !playerId) return;
        const playerRef = ref(db, `rooms/${roomId}/players/${playerId}`);
        update(playerRef, { abilityCharge: charge });
    }, [charge, roomId, playerId]);

    const activateAbility = useCallback(async () => {
        if (!agent || charge < 1 || onCooldown || opponents.length === 0) return;

        // Pick a random opponent
        const target = opponents[Math.floor(Math.random() * opponents.length)];
        const targetEffectsRef = ref(db, `rooms/${roomId}/players/${target.id}/effects`);

        // Apply effect based on agent
        let effectUpdate = {};
        switch (agent.id) {
            case 'PYRA':
                effectUpdate = { blurred: true };
                break;
            case 'VIPER':
                effectUpdate = { scrambledWords: ['SCRAMBLED'] }; // Simplified for now
                break;
            case 'OMEN':
                effectUpdate = { progressHidden: true };
                break;
            case 'BREACH':
                effectUpdate = { flashed: true };
                break;
            case 'KILLJOY':
                effectUpdate = { inputLocked: true };
                break;
            case 'ZEPHYR':
                // Zephyr is a self-buff
                const selfRef = ref(db, `rooms/${roomId}/players/${playerId}`);
                // Logic for skipping words would be handled in useTyping or via a special trigger
                break;
            case 'SAGE':
                // Sage is a self-buff
                break;
            case 'REYNA':
                // Reyna is a self-buff
                break;
        }

        if (Object.keys(effectUpdate).length > 0) {
            await update(targetEffectsRef, effectUpdate);
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

    }, [agent, charge, onCooldown, opponents, roomId, playerId]);

    return { charge, isReady: charge >= 1, onCooldown, cooldownRemaining, activateAbility };
};
