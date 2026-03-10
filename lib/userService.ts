import { ref, update, get, onValue, query, orderByChild, limitToLast } from "firebase/database";
import { db } from "./firebase";

export interface UserProfile {
    uid: string;
    displayName: string | null;
    operativeHandle: string | null;
    photoURL?: string | null;
    selectedAvatar?: string | null;
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

    // Duplicate Protection: Check if this specific finish event has already been recorded
    const isDuplicate = recentMatches.some(m => m.id === result.roomId && m.timestamp === result.finishedAt);
    if (isDuplicate) {
        console.log(`[userService] Duplicate match detected for room ${result.roomId}. Tracking aborted.`);
        return;
    }

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
