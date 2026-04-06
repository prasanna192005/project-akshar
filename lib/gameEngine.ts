export const calculateWPM = (correctChars: number, startTime: number, now: number) => {
    // Stability clamp: Don't calculate WPM for the first 1 second of typing to avoid extreme spikes
    const elapsedSeconds = (now - startTime) / 1000;
    if (elapsedSeconds < 1) return 0;
    
    const elapsedMinutes = elapsedSeconds / 60;
    // Standard: 5 characters = 1 word
    const words = correctChars / 5;
    return Math.round(words / elapsedMinutes);
};

export const calculateAccuracy = (correctChars: number, totalTypedChars: number) => {
    if (totalTypedChars === 0) return 100;
    return Math.min(100, Math.round((correctChars / totalTypedChars) * 100));
};

export const calculateChargeIncrement = (
    wpm: number,
    accuracy: number,
    modifier: number,
    deltaTimeSeconds: number
) => {
    // Base increment: if 60 WPM and 100% accuracy, fills in X seconds
    // PERFORMANCE FIX: We use a floor of 30 WPM here so the bar starts filling 
    // IMMEDIATELY on the first keystroke, even while the "Display WPM" is stabilizing.
    const effectiveWpm = Math.max(wpm, 30);
    
    // chargeRate = (currentWPM / 60) * (accuracy / 100) * agentChargeModifier
    const rate = (effectiveWpm / 60) * (accuracy / 100) * modifier;
    
    // BASELINE: At 60 WPM and 100% Acc, the bar fills in 8 seconds.
    const baseFillTime = 8;
    return (rate / baseFillTime) * deltaTimeSeconds;
};
