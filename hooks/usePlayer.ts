import { useState, useCallback, useEffect } from "react";
import { ref, update, onValue, off } from "firebase/database";
import { db } from "../lib/firebase";
import { Player, PlayerEffects } from "../types";
import { AgentType } from "../lib/agents";

export const usePlayer = (roomId: string, playerId: string) => {
    const [player, setPlayer] = useState<Player | null>(null);

    useEffect(() => {
        if (!roomId || !playerId) return;

        const playerRef = ref(db, `rooms/${roomId}/players/${playerId}`);
        const unsubscribe = onValue(playerRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val() as Player;
                setPlayer({
                    ...data,
                    effects: data.effects || {
                        blurred: false,
                        flashed: false,
                        scrambledWords: [],
                        frozen: false,
                        inputLocked: false,
                        progressHidden: false
                    }
                });
            }
        });

        return () => unsubscribe();
    }, [roomId, playerId]);

    const updateProgress = useCallback(async (updates: Partial<Player>) => {
        if (!roomId || !playerId) return;
        const playerRef = ref(db, `rooms/${roomId}/players/${playerId}`);
        await update(playerRef, updates);
    }, [roomId, playerId]);

    const setReady = useCallback(async (ready: boolean) => {
        await updateProgress({ ready });
    }, [updateProgress]);

    const selectAgent = useCallback(async (agent: AgentType) => {
        await updateProgress({ agent });
    }, [updateProgress]);

    const clearEffect = useCallback(async (effectName: keyof PlayerEffects) => {
        if (!player) return;
        const effectsRef = ref(db, `rooms/${roomId}/players/${playerId}/effects`);
        await update(effectsRef, { [effectName]: effectName === 'scrambledWords' ? [] : false });
    }, [roomId, playerId, player]);

    return { player, updateProgress, setReady, selectAgent, clearEffect };
};
