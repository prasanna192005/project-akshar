import { ref, update, get, onValue, query, orderByChild, limitToLast } from "firebase/database";
import { db } from "./firebase";

export type MissionType = 'WIN' | 'WPM' | 'ACC' | 'PLAY';

export interface Mission {
    id: string;
    type: MissionType;
    description: string;
    goal: number;
    progress: number;
    rewardXp: number;
    rewardCredits: number;
    claimed: boolean;
}

export interface UserProfile {
    uid: string;
    displayName: string | null;
    operativeHandle: string | null;
    photoURL?: string | null;
    selectedAvatar?: string | null;
    xp: number;
    credits: number;
    lastMissionReset?: string; // ISO Date
    missions?: Mission[];
    unlockedAvatars?: string[];
    stats: {
        totalWins: number;
        totalMatches: number;
        peakWpm: number;
        careerAvgWpm: number;
        accuracy: number;
    };
    recentMatches: Array<{
        id: string;
        wpm: number;
        accuracy: number;
        timestamp: number;
        placement: number;
    }>;
}

const DEFAULT_STATS = {
    totalWins: 0,
    totalMatches: 0,
    peakWpm: 0,
    careerAvgWpm: 0,
    accuracy: 0,
};

const MISSION_TEMPLATES: Omit<Mission, 'id' | 'progress' | 'claimed'>[] = [
    { type: 'PLAY', goal: 3, description: 'STRESS_TEST: Complete 3 matches', rewardXp: 100, rewardCredits: 50 },
    { type: 'WIN', goal: 1, description: 'RESTORATION_PROTOCOL: Win a match', rewardXp: 150, rewardCredits: 100 },
    { type: 'WPM', goal: 80, description: 'HIGH_BANDWIDTH: Reach 80+ WPM in a match', rewardXp: 200, rewardCredits: 150 },
    { type: 'ACC', goal: 95, description: 'PACKET_INTEGRITY: Reach 95%+ accuracy in a match', rewardXp: 200, rewardCredits: 150 },
    { type: 'PLAY', goal: 5, description: 'OPERATIVE_ENDURANCE: Complete 5 matches', rewardXp: 250, rewardCredits: 100 },
    { type: 'WPM', goal: 100, description: 'ELITE_UPLINK: Reach 100+ WPM in a match', rewardXp: 300, rewardCredits: 200 },
];

export const generateDailyMissions = (): Mission[] => {
    const shuffled = [...MISSION_TEMPLATES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3).map((template, i) => ({
        ...template,
        id: `mission_${Date.now()}_${i}`,
        progress: 0,
        claimed: false
    }));
};

export interface LevelData {
    level: number;
    title: string;
    xpToNext: number;
    progress: number; // 0 to 100
}

const XP_LEVEL_BASE = 500; // XP for level 2
const XP_LEVEL_SCALING = 1.25; // Increase XP required by 25% each level

export const getOperativeLevel = (totalXp: number): LevelData => {
    let level = 1;
    let xpRequired = XP_LEVEL_BASE;
    let accumulatedXp = 0;

    while (totalXp >= accumulatedXp + xpRequired) {
        accumulatedXp += xpRequired;
        level++;
        xpRequired = Math.floor(xpRequired * XP_LEVEL_SCALING);
    }

    const xpInCurrentLevel = totalXp - accumulatedXp;
    const progress = Math.min(100, Math.floor((xpInCurrentLevel / xpRequired) * 100));

    const titles = [
        "INITIATE", "RECRUIT", "FIELD_AGENT", "OPERATIVE", "SPECIALIST",
        "ELITE", "VANGUARD", "COMMANDER", "LEGEND", "GHOST"
    ];
    const titleIndex = Math.min(titles.length - 1, Math.floor((level - 1) / 5));

    return {
        level,
        title: titles[titleIndex],
        xpToNext: xpRequired - xpInCurrentLevel,
        progress
    };
};

