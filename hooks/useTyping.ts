import { useState, useCallback, useMemo, useEffect } from "react";
import { calculateWPM, calculateAccuracy } from "../lib/gameEngine";

export const useTyping = (prompt: string, isActive: boolean, startTimeOverride?: number | null, blockInput?: boolean) => {
    const words = useMemo(() => prompt.trim().split(/\s+/), [prompt]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentInput, setCurrentInput] = useState("");
    const [correctChars, setCorrectChars] = useState(0);
    const [totalTypedChars, setTotalTypedChars] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [errors, setErrors] = useState(0);
    const [lastInputAt, setLastInputAt] = useState<number>(Date.now());

    // Reset state when prompt changes (e.g., new game)
    useEffect(() => {
        setCurrentWordIndex(0);
        setCurrentInput("");
        setCorrectChars(0);
        setTotalTypedChars(0);
        setStartTime(null);
        setIsComplete(false);
        setErrors(0);
        setLastInputAt(Date.now());
        console.log("[useTyping] Resetting state for new prompt");
    }, [prompt]);

    // Sync startTime with override from room data
    useEffect(() => {
        if (startTimeOverride) {
            setStartTime(startTimeOverride);
        } else if (isActive && !startTime) {
            setStartTime(Date.now());
        }
    }, [isActive, startTime, startTimeOverride]);

    const handleInput = useCallback((value: string) => {
        if (!isActive || isComplete || blockInput) return;

        setLastInputAt(Date.now());
        const targetWord = words[currentWordIndex];
        const isBackspace = value.length < currentInput.length;

        // Prevent leading space
        if (value === " ") return;

        // Check if space was pressed to advance word
        if (value.endsWith(" ")) {
            const inputWord = value.trim();

            if (inputWord === targetWord) {
                // Correct word - advance
                // For the last word, no space is needed, but if they type one it's okay
                setCorrectChars(prev => prev + targetWord.length + 1);

                if (currentWordIndex === words.length - 1) {
                    setIsComplete(true);
                    console.log("[useTyping] Mission Accomplished!");
                } else {
                    setCurrentWordIndex(prev => prev + 1);
                    setCurrentInput("");
                }
            } else {
                // Space pressed but word incorrect
                // We IGNORE the space so their input doesn't get messed up
                // and they don't get "stuck" by trailing spaces.
                setErrors(prev => prev + 1);
            }
            return;
        }

        // Normal character input
        setCurrentInput(value);

        if (!isBackspace) {
            setTotalTypedChars(prev => prev + 1);
            // Instant error feedback
            if (value !== targetWord.substring(0, value.length)) {
                setErrors(prev => prev + 1);
            }
        }

        // Auto-complete last word if fully correct (no space needed)
        if (currentWordIndex === words.length - 1 && value === targetWord) {
            setCorrectChars(prev => prev + targetWord.length);
            setIsComplete(true);
            return;
        }
    }, [isActive, isComplete, words, currentWordIndex, currentInput, blockInput]);

    const wpm = useMemo(() => {
        if (!startTime) return 0;
        return calculateWPM(correctChars, startTime, Date.now());
    }, [correctChars, startTime]);

    const accuracy = useMemo(() => {
        return calculateAccuracy(correctChars, totalTypedChars);
    }, [correctChars, totalTypedChars]);

    const progress = useMemo(() => {
        if (words.length === 0) return 0;
        return Math.round((currentWordIndex / words.length) * 100);
    }, [currentWordIndex, words.length]);

    const skipWords = useCallback((count: number) => {
        if (!isActive || isComplete) return;

        const nextIndex = Math.min(currentWordIndex + count, words.length - 1);
        const skippedWords = words.slice(currentWordIndex, nextIndex);

        // Count skipped words as correct for WPM calculation
        const totalChars = skippedWords.reduce((sum, w) => sum + w.length + 1, 0);

        setCorrectChars(prev => prev + totalChars);
        setCurrentWordIndex(nextIndex);
        setCurrentInput("");

        if (nextIndex === words.length - 1 && words[nextIndex] === "") {
            setIsComplete(true);
        }

        console.log(`[useTyping] Skipped ${count} words. New index: ${nextIndex}`);
    }, [isActive, isComplete, words, currentWordIndex]);

    const reset = useCallback(() => {
        setCurrentWordIndex(0);
        setCurrentInput("");
        setCorrectChars(0);
        setTotalTypedChars(0);
        setStartTime(startTimeOverride || null);
        setIsComplete(false);
        setErrors(0);
        setLastInputAt(Date.now());
        console.log("[useTyping] Manual reset triggered");
    }, [startTimeOverride]);

    return {
        currentWordIndex,
        currentInput,
        handleInput,
        correctChars,
        errors,
        isComplete,
        wpm,
        accuracy,
        progress,
        words,
        lastInputAt,
        reset,
        skipWords
    };
};
