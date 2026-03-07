import React, { useState } from 'react';

interface RoomCodeDisplayProps {
    code: string;
}

const RoomCodeDisplay: React.FC<RoomCodeDisplayProps> = ({ code }) => {
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(code);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const handleShare = () => {
        const joinLink = `${window.location.origin}/lobby/${code}`;
        const shareText = `Join the battle! Join my AKSHAR lobby: ${joinLink}`;
        navigator.clipboard.writeText(shareText);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                <span className="text-xs uppercase tracking-widest opacity-50 font-bold">Room Code</span>
                <span className="text-xl font-black font-mono tracking-tighter text-white">{code}</span>
                <button
                    onClick={handleCopyCode}
                    title="Copy Room Code"
                    className={`ml-2 p-1.5 rounded-full transition-colors ${copiedCode ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}
                >
                    {copiedCode ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    )}
                </button>
            </div>

            <button
                onClick={handleShare}
                title="Share Lobby Link"
                className={`flex items-center gap-2 px-6 h-[42px] rounded-full font-black uppercase tracking-widest text-[10px] transition-all border
                    ${copiedLink ? 'bg-green-500 border-green-500 text-black' : 'bg-[#f5a623] border-[#f5a623] text-black hover:bg-[#0d0b09] hover:text-[#f5a623] hover:border-[#f5a623] shadow-[0_0_20px_rgba(245,166,35,0.2)]'}
                `}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                {copiedLink ? 'LINK COPIED' : 'RECRUIT SQUAD'}
            </button>
        </div>
    );
};

export default RoomCodeDisplay;