export const saveUserStats = async (
    uid: string,
    result: { wpm: number; accuracy: number; placement: number; roomId: string; finishedAt: number },
    isAnonymous: boolean = false,
    fallbackName: string | null = null,
    fallbackPhoto: string | null = null
) => {
    const userRef = ref(db, `users/${uid}`);
    const snapshot = await get(userRef);
    const currentData = snapshot.val() as UserProfile | null;

    const stats = currentData?.stats || { ...DEFAULT_STATS };
    const recentMatches = currentData?.recentMatches || [];
    let xp = currentData?.xp || 0;
    let credits = currentData?.credits || 0;
    let missions = currentData?.missions || [];
    let lastReset = currentData?.lastMissionReset;

    const today = new Date().toISOString().split('T')[0];
    if (!lastReset || lastReset !== today) {
        missions = generateDailyMissions();
        lastReset = today;
    }

    // Duplicate Protection: Check if this specific finish event has already been recorded
    const isDuplicate = recentMatches.some(m => m.id === result.roomId && m.timestamp === result.finishedAt);
    if (isDuplicate) {
        console.log(`[userService] Duplicate match detected for room ${result.roomId}. Tracking aborted.`);
        return;
    }

    // Update Missions Progress
    missions = missions.map(m => {
        if (m.claimed) return m;
        let newProgress = m.progress;
        if (m.type === 'PLAY') newProgress += 1;
        if (m.type === 'WIN' && result.placement === 1) newProgress += 1;
        if (m.type === 'WPM') newProgress = Math.max(newProgress, result.wpm);
        if (m.type === 'ACC') newProgress = Math.max(newProgress, result.accuracy);

        return { ...m, progress: Math.min(m.goal, newProgress) };
    });

    // Update aggregate stats
    const totalMatches = stats.totalMatches + 1;
    const totalWins = stats.totalWins + (result.placement === 1 ? 1 : 0);
    const peakWpm = Math.max(stats.peakWpm, result.wpm);
    const careerAvgWpm = (stats.careerAvgWpm * stats.totalMatches + result.wpm) / totalMatches;
    const totalAccuracy = (stats.accuracy * stats.totalMatches + result.accuracy) / totalMatches;

    const newMatch = {
        id: result.roomId,
        wpm: result.wpm,
        accuracy: result.accuracy,
        timestamp: result.finishedAt, // Use the actual finish timestamp as the record ID
        placement: result.placement
    };

    const updatedRecent = [newMatch, ...recentMatches].slice(0, 50); // Keep last 50

    await update(userRef, {
        displayName: currentData?.displayName || null,
        operativeHandle: currentData?.operativeHandle || (currentData?.displayName ? currentData.displayName.split(' ')[0].toUpperCase() : null),
        xp,
        credits,
        lastMissionReset: lastReset,
        missions,
        stats: {
            totalWins,
            totalMatches,
            peakWpm,
            careerAvgWpm,
            accuracy: totalAccuracy
        },
        recentMatches: updatedRecent
    });

    // If the user is registered (not anonymous), sync to the public leaderboard node
    if (!isAnonymous) {
        const leaderboardRef = ref(db, `leaderboard/${uid}`);
        const finalDisplayName = currentData?.displayName || fallbackName || "OPERATIVE";
        const finalHandle = currentData?.operativeHandle || (finalDisplayName !== "OPERATIVE" ? finalDisplayName.split(' ')[0].toUpperCase() : "SOLO_UNIT");

        await update(leaderboardRef, {
            uid,
            displayName: finalDisplayName,
            operativeHandle: finalHandle,
            selectedAvatar: currentData?.selectedAvatar || null,
            stats: {
                totalWins,
                totalMatches,
                peakWpm,
                careerAvgWpm,
                accuracy: totalAccuracy
            }
        });
        console.log(`[userService] Global leaderboard sync complete for ${uid}`);
    }
};

