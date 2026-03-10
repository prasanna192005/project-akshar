"use client";

import { useEffect, useState } from "react";
import { User, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth, googleProvider, signInWithPopup, linkWithPopup } from "@/lib/firebase";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let guestTimeout: NodeJS.Timeout;

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                if (guestTimeout) clearTimeout(guestTimeout);
                setUser(currentUser);
                setLoading(false);
            } else {
                // FALLBACK: Only sign in anonymously if we're not currently in the middle of a session restoration
                // We wait 1.5s to be absolutely sure Firebase has a chance to restore from local storage
                if (guestTimeout) clearTimeout(guestTimeout);
                guestTimeout = setTimeout(async () => {
                    const finalCheck = auth.currentUser;
                    if (!finalCheck) {
                        try {
                            const cred = await signInAnonymously(auth);
                            setUser(cred.user);
                        } catch (error) {
                            console.error("[useAuth] Anonymous sign-in failed:", error);
                        }
                    } else {
                        setUser(finalCheck);
                    }
                    setLoading(false);
                }, 1500);
            }
        });

        return () => {
            unsubscribe();
            if (guestTimeout) clearTimeout(guestTimeout);
        };
    }, []);

    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            return result.user;
        } catch (error) {
            console.error("Google Sign-In failed:", error);
            throw error;
        }
    };

    const linkGoogleAccount = async () => {
        if (!auth.currentUser) return;
        try {
            const result = await linkWithPopup(auth.currentUser, googleProvider);
            return result.user;
        } catch (error: any) {
            // Handle case where account already exists
            if (error.code === 'auth/credential-already-in-use') {
                return loginWithGoogle();
            }
            console.error("Linking failed:", error);
            throw error;
        }
    };

    return {
        user,
        loading,
        isGuest: user?.isAnonymous,
        loginWithGoogle,
        linkGoogleAccount,
        signOut: () => auth.signOut(),
    };
}
