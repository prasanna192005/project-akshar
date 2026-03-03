import { ref, set, get, update, push, child } from "firebase/database";
import { db } from "./firebase";
import { Room, RoomStatus, Player, PlayerEffects, RoomConfig } from "../types";
import { getRandomPrompt, PromptCategory } from "./prompts";

export const INITIAL_EFFECTS: PlayerEffects = {
    blurred: false,
    flashed: false,
    scrambledWords: [],
    frozen: false,
    inputLocked: false,
    progressHidden: false,
    paranoia: false,
};

export const createRoom = async (hostId: string, hostName: string, category: PromptCategory, config: RoomConfig) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const roomRef = ref(db, `rooms/${roomId}`);

    const newRoom: Room = {
        id: roomId,
        hostId,
        status: 'lobby',
        config,
        prompt: getRandomPrompt(category),
        promptCategory: category,
        createdAt: Date.now(),
        countdownStartAt: null,
        raceStartAt: null,
        players: {
            [hostId]: {
                id: hostId,
                name: hostName,
                agent: null,
                ready: false,
                progress: 0,
                wpm: 0,
                accuracy: 100,
                abilityCharge: 0,
                abilityCooldown: false,
                finishedAt: null,
                placement: null,
                effects: INITIAL_EFFECTS,
            },
        },
    };

    await set(roomRef, newRoom);
    return roomId;
};

export const joinRoom = async (roomId: string, playerId: string, playerName: string) => {
    const roomRef = ref(db, `rooms/${roomId}`);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) {
        throw new Error("Room not found");
    }

    const room = snapshot.val() as Room;
    if (room.status !== 'lobby') {
        throw new Error("Game already in progress");
    }

    // Check if player already exists to avoid overwriting agent/ready status
    const playerRef = ref(db, `rooms/${roomId}/players/${playerId}`);
    const playerSnapshot = await get(playerRef);

    if (!playerSnapshot.exists()) {
        const newPlayer: Player = {
            id: playerId,
            name: playerName,
            agent: null,
            ready: false,
            progress: 0,
            wpm: 0,
            accuracy: 100,
            abilityCharge: 0,
            abilityCooldown: false,
            finishedAt: null,
            placement: null,
            effects: INITIAL_EFFECTS,
        };
        await set(playerRef, newPlayer);
    }

    return room;
};

export const updatePlayerState = async (roomId: string, playerId: string, updates: Partial<Player>) => {
    const playerRef = ref(db, `rooms/${roomId}/players/${playerId}`);
    await update(playerRef, updates);
};

export const updateRoomStatus = async (roomId: string, status: RoomStatus, extraUpdates: any = {}) => {
    try {
        const roomRef = ref(db, `rooms/${roomId}`);
        await update(roomRef, { status, ...extraUpdates });
    } catch (e) {
        console.error("Failed to update room status:", e);
        throw e;
    }
};
