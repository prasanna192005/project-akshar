import React, { useState } from 'react';

interface RoomCodeDisplayProps {
    code: string;
}

const RoomCodeDisplay: React.FC<RoomCodeDisplayProps> = ({ code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
            <span className="text-xs uppercase tracking-widest opacity-50 font-bold">Room Code</span>
            <span className="text-xl font-black font-mono tracking-tighter text-white">{code}</span>
            <button
                onClick={handleCopy}
                className={`ml-2 p-1.5 rounded-full transition-colors ${copied ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}
            >
                {copied ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                )}
            </button>
        </div>
    );
};

export default RoomCodeDisplay;
