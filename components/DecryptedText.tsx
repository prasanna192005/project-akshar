"use client";

import { useState, useEffect } from "react";

export default function DecryptedText({ text, hoverText, className = "" }: { text: string; hoverText: string; className?: string }) {
    const [displayText, setDisplayText] = useState(text);
    const [isHovered, setIsHovered] = useState(false);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+अआइईउऊऋएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह";

    useEffect(() => {
        let interval: NodeJS.Timeout;
        let iteration = 0;
        const target = isHovered ? hoverText : text;

        interval = setInterval(() => {
            setDisplayText(prev =>
                target.split("")
                    .map((char, index) => {
                        if (index < iteration) {
                            return target[index];
                        }
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join("")
            );

            if (iteration >= target.length) {
                clearInterval(interval);
            }

            iteration += 1 / 3;
        }, 30);

        return () => clearInterval(interval);
    }, [isHovered, text, hoverText]);

    return (
        <span
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`cursor-default select-none transition-colors duration-300 hover:text-[#f5a623] ${className}`}
        >
            {displayText}
        </span>
    );
}
