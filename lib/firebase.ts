import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, signInAnonymously, GoogleAuthProvider, linkWithPopup, signInWithPopup } from "firebase/auth";
import { initializeAnalytics, logEvent, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Analytics (Browser only)
let analytics: any;
if (typeof window !== "undefined") {
    isSupported().then((supported) => {
        if (supported) {
            try {
                // Force debug_mode for DebugView (useful for testing live without latency)
                analytics = initializeAnalytics(app, {
                    config: {
                        debug_mode: true
                    }
                });
            } catch (e) {
                // Ignore initialization errors
            }
        }
    });
}

export const logTacticalEvent = (eventName: string, eventParams?: any) => {
    if (analytics) {
        logEvent(analytics, eventName, eventParams);
    }
};

export const ensureAuth = async () => {
    if (auth.currentUser) return auth.currentUser;
    try {
        const cred = await signInAnonymously(auth);
        return cred.user;
    } catch (e) {
        console.error("Firebase Auth failed:", e);
        return null;
    }
};

export { app, db, auth, analytics, googleProvider, linkWithPopup, signInWithPopup };
