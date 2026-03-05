export type AgentType = 'ZEPHYR' | 'PYRA' | 'SAGE' | 'VIPER' | 'OMEN' | 'BREACH' | 'REYNA' | 'KILLJOY';

export interface Agent {
    id: AgentType;
    name: string;
    realName: string;
    age: string;
    region: string;
    color: string;
    tagline: string;
    passive: string;
    active: string;
    abilityKey: string;
    chargeRateModifier: number;
    cooldown: number;
    duration: number;
    lore: string;
    commentary: {
        win: string;
        loss: string;
    };
}

export const AGENTS: Record<AgentType, Agent> = {
    ZEPHYR: {
        id: 'ZEPHYR',
        name: 'VAYU',
        realName: 'Arjun Rawat',
        age: '23',
        region: 'Delhi, North India',
        color: '#A8D8F0',
        tagline: 'Speed is my only language.',
        passive: 'Typing streak of 10+ words grants +8% speed multiplier.',
        active: 'TAILWIND — skips cursor forward 5 words instantly.',
        abilityKey: 'TAB',
        chargeRateModifier: 1.4,
        cooldown: 8,
        duration: 0,
        lore: 'A street parkour runner from Delhi turned cyber operative. Fast, cocky, and impossible to pin down.',
        commentary: {
            win: "Caught in the crosswind. Too slow!",
            loss: "I missed a step. Next time, I won't even be a blur."
        }
    },
    PYRA: {
        id: 'PYRA',
        name: 'AGNI',
        realName: 'Priya Desai',
        age: '27',
        region: 'Mumbai, Maharashtra, West India',
        color: '#FF6B2B',
        tagline: 'Born of the flame, bound by none.',
        passive: 'Typos cost 30% less WPM penalty.',
        active: 'BLAZE — applies burning blur overlay on ONE opponent\'s screen for 5s.',
        abilityKey: 'TAB',
        chargeRateModifier: 1.0,
        cooldown: 12,
        duration: 5,
        lore: 'A former fire performer and underground journalist from Mumbai. Rebellious and fierce.',
        commentary: {
            win: "I'm on fire! Literally!",
            loss: "Just a flicker. I'll be back in full blaze soon."
        }
    },
    SAGE: {
        id: 'SAGE',
        name: 'SUTRA',
        realName: 'Dr. Meera Nair',
        age: '34',
        region: 'Thiruvananthapuram, Kerala, South India',
        color: '#74D7B8',
        tagline: 'Patience is a weapon.',
        passive: 'Mistakes trigger a slow auto-correct (removes last typo after 1.5s).',
        active: 'BARRIER — freezes your own progress bar so it can\'t be targeted by effects for 4s.',
        abilityKey: 'TAB',
        chargeRateModifier: 0.8,
        cooldown: 15,
        duration: 4,
        lore: 'A professor of ancient linguistics from Kerala. Spiritual, patient, and the ultimate protector.',
        commentary: {
            win: "Balance is restored. I am the shield of this squad.",
            loss: "I could not save us this time. We must be stronger."
        }
    },
    VIPER: {
        id: 'VIPER',
        name: 'VISHA',
        realName: 'Zara Siddiqui',
        age: '29',
        region: 'Bhopal, Madhya Pradesh, Central India',
        color: '#3DBA6F',
        tagline: 'Let them choke.',
        passive: 'Opponents within 5 WPM of you get a subtle green tint on their screen.',
        active: 'POISON — scrambles 3 random upcoming words on ONE opponent\'s screen.',
        abilityKey: 'TAB',
        chargeRateModifier: 1.0,
        cooldown: 14,
        duration: 4,
        lore: 'A biochem hacker and survivor\'s daughter from Bhopal. Dark, vengeful, and lethal.',
        commentary: {
            win: "They choked on their own failure. Predictable.",
            loss: "The toxins didn't spread fast enough. I need more yield."
        }
    },
    OMEN: {
        id: 'OMEN',
        name: 'CHHAYA',
        realName: 'Unknown "Kabir"',
        age: 'Unknown',
        region: 'Varanasi, Uttar Pradesh, North India',
        color: '#7B5EA7',
        tagline: 'The nightmare is just starting.',
        passive: 'Your own progress bar is always hidden from all other players.',
        active: 'PARANOIA — hides the next 10 words from ONE opponent\'s view for 4s.',
        abilityKey: 'TAB',
        chargeRateModifier: 1.0,
        cooldown: 13,
        duration: 4,
        lore: 'A mystic from the ghats of Varanasi. Eerie and mythological, his identity is a shadow.',
        commentary: {
            win: "The nightmare continues... in their sleep.",
            loss: "They stepped out of the shadows. I must retreat."
        }
    },
    BREACH: {
        id: 'BREACH',
        name: 'BIJLI',
        realName: 'Gurpreet Dhaliwal',
        age: '32',
        region: 'Ludhiana, Punjab, Northwest India',
        color: '#E8A838',
        tagline: 'I don\'t wait for gaps. I make them.',
        passive: 'Every ability use charges 10% faster for the next ability.',
        active: 'FLASHPOINT — flashes ONE opponent\'s screen bright white for 2.5s.',
        abilityKey: 'TAB',
        chargeRateModifier: 1.5,
        cooldown: 10,
        duration: 2,
        lore: 'A bionic-armed Pehelwan wrestler from Punjab. Loud, warm, and pure power.',
        commentary: {
            win: "Like a hammer through glass! WHO IS NEXT?",
            loss: "My arms... they need a recalibration. WE GO AGAIN!"
        }
    },
    REYNA: {
        id: 'REYNA',
        name: 'KALI',
        realName: 'Lakhimi Gogoi',
        age: '31',
        region: 'Jorhat, Assam, Northeast India',
        color: '#C84FA8',
        tagline: 'Their mistakes are my strength.',
        passive: 'Soul Harvest: Every 15 correctly typed words grants a 0.5s time bonus.',
        active: 'EMPRESS — for 8s, every typo the target makes moves their progress BACKWARDS by one word.',
        abilityKey: 'TAB',
        chargeRateModifier: 1.2,
        cooldown: 11,
        duration: 8,
        lore: 'A forensic linguist and tea estate rebel from Assam. Fierce, spiritual, and unstoppable.',
        commentary: {
            win: "All that's left is for me to devour.",
            loss: "The hunger... it's not satisfied. Feed me more!"
        }
    },
    KILLJOY: {
        id: 'KILLJOY',
        name: 'YANTRA',
        realName: 'Riya Sharma',
        age: '23',
        region: 'Bangalore, Karnataka, South India',
        color: '#FADF6B',
        tagline: 'Genius at work. Don\'t interrupt.',
        passive: 'Every 20 words typed places a hidden trap (1.5s freeze for opponent).',
        active: 'LOCKDOWN — locks ONE opponent\'s keyboard input for 2s.',
        abilityKey: 'TAB',
        chargeRateModifier: 0.7,
        cooldown: 16,
        duration: 2,
        lore: 'An IIT dropout and AI genius from Bangalore. Nerdy, chaotic, and always three steps ahead.',
        commentary: {
            win: "Efficiency 100%. Did you expect anything else?",
            loss: "Data error. My turrets were misaligned. Unacceptable."
        }
    }
};
