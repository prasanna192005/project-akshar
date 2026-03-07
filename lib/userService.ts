import { ref, update, get, onValue } from "firebase/database";
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

export const saveUserStats = async (uid: string, result: { wpm: number; accuracy: number; placement: number; roomId: string }) => {
    const userRef = ref(db, `users/${uid}`);
    const snapshot = await get(userRef);
    const currentData = snapshot.val() as UserProfile | null;

    const stats = currentData?.stats || { ...DEFAULT_STATS };
    const recentMatches = currentData?.recentMatches || [];

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
        timestamp: Date.now(),
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
