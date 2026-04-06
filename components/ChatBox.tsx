import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { AGENTS, AgentType } from '@/lib/agents';

interface ChatBoxProps {
    roomId: string;
    playerId: string;
    playerName: string;
    agentId?: string;
    isEmbedded?: boolean;
}

const ChatBox: React.FC<ChatBoxProps> = ({ roomId, playerId, playerName, agentId }) => {
    const { messages, sendMessage } = useChat(roomId);
    const [text, setText] = useState('');
    const [minimized, setMinimized] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current && !minimized) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, minimized]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        sendMessage(playerId, playerName, agentId || 'none', text);
        setText('');
    };

    return (
        <div className={`fixed bottom-8 right-8 z-[300] transition-all duration-500 ease-in-out flex flex-col pointer-events-auto border border-white/10 rounded-sm bg-black/80 backdrop-blur-xl shadow-2xl overflow-hidden ${minimized ? 'w-48 h-10' : 'w-80 h-[450px]'}`}>
            {/* Tactical Header */}
            <div
                className="h-10 px-4 bg-black/60 border-b border-white/5 flex items-center justify-between cursor-pointer group hover:bg-white/[0.02] transition-colors"
                onClick={() => setMinimized(!minimized)}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${minimized ? 'bg-white/20' : 'bg-[#f5a623] animate-pulse'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] font-mono ${minimized ? 'text-white/40' : 'text-[#f5a623]'}`}>
                        Secure_Comms
                    </span>
                </div>
                <div className="text-white/20 group-hover:text-white/60 transition-colors">
                    {minimized ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    )}
                </div>
            </div>

            {!minimized && (
                <>
                    {/* Message List */}
                    <div
                        ref={scrollRef}
                        className="flex-1 p-4 space-y-3 overflow-y-auto border-b border-white/5 scrollbar-hide custom-scrollbar"
                        style={{ 
                            scrollbarWidth: 'none', 
                            msOverflowStyle: 'none',
                        }}
                    >
                        <style jsx global>{`
                            .custom-scrollbar::-webkit-scrollbar {
                                display: none !important;
                            }
                        `}</style>
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                <span className="text-[10px] font-black uppercase tracking-widest text-center">No active transmissions</span>
                            </div>
                        ) : (
                            messages.map((m) => {
                                const agent = m.agentId && m.agentId !== 'none' ? AGENTS[m.agentId as AgentType] : null;
                                return (
                                    <div key={m.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-1 h-3 rotate-12" style={{ backgroundColor: agent?.color || '#f5a623' }} />
                                            <span
                                                className="text-[10px] font-black italic uppercase tracking-wider"
                                                style={{ color: agent?.color || 'white' }}
                                            >
                                                {m.senderName}
                                            </span>
                                            <div className="h-px flex-1 bg-white/[0.05]" />
                                            <span className="text-[8px] opacity-20 font-mono">
                                                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-[13px] text-white/90 leading-tight break-words pl-3 border-l border-white/10 font-bold tracking-tight italic">
                                            {m.text}
                                        </p>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Input */}
                    <form
                        onSubmit={handleSend}
                        className="p-3 bg-black/80 flex gap-2 relative z-[310] pointer-events-auto"
                    >
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="TRANSMIT_DATA..."
                                className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#f5a623]/80 transition-all uppercase font-mono tracking-widest rounded-sm focus:bg-white/[0.07]"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!text.trim()}
                            className="bg-[#f5a623] hover:bg-white text-black px-4 transition-all disabled:opacity-20 disabled:grayscale flex items-center justify-center rounded-sm shadow-[0_0_20px_rgba(245,166,35,0.1)]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="rotate-45"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    </form>
                </>
            )}
        </div>
    );
};

export default ChatBox;
