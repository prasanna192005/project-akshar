export const calculateWPM = (correctChars: number, startTime: number, now: number) => {
    const elapsedMinutes = (now - startTime) / 1000 / 60;
    if (elapsedMinutes <= 0) return 0;
    // Standard: 5 characters = 1 word
    const words = correctChars / 5;
    return Math.round(words / elapsedMinutes);
};

export const calculateAccuracy = (correctChars: number, totalTypedChars: number) => {
    if (totalTypedChars === 0) return 100;
    return Math.round((correctChars / totalTypedChars) * 100);
};

export const calculateChargeIncrement = (
    wpm: number,
    accuracy: number,
    modifier: number,
    deltaTimeSeconds: number
) => {
    // Base increment: if 60 WPM and 100% accuracy, fills in X seconds
    // chargeRate = (currentWPM / 60) * (accuracy / 100) * agentChargeModifier
    const rate = (wpm / 60) * (accuracy / 100) * modifier;
    // rate is roughly how many % per second if we want it to be fast.
    // Let's say we want it to fill in 8 seconds at 60WPM/100% accuracy with modifier 1.0
    const baseFillTime = 8;
    return (rate / baseFillTime) * deltaTimeSeconds;
};
