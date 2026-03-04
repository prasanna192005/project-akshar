import { AgentType } from "../lib/agents";

export interface PlayerEffects {
    blurred: boolean;
    flashed: boolean;
    scrambledWords: string[];
    frozen: boolean;
    inputLocked: boolean;
    progressHidden: boolean;
    paranoia: boolean;
    empress: boolean;
}

export interface Player {
    id: string;
    name: string;
    agent: AgentType | null;
    ready: boolean;
    progress: number;
    wpm: number;
    accuracy: number;
    abilityCharge: number;
    abilityCooldown: boolean;
    finishedAt: number | null;
    placement: number | null;
    effects: PlayerEffects;
}

export type RoomStatus = 'lobby' | 'countdown' | 'racing' | 'finished';

export interface RoomConfig {
    targeting: 'random' | 'leader' | 'all';
    abilitySpeed: 'slow' | 'normal' | 'fast';
}

export interface Room {
    id: string;
    hostId: string;
    status: RoomStatus;
    config: RoomConfig;
    prompt: string;
    promptCategory: string;
    createdAt: number;
    countdownStartAt: number | null;
    raceStartAt: number | null;
    players: Record<string, Player>;
}
