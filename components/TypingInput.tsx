import React, { useRef } from 'react';

interface TypingInputProps {
    words: string[];
    currentWordIndex: number;
    currentInput: string;
    handleInput: (value: string) => void;
    accentColor: string;
    isActive: boolean;
    isBlurred?: boolean;
    isScrambled?: boolean;
    isParanoid?: boolean;
    agentId?: string;
}

const TypingInput: React.FC<TypingInputProps> = ({
    words,
    currentWordIndex,
    currentInput,
    handleInput,
    accentColor,
    isActive,
    isBlurred,
    isScrambled,
    isParanoid,
    agentId
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // Characters for scrambling
    const GLITCH_CHARS = "01$#%&@*?><{}[]";

    const getScrambledChar = (originalChar: string, seed: number) => {
        if (!isScrambled || originalChar === ' ') return originalChar;
        // 40% chance to show a glitch character
        if ((seed + Math.random()) % 1 < 0.4) {
            return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }
        return originalChar;
    };

    // Auto-focus when game starts or when word advances
    React.useEffect(() => {
        if (isActive) {
            const focus = () => inputRef.current?.focus();
            focus();
            // Fallback for some browsers during tab switches/renders
            const timer = setTimeout(focus, 10);
            return () => clearTimeout(timer);
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

                    let colorClass = "text-white/40";
                    if (isPast) colorClass = "text-white/20";
                    if (isCurrent) colorClass = "text-white";

                    return (
                        <div
                            key={idx}
                            className={`relative px-1 transition-all duration-200 ${colorClass}`}
                            style={{
                                textShadow: isCurrent ? `0 0 15px ${accentColor}66` : undefined,
                                borderBottom: isCurrent ? `2px solid ${accentColor}` : undefined
                            }}
                        >
                            <div className={`relative text-2xl font-black italic tracking-tighter ${isCurrent ? 'scale-110' : 'scale-100'} transition-all`}>
                                <div className="flex">
                                    {word.split('').map((char, charIdx) => {
                                        let charColor = 'inherit';
                                        let isError = false;
                                        if (isCurrent && charIdx < currentInput.length) {
                                            isError = currentInput[charIdx] !== char;

                                            if (agentId === 'PYRA') {
                                                charColor = isError ? '#FFFFFF' : accentColor;
                                            } else {
                                                charColor = isError ? '#FF4655' : accentColor;
                                            }
                                        }

                                        const showHighContrastError = agentId === 'PYRA' && isError;

                                        return (
                                            <span
                                                key={charIdx}
                                                style={{
                                                    color: charColor,
                                                    backgroundColor: showHighContrastError ? '#FF4655' : 'transparent',
                                                    padding: showHighContrastError ? '0 2px' : '0',
                                                    borderRadius: showHighContrastError ? '2px' : '0'
                                                }}
                                                className={isCurrent && isScrambled ? 'animate-pulse scale-105 inline-block origin-center opacity-80 backdrop-invert-0' : ''}
                                            >
                                                {getScrambledChar(char, charIdx)}
                                            </span>
                                        );
                                    })}
                                </div>
                                {/* Omen Paranoia Shadow */}
                                {isParanoid && !isCurrent && idx > currentWordIndex && (
                                    <div className="absolute inset-0 bg-black blur-md opacity-90 transition-opacity duration-1000" />
                                )}
                                {isParanoid && !isCurrent && idx > currentWordIndex + 5 && (
                                    <div className="absolute inset-0 bg-black opacity-100" />
                                )}
                            </div>
                            {isCurrent && (
                                <div className="absolute inset-0 bg-white/5 -z-10 rounded shadow-inner animate-pulse" />
                            )}
                        </div>
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
                className="absolute inset-0 opacity-0 cursor-text w-full h-full z-10 pointer-events-auto"
            />
        </div>
    );
};

export default TypingInput;
