export interface TacticalAvatar {
    id: string;
    name: string;
    url: string;
}

export const PREMADE_AVATARS: TacticalAvatar[] = [
    {
        id: "alpha_unit",
        name: "Alpha Unit",
        url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=alpha&backgroundColor=f5a623&colors=0d0b09"
    },
    {
        id: "bravo_scout",
        name: "Bravo Scout",
        url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=bravo&backgroundColor=f5a623&colors=0d0b09"
    },
    {
        id: "delta_specter",
        name: "Delta Specter",
        url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=delta&backgroundColor=f5a623&colors=0d0b09"
    },
    {
        id: "omega_core",
        name: "Omega Core",
        url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=omega&backgroundColor=f5a623&colors=0d0b09"
    },
    {
        id: "ghost_protocol",
        name: "Ghost Protocol",
        url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=ghost&backgroundColor=f5a623&colors=0d0b09"
    },
    {
        id: "vanguard_prime",
        name: "Vanguard Prime",
        url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=vanguard&backgroundColor=f5a623&colors=0d0b09"
    },
    {
        id: "nexus_operative",
        name: "Nexus Operative",
        url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=nexus&backgroundColor=f5a623&colors=0d0b09"
    },
    {
        id: "cipher_shadow",
        name: "Cipher Shadow",
        url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=cipher&backgroundColor=f5a623&colors=0d0b09"
    }
];
