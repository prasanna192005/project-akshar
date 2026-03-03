import { useState, useCallback, useMemo, useEffect } from "react";
import { calculateWPM, calculateAccuracy } from "../lib/gameEngine";

export const useTyping = (prompt: string, isActive: boolean, startTimeOverride?: number | null) => {
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
        if (!isActive) return;
        if (isComplete) return;

        setLastInputAt(Date.now());
        const targetWord = words[currentWordIndex];

        // Check if space was pressed to advance word
        if (value.endsWith(" ")) {
            const inputWord = value.trim();

            if (inputWord === targetWord) {
                // Correct word - advance
                setCorrectChars(prev => prev + targetWord.length + 1); // +1 for space

                if (currentWordIndex === words.length - 1) {
                    setIsComplete(true);
                    console.log("[useTyping] Mission Accomplished!");
                } else {
                    setCurrentWordIndex(prev => prev + 1);
                    setCurrentInput("");
                }
            } else {
                // Space pressed but word incorrect
                setErrors(prev => prev + 1);
                setCurrentInput(value); // Keep word with space for feedback
            }
            return;
        }

        // Normal character input
        setCurrentInput(value);
        setTotalTypedChars(prev => prev + 1);

        // Auto-complete last word if fully correct (no space needed)
        if (currentWordIndex === words.length - 1 && value === targetWord) {
            setCorrectChars(prev => prev + targetWord.length);
            setIsComplete(true);
            return;
        }

        // Error detection for feedback
        if (value !== targetWord.substring(0, value.length)) {
            setErrors(prev => prev + 1);
        }
    }, [isActive, isComplete, words, currentWordIndex]);

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
        lastInputAt
    };
};