export const claimMissionReward = async (uid: string, missionId: string) => {
    const userRef = ref(db, `users/${uid}`);
    const snapshot = await get(userRef);
    const currentData = snapshot.val() as UserProfile | null;

    if (!currentData?.missions) return;

    const mission = currentData.missions.find(m => m.id === missionId);
    if (!mission || mission.claimed || mission.progress < mission.goal) return;

    const newMissions = currentData.missions.map(m =>
        m.id === missionId ? { ...m, claimed: true } : m
    );

    await update(userRef, {
        missions: newMissions,
        xp: (currentData.xp || 0) + mission.rewardXp,
        credits: (currentData.credits || 0) + mission.rewardCredits
    });

    return { xp: mission.rewardXp, credits: mission.rewardCredits };
};

export const ensureMissions = async (uid: string) => {
    const userRef = ref(db, `users/${uid}`);
    const snapshot = await get(userRef);
    const currentData = snapshot.val() as UserProfile | null;

    const today = new Date().toISOString().split('T')[0];
    const lastReset = currentData?.lastMissionReset;

    if (!currentData?.missions || !lastReset || lastReset !== today) {
        console.log(`[userService] Missions missing or stale for ${uid}. Generating...`);
        const missions = generateDailyMissions();
        await update(userRef, {
            missions,
            lastMissionReset: today,
            // Initialize xp/credits if they don't exist
            xp: currentData?.xp || 0,
            credits: currentData?.credits || 0
        });
        return missions;
    }
    return currentData.missions;
};

export const purchaseAvatar = async (uid: string, avatarId: string, price: number): Promise<{ success: boolean; message: string }> => {
    const userRef = ref(db, `users/${uid}`);
    const snapshot = await get(userRef);
    const currentData = snapshot.val() as UserProfile | null;

    if (!currentData) return { success: false, message: "User not found" };

    const currentCredits = currentData.credits || 0;
    const unlocked = currentData.unlockedAvatars || ["alpha_unit"];

    if (unlocked.includes(avatarId)) {
        return { success: false, message: "Asset already unlocked" };
    }

    if (currentCredits < price) {
        return { success: false, message: "Insufficient Akshar Credits" };
    }

    const newUnlocked = [...unlocked, avatarId];
    await update(userRef, {
        credits: currentCredits - price,
        unlockedAvatars: newUnlocked
    });

    return { success: true, message: "Asset recruitment successful" };
};

export const updateOperativeHandle = async (uid: string, handle: string) => {
    const userRef = ref(db, `users/${uid}`);
    await update(userRef, { operativeHandle: handle.toUpperCase() });
};

export const updateSelectedAvatar = async (uid: string, avatarId: string) => {
    const userRef = ref(db, `users/${uid}`);
    await update(userRef, { selectedAvatar: avatarId });
};

export const getUserData = async (uid: string): Promise<UserProfile | null> => {
    const userRef = ref(db, `users/${uid}`);
    const snapshot = await get(userRef);
    return snapshot.val();
};

export const subscribeToUserProfile = (uid: string, callback: (profile: UserProfile | null) => void) => {
    const userRef = ref(db, `users/${uid}`);
    return onValue(userRef, (snapshot) => {
        callback(snapshot.val());
    });
};
export const getGlobalLeaderboard = async (sortBy: 'totalWins' | 'peakWpm' | 'totalMatches' = 'totalWins', limit: number = 10): Promise<UserProfile[]> => {
    const leaderboardRef = ref(db, 'leaderboard');
    const leaderboardQuery = query(
        leaderboardRef,
        orderByChild(`stats/${sortBy}`),
        limitToLast(limit)
    );

    const snapshot = await get(leaderboardQuery);
    const users: UserProfile[] = [];

    snapshot.forEach((childSnapshot) => {
        users.push(childSnapshot.val() as UserProfile);
    });

    // Firebase returns in ascending order, so reverse for descending
    return users.reverse();
};
