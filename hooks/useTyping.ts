import { useState, useCallback, useMemo, useEffect } from "react";
import { calculateWPM, calculateAccuracy } from "../lib/gameEngine";
import { logTacticalEvent } from "../lib/firebase";

export const useTyping = (prompt: string, isActive: boolean, startTimeOverride?: number | null, blockInput?: boolean, penaltyOnErrors?: boolean) => {
    const words = useMemo(() => prompt.trim().split(/\s+/), [prompt]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentInput, setCurrentInput] = useState("");
    const [correctChars, setCorrectChars] = useState(0);
    const [totalTypedChars, setTotalTypedChars] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [errors, setErrors] = useState(0);
    const [lastInputAt, setLastInputAt] = useState<number>(Date.now());
    const [typedCorrectChars, setTypedCorrectChars] = useState(0);
    const [endTime, setEndTime] = useState<number | null>(null);

    // Derived live stats - NO DOUBLE COUNTING
    const currentCorrectCount = useMemo(() => {
        if (isComplete) return 0; // Cumulative already includes everything
        let count = 0;
        const targetWord = words[currentWordIndex];
        if (targetWord) {
            for (let i = 0; i < currentInput.length; i++) {
                if (currentInput[i] === targetWord[i]) count++;
                else break;
            }
        }
        return count;
    }, [currentInput, words, currentWordIndex, isComplete]);

    const wpm = useMemo(() => {
        if (!startTime) return 0;
        const totalCorrect = correctChars + currentCorrectCount;
        return calculateWPM(totalCorrect, startTime, endTime || Date.now());
    }, [correctChars, currentCorrectCount, startTime, endTime]);

    const accuracy = useMemo(() => {
        if (totalTypedChars === 0) return 100;
        const liveTypedCorrect = typedCorrectChars + currentCorrectCount;
        return Math.min(100, Math.round((liveTypedCorrect / totalTypedChars) * 100));
    }, [typedCorrectChars, currentCorrectCount, totalTypedChars]);

    // Reset all state
    const reset = useCallback(() => {
        setCurrentWordIndex(0);
        setCurrentInput("");
        setCorrectChars(0);
        setTotalTypedChars(0);
        setStartTime(startTimeOverride || null);
        setIsComplete(false);
        setErrors(0);
        setLastInputAt(Date.now());
        setTypedCorrectChars(0);
        setEndTime(null);
        console.log("[useTyping] State reset");
    }, [startTimeOverride]);

    // Reset when prompt changes
    useEffect(() => {
        reset();
    }, [prompt, reset]);

    // Sync startTime ONLY with override. 
    // If no override, we wait for the first keystroke in handleInput.
    useEffect(() => {
        if (startTimeOverride) {
            setStartTime(startTimeOverride);
        }
    }, [startTimeOverride]);

    const handleInput = useCallback((value: string) => {
        if (!isActive || isComplete || blockInput) return;

        setLastInputAt(Date.now());
        
        // Initialize startTime on the very first character if not already set
        if (!startTime) {
            setStartTime(Date.now());
        }

        const targetWord = words[currentWordIndex];
        const isBackspace = value.length < currentInput.length;

        if (value.endsWith(" ")) {
            const inputWord = value.trim();
            
            // Count the space as a typed character for accuracy
            setTotalTypedChars(prev => prev + 1);

            if (inputWord === targetWord) {
                // Correct word finished
                setTypedCorrectChars(prev => prev + targetWord.length + 1);
                setCorrectChars(prev => prev + targetWord.length + 1);

                if (currentWordIndex === words.length - 1) {
                    setIsComplete(true);
                    setEndTime(Date.now());
                    logTacticalEvent("race_finished", { wpm, accuracy });
                } else {
                    setCurrentWordIndex(prev => prev + 1);
                    setCurrentInput("");
                }
                return;
            } else {
                setErrors(prev => prev + 1);
                // DO NOT return here, let setCurrentInput update the state so backspace works
            }
        }

        setCurrentInput(value);

        if (!isBackspace) {
            setTotalTypedChars(prev => prev + 1);
            if (value !== targetWord.substring(0, value.length)) {
                setErrors(prev => prev + 1);
                if (penaltyOnErrors) {
                    if (currentWordIndex > 0) {
                        setCurrentWordIndex(prev => prev - 1);
                        const prevWord = words[currentWordIndex - 1];
                        setTypedCorrectChars(prev => Math.max(0, prev - prevWord.length - 1));
                        setCorrectChars(prev => Math.max(0, prev - prevWord.length - 1));
                    }
                    setCurrentInput("");
                    return;
                }
            }
        }

        if (currentWordIndex === words.length - 1 && value === targetWord) {
            setTypedCorrectChars(prev => prev + targetWord.length);
            setCorrectChars(prev => prev + targetWord.length);
            setIsComplete(true);
            setEndTime(Date.now());
            logTacticalEvent("race_finished", { wpm, accuracy });
            return;
        }
    }, [isActive, isComplete, words, currentWordIndex, currentInput, blockInput, penaltyOnErrors, wpm, accuracy, startTime, setStartTime]);

    const isError = useMemo(() => {
        const targetWord = words[currentWordIndex];
        return currentInput !== "" && !targetWord.startsWith(currentInput);
    }, [currentInput, words, currentWordIndex]);

    const progress = useMemo(() => {
        if (!prompt || words.length === 0) return 0;
        if (isComplete) return 100;

        const completedWordsChars = words.slice(0, currentWordIndex).reduce((sum, w) => sum + w.length + 1, 0);
        const totalProgress = completedWordsChars + currentCorrectCount;

        return Math.min(100, Math.round((totalProgress / prompt.length) * 100));
    }, [currentWordIndex, words, currentCorrectCount, prompt, isComplete]);

    const skipWords = useCallback((count: number) => {
        if (!isActive || isComplete) return;

        const nextIndex = Math.min(currentWordIndex + count, words.length - 1);
        const skippedWords = words.slice(currentWordIndex, nextIndex);

        const totalChars = skippedWords.reduce((sum, w) => sum + w.length + 1, 0);

        setCorrectChars(prev => prev + totalChars);
        setCurrentWordIndex(nextIndex);
        setCurrentInput("");

        if (nextIndex === words.length - 1 && words[nextIndex] === "") {
            setIsComplete(true);
            setEndTime(Date.now());
        }

        console.log(`[useTyping] Skipped ${count} words. New index: ${nextIndex}`);
    }, [isActive, isComplete, words, currentWordIndex]);

    return {
        currentWordIndex,
        currentInput,
        handleInput,
        correctChars,
        errors,
        isComplete,
        wpm,
        accuracy,
        isError,
        progress,
        words,
        lastInputAt,
        reset,
        skipWords,
        endTime
    };
};
