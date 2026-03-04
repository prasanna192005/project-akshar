export type AgentType = 'ZEPHYR' | 'PYRA' | 'SAGE' | 'VIPER' | 'OMEN' | 'BREACH' | 'REYNA' | 'KILLJOY';

export interface Agent {
    id: AgentType;
    name: string;
    color: string;
    tagline: string;
    passive: string;
    active: string;
    abilityKey: string;
    chargeRateModifier: number;
    cooldown: number;
    duration: number;
    lore: string;
}

export const AGENTS: Record<AgentType, Agent> = {
    ZEPHYR: {
        id: 'ZEPHYR',
        name: 'ZEPHYR',
        color: '#A8D8F0',
        tagline: 'Wind waits for no one.',
        passive: 'Typing streak of 10+ words grants +8% speed multiplier.',
        active: 'TAILWIND — skips cursor forward 5 words instantly.',
        abilityKey: 'TAB',
        chargeRateModifier: 1.4,
        cooldown: 8,
        duration: 0,
        lore: 'Inspired by Jett. Fast and agile.'
    },
    PYRA: {
        id: 'PYRA',
        name: 'PYRA',
        color: '#FF6B2B',
        tagline: 'Watch me burn bright.',
        passive: 'Typos cost 30% less WPM penalty.',
        active: 'BLAZE — applies burning blur overlay on ONE opponent\'s screen for 5s.',
        abilityKey: 'TAB',
        chargeRateModifier: 1.0,
        cooldown: 12,
        duration: 5,
        lore: 'Inspired by Phoenix. Heals from fire.'
    },
    SAGE: {
        id: 'SAGE',
        name: 'SAGE',
        color: '#74D7B8',
        tagline: 'Patience is a weapon.',
        passive: 'Mistakes trigger a slow auto-correct (removes last typo after 1.5s).',
        active: 'BARRIER — freezes your own progress bar so it can\'t be targeted by effects for 4s.',
        abilityKey: 'TAB',
        chargeRateModifier: 0.8,
        cooldown: 15,
        duration: 4,
        lore: 'Inspired by Sage. The protector.'
    },
    VIPER: {
        id: 'VIPER',
        name: 'VIPER',
        color: '#3DBA6F',
        tagline: 'Let them choke.',
        passive: 'Opponents within 5 WPM of you get a subtle green tint on their screen.',
        active: 'POISON — scrambles 3 random upcoming words on ONE opponent\'s screen.',
        abilityKey: 'TAB',
        chargeRateModifier: 1.0,
        cooldown: 14,
        duration: 4,
        lore: 'Inspired by Viper. Toxic zone controller.'
    },
    OMEN: {
        id: 'OMEN',
        name: 'OMEN',
        color: '#7B5EA7',
        tagline: 'You never see me coming.',
        passive: 'Your own progress bar is always hidden from all other players.',
        active: 'PARANOIA — hides the next 10 words from ONE opponent\'s view for 4s.',
        abilityKey: 'TAB',
        chargeRateModifier: 1.0,
        cooldown: 13,
        duration: 4,
        lore: 'Inspired by Omen. Shadowy manipulator.'
    },
    BREACH: {
        id: 'BREACH',
        name: 'BREACH',
        color: '#E8A838',
        tagline: 'I\'ll break through anything.',
        passive: 'Every ability use charges 10% faster for the next ability.',
        active: 'FLASHPOINT — flashes ONE opponent\'s screen bright white for 2.5s.',
        abilityKey: 'TAB',
        chargeRateModifier: 1.5,
        cooldown: 10,
        duration: 2,
        lore: 'Inspired by Breach. The entry frag initiator.'
    },
    REYNA: {
        id: 'REYNA',
        name: 'REYNA',
        color: '#C84FA8',
        tagline: 'THEIR MISTAKES ARE MY STRENGTH.',
        passive: 'Soul Harvest: Every 15 correctly typed words grants a 0.5s time bonus.',
        active: 'EMPRESS — for 8s, every typo the target makes moves their progress BACKWARDS by one word.',
        abilityKey: 'TAB',
        chargeRateModifier: 1.2,
        cooldown: 11,
        duration: 8,
        lore: 'Inspired by Reyna. A soul-eating duelist who punishes failure.'
    },
    KILLJOY: {
        id: 'KILLJOY',
        name: 'KILLJOY',
        color: '#FADF6B',
        tagline: 'Genius at work. Don\'t interrupt.',
        passive: 'Every 20 words typed places a hidden trap (1.5s freeze for opponent).',
        active: 'LOCKDOWN — locks ONE opponent\'s keyboard input for 2s.',
        abilityKey: 'TAB',
        chargeRateModifier: 0.7,
        cooldown: 16,
        duration: 2,
        lore: 'Inspired by Killjoy. Strategic denial.'
    }
};
