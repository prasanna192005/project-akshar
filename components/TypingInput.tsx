import React, { useRef } from 'react';

interface TypingInputProps {
    words: string[];
    currentWordIndex: number;
    currentInput: string;
    handleInput: (value: string) => void;
    accentColor: string;
    isActive: boolean;
    isBlurred?: boolean;
}

const TypingInput: React.FC<TypingInputProps> = ({
    words,
    currentWordIndex,
    currentInput,
    handleInput,
    accentColor,
    isActive,
    isBlurred
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus when game starts or when word advances
    React.useEffect(() => {
        if (isActive) {
            inputRef.current?.focus();
        }
    }, [isActive, currentWordIndex]);

    const handleContainerClick = () => {
        inputRef.current?.focus();
    };

    return (
        <div
            onClick={handleContainerClick}
            className={`relative w-full p-8 rounded-2xl bg-white/5 border border-white/10 transition-all duration-500 cursor-text ${isBlurred ? 'blur-md' : 'blur-0'} ${!isActive ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}`}
        >
            {!isActive && (
                <div className="absolute inset-x-0 -top-6 text-center text-[9px] uppercase font-black text-[#FF4655] tracking-[0.3em] animate-pulse">
                    Mission Control Lock: Wait for GO
                </div>
            )}
            <div className="flex flex-wrap gap-x-2 gap-y-3 text-2xl font-mono leading-relaxed select-none">
                {words.map((word, idx) => {
                    const isCurrent = idx === currentWordIndex;
                    const isPast = idx < currentWordIndex;

                    let colorClass = "text-white/20";
                    if (isPast) colorClass = "text-white/60 line-through decoration-white/20";
                    if (isCurrent) colorClass = "text-white";

                    return (
                        <span
                            key={idx}
                            className={`relative px-1 transition-all duration-200 ${colorClass}`}
                            style={{
                                textShadow: isCurrent ? `0 0 15px ${accentColor}66` : undefined,
                                borderBottom: isCurrent ? `2px solid ${accentColor}` : undefined
                            }}
                        >
                            {/* Render word character by character for feedback */}
                            {word.split("").map((char, charIdx) => {
                                let charColor = "inherit";
                                if (isCurrent) {
                                    if (charIdx < currentInput.length) {
                                        charColor = currentInput[charIdx] === char ? "#4ade80" : "#ff4655";
                                    }
                                }
                                return (
                                    <span key={charIdx} style={{ color: charColor }}>
                                        {char}
                                    </span>
                                );
                            })}
                            {isCurrent && (
                                <div className="absolute inset-0 bg-white/5 -z-10 rounded shadow-inner animate-pulse" />
                            )}
                        </span>
                    );
                })}
            </div>

            <input
                ref={inputRef}
                type="text"
                autoFocus
                value={currentInput}
                onChange={(e) => handleInput(e.target.value)}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck="false"
                className="absolute inset-0 opacity-0 cursor-default"
            />
        </div>
    );
};

export default TypingInput;
