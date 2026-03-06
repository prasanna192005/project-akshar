import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { AGENTS, AgentType } from '@/lib/agents';

interface ChatBoxProps {
    roomId: string;
    playerId: string;
    playerName: string;
    agentId?: string;
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
        <div className={`fixed bottom-6 right-6 z-[100] transition-all duration-300 ease-in-out flex flex-col pointer-events-auto ${minimized ? 'w-48' : 'w-80 h-[450px]'}`}>
            {/* Header */}
            <div
                className="bg-[#0d0b09] border border-[#f5a623]/20 p-4 flex items-center justify-between cursor-pointer rounded-t-lg shadow-2xl backdrop-blur-md"
                onClick={() => setMinimized(!minimized)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#f5a623] animate-pulse" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#f5a623]/80">Secure_Comms</span>
                </div>
                <div className="text-white/40 hover:text-white">
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
                        className="flex-1 bg-[#0d0b09]/90 backdrop-blur-xl border-x border-[#f5a623]/10 p-4 space-y-4 overflow-y-auto scrollbar-hide"
                    >
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
                                            <span
                                                className="text-[10px] font-black uppercase tracking-wider"
                                                style={{ color: agent?.color || 'white' }}
                                            >
                                                {m.senderName}
                                                {agent && <span className="opacity-40 font-bold ml-1">({agent.name.toUpperCase()})</span>}
                                            </span>
                                            <span className="text-[8px] opacity-20 font-mono">
                                                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-white/80 leading-snug break-words pl-1 border-l border-white/5">
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
                        className="bg-[#0d0b09] border border-[#f5a623]/20 p-3 rounded-b-lg shadow-2xl flex gap-2"
                    >
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="TRANSMIT MESSAGE..."
                            className="flex-1 bg-white/5 border border-white/10 px-3 py-2 text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-[#f5a623]/50 transition-colors uppercase font-mono"
                        />
                        <button
                            type="submit"
                            disabled={!text.trim()}
                            className="bg-[#f5a623] hover:bg-white text-black p-2 transition-all disabled:opacity-30 disabled:hover:bg-[#f5a623] disabled:hover:text-black"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    </form>
                </>
            )}
        </div>
    );
};

export default ChatBox;
