import React, { useState, useEffect } from 'react';

export default function BunkerBackground() {
    const [streams, setStreams] = useState<{ id: number; left: number; delay: number; duration: number; text: string }[]>([]);
    const words = ["अक्षर", "ऊर्जा", "स्थिति", "डेटा", "प्रोटोकॉल", "नेटवर्क", "सुरक्षा", "सिस्टम"];

    useEffect(() => {
        const newStreams = Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * -20,
            duration: 15 + Math.random() * 20,
            text: Array.from({ length: 8 }).map(() => words[Math.floor(Math.random() * words.length)]).join("  ")
        }));
        setStreams(newStreams);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03] select-none z-0">
            {/* Background Amber Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#f5a623]/5 blur-[160px] rounded-full -z-10 animate-pulse" />

            {streams.map((stream) => (
                <div
                    key={stream.id}
                    className="absolute top-[-20%] whitespace-nowrap text-[10px] uppercase font-bold text-[#f5a623]"
                    style={{
                        left: `${stream.left}%`,
                        animation: `fall ${stream.duration}s linear infinite`,
                        animationDelay: `${stream.delay}s`,
                        writingMode: 'vertical-rl'
                    }}
                >
                    {stream.text}
                </div>
            ))}
            <style jsx>{`
        @keyframes fall {
          0% { transform: translateY(0); }
          100% { transform: translateY(120vh); }
        }
      `}</style>
        </div>
    );
}
