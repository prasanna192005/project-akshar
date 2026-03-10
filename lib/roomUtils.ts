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
    empress: false,
};

export const createRoom = async (hostId: string, hostName: string, category: PromptCategory, config: RoomConfig, isVerified: boolean = false) => {
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
                isVerified,
            },
        },
    };

    await set(roomRef, newRoom);
    return roomId;
};

export const joinRoom = async (roomId: string, playerId: string, playerName: string, isVerified: boolean = false) => {
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
            isVerified,
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

export const createSoloRoom = async (hostId: string, hostName: string, difficulty: 'CADET' | 'OPERATIVE' | 'VETERAN' | 'WARLORD' = 'OPERATIVE', isVerified: boolean = false) => {
    // 1. Create a standard room
    const roomId = await createRoom(hostId, hostName, 'random', {
        targeting: 'leader',
        abilitySpeed: 'normal'
    }, isVerified);

    const roomRef = ref(db, `rooms/${roomId}`);

    // 2. Add 3 Tactical Bots — all set to the chosen difficulty
    const botAgentTypes: (keyof typeof import('./agents').AGENTS)[] = ['PYRA', 'ZEPHYR', 'SAGE', 'VIPER', 'OMEN', 'BREACH', 'REYNA', 'KILLJOY'];

    const botUpdates: Record<string, Player> = {};

    // Shuffle agents so each bot has a unique agent
    const shuffled = [...botAgentTypes].sort(() => Math.random() - 0.5);

    for (let i = 0; i < 3; i++) {
        const botId = `bot_${Math.random().toString(36).substring(2, 7)}`;
        const agentId = shuffled[i];

        const tacticalNames = ['STRYKER', 'VANGUARD', 'TITAN', 'SPECTER', 'GHOST', 'ECHO', 'ONYX'];
        const randomName = tacticalNames[Math.floor(Math.random() * tacticalNames.length)];

        botUpdates[`players/${botId}`] = {
            id: botId,
            name: `${randomName}_${i + 1}`,
            agent: agentId as any,
            ready: true,
            progress: 0,
            wpm: 0,
            accuracy: 100,
            abilityCharge: 0,
            abilityCooldown: false,
            finishedAt: null,
            placement: null,
            effects: INITIAL_EFFECTS,
            isVerified: false,
            // @ts-ignore
            isBot: true,
            difficulty: difficulty
        };
    }

    await update(roomRef, botUpdates);
    return roomId;
};
