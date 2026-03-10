import { Player } from "../types";
import { AGENTS, AgentType } from "./agents";

export type BotDifficulty = 'CADET' | 'OPERATIVE' | 'VETERAN' | 'WARLORD';

export interface BotState {
    id: string;
    difficulty: BotDifficulty;
    targetWpm: number;    // unique per-bot, with spread applied
    currentWpm: number;
    accuracy: number;
    lastTick: number;
    abilityCharge: number;
    progress: number;
    isCooldown: boolean;
    nextAbilityUsage: number;
}

// Base WPM for each difficulty. Each bot gets ±10 spread so they don't move in lockstep.
const DIFFICULTY_BASE: Record<BotDifficulty, { wpm: number; acc: number; chargePerSec: number }> = {
    CADET: { wpm: 28, acc: 88, chargePerSec: 0.045 },
    OPERATIVE: { wpm: 55, acc: 93, chargePerSec: 0.065 },
    VETERAN: { wpm: 80, acc: 96, chargePerSec: 0.090 },
    WARLORD: { wpm: 110, acc: 99, chargePerSec: 0.130 },
};

// Spreads so 3 bots at the same difficulty feel distinct
const WPM_SPREADS = [-10, 0, +10];

export class BotIntelligence {
    private states: Record<string, BotState> = {};

    constructor() { }

    /**
     * Initialize a bot. Won't overwrite an already-running bot with the same ID.
     * Pass raceStartAt so the first deltaTime is ~0 instead of accumulating lobby time.
     * Pass botIndex (0,1,2) for a WPM spread so bots feel distinct.
     */
    initializeBot(id: string, difficulty: BotDifficulty, raceStartAt?: number, botIndex = 0): BotState {
        // Guard: if this bot is already initialized for this race, don't reset it.
        if (this.states[id]) return this.states[id];

        const cfg = DIFFICULTY_BASE[difficulty];
        const spread = WPM_SPREADS[botIndex % WPM_SPREADS.length];
        const targetWpm = Math.max(15, cfg.wpm + spread);

        const startTime = raceStartAt ?? Date.now();

        this.states[id] = {
            id,
            difficulty,
            targetWpm,
            currentWpm: 0,
            accuracy: cfg.acc,
            lastTick: startTime,
            abilityCharge: 0,
            progress: 0,
            isCooldown: false,
            // Stagger first ability use so bots don't all fire at once
            nextAbilityUsage: startTime + 5000 + botIndex * 3000 + Math.random() * 3000,
        };
        return this.states[id];
    }

    resetBot(id: string) {
        delete this.states[id];
    }

    resetAll() {
        this.states = {};
    }

    update(id: string, player: Player, agentType: AgentType, promptLength: number): Partial<Player> | null {
        const state = this.states[id];
        if (!state) return null;

        const now = Date.now();
        // Hard cap at 1 second per tick to prevent edge-case mega-jumps
        const deltaTime = Math.min((now - state.lastTick) / 1000, 1.0);
        state.lastTick = now;

        // 1. Effect Check — what is affecting this bot right now?
        let wpmMultiplier = 1.0;
        let stopProgress = false;

        if (player.effects) {
            // Flashed / locked / frozen by opponent ability → stop completely
            if (player.effects.flashed || player.effects.inputLocked || player.effects.frozen) {
                stopProgress = true;
                wpmMultiplier = 0;
            } else if (player.effects.blurred) {
                wpmMultiplier = 0.55; // losing ~45% speed when blurred
            } else if (player.effects.paranoia) {
                wpmMultiplier = 0.75;
            }
        }

        // 2. Progress Logic
        const variance = (Math.random() - 0.5) * 6; // ±3 WPM jitter
        state.currentWpm = stopProgress
            ? 0
            : Math.max(8, (state.targetWpm + variance) * wpmMultiplier);

        // Standard WPM to CPS: (WPM * 5) / 60
        const charactersPerSecond = (state.currentWpm * 5) / 60;
        let progressIncrement = (charactersPerSecond / promptLength) * 100 * deltaTime;

        // Reyna devour penalty — every 10% chance per second, bot "types a typo" and goes back 1 word
        if (player.effects?.empress && Math.random() < (0.1 * deltaTime)) {
            progressIncrement -= (1 / promptLength) * 100;
        }

        state.progress = Math.max(0, Math.min(100, state.progress + progressIncrement));

        // 3. Ability Charge — only charges when active (not on cooldown, not stopped)
        const agent = AGENTS[agentType];
        if (!state.isCooldown && state.abilityCharge < 1 && !stopProgress) {
            const cfg = DIFFICULTY_BASE[state.difficulty];
            const increment = cfg.chargePerSec * agent.chargeRateModifier * deltaTime;
            state.abilityCharge = Math.min(1, state.abilityCharge + increment);
        }

        // 4. Ability Usage — only fires when charge is truly FULL
        let triggerAbility = false;
        if (
            state.abilityCharge >= 1 &&
            !state.isCooldown &&
            now > state.nextAbilityUsage &&
            !stopProgress
        ) {
            triggerAbility = true;
            state.abilityCharge = 0;
            state.isCooldown = true;

            // console.log(`[BOT_FIRE] ${id} (${state.difficulty}) fires ${agentType}! Progress: ${state.progress.toFixed(1)}%`);

            setTimeout(() => {
                if (this.states[id]) {
                    this.states[id].isCooldown = false;
                    // Set next usage after cooldown expires + small random wait
                    const waitMs = state.difficulty === 'WARLORD' ? 500 : 1500;
                    this.states[id].nextAbilityUsage = Date.now() + waitMs + Math.random() * 1500;
                }
            }, agent.cooldown * 1000);
        }

        return {
            progress: state.progress,
            wpm: Math.round(state.currentWpm),
            accuracy: state.accuracy,
            abilityCharge: state.abilityCharge,
            abilityCooldown: state.isCooldown,
            ...(triggerAbility ? { _triggerAbility: true } as any : {}),
        };
    }
}

export const botIntelligence = new BotIntelligence();
