"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, update, get } from "firebase/database";
import { AGENTS, AgentType } from "@/lib/agents";
import { updateRoomStatus, updatePlayerState, INITIAL_EFFECTS } from "@/lib/roomUtils";
import { Room, Player, RoomStatus } from "@/types";
import BunkerBackground from "@/components/BunkerBackground";
import SkeletalButton from "@/components/SkeletalButton";

export default function DebugCenter() {
    const [roomId, setRoomId] = useState("");
    const [room, setRoom] = useState<Room | null>(null);
    const roomRef = useRef<Room | null>(null);
    const [botSpeed, setBotSpeed] = useState(60); // WPM
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [accessInput, setAccessInput] = useState("");
    const [authError, setAuthError] = useState(false);

    // Initial Auth Check
    useEffect(() => {
        const granted = localStorage.getItem('akshar_debug_access') === 'true';
        if (granted) setIsAuthorized(true);
    }, []);

    // Attach to room
    useEffect(() => {
        if (!roomId || !isAuthorized) return;
        const rRef = ref(db, `rooms/${roomId}`);
        const unsubscribe = onValue(rRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setRoom(data);
                roomRef.current = data;
            } else {
                setRoom(null);
                roomRef.current = null;
            }
        });
        return () => unsubscribe();
    }, [roomId, isAuthorized]);

    const handleAuthenticate = () => {
        const masterKey = process.env.NEXT_PUBLIC_DEBUG_ACCESS_KEY;
        if (accessInput === masterKey) {
            setIsAuthorized(true);
            localStorage.setItem('akshar_debug_access', 'true');
            setAuthError(false);
        } else {
            setAuthError(true);
            setTimeout(() => setAuthError(false), 2000);
        }
    };


    const spawnBot = async () => {
        if (!roomId) return;
        const botId = 'bot_' + Math.random().toString(36).substring(7);
        const agentIds = Object.keys(AGENTS) as AgentType[];
        const randomAgent = agentIds[Math.floor(Math.random() * agentIds.length)];

        await updatePlayerState(roomId, botId, {
            id: botId,
            name: "BOT_" + botId.substring(4, 8).toUpperCase(),
            agent: randomAgent,
            ready: true,
            progress: 0,
            wpm: 0,
            accuracy: 100,
            abilityCharge: 0,
            abilityCooldown: false,
            effects: INITIAL_EFFECTS,
            finishedAt: null
        } as any);
    };

    const removeBots = async () => {
        if (!room) return;
        const players = room.players || {};
        const updates: any = {};
        Object.keys(players).forEach(id => {
            if (id.startsWith('bot_')) {
                updates[`rooms/${roomId}/players/${id}`] = null;
            }
        });
        await update(ref(db), updates);
    };

    const forceComplete = async (targetId: string) => {
        if (!roomId) return;
        await updatePlayerState(roomId, targetId, {
            progress: 100,
            finishedAt: Date.now(),
            wpm: 150,
            accuracy: 100
        } as any);
    };

    const simulateBotTyping = useCallback(async (botId: string, speedWPM: number) => {
        const currentRoom = roomRef.current;
        if (!currentRoom || !currentRoom.prompt || currentRoom.status !== 'racing') return;

        const players = currentRoom.players || {};
        const bot = players[botId];
        if (!bot || bot.finishedAt) return;

        const totalChars = currentRoom.prompt.length;
        const charsPerTick = (speedWPM * 5) / 60; // Tick is roughly 1s here

        const currentProgressChars = (bot.progress / 100) * totalChars;
        const newProgressChars = Math.min(totalChars, currentProgressChars + charsPerTick);
        const newProgress = Math.round((newProgressChars / totalChars) * 100);

        const updates: any = {
            progress: newProgress,
            wpm: speedWPM,
        };

        if (newProgress >= 100) {
            updates.finishedAt = Date.now();
            updates.progress = 100;
        }

        await updatePlayerState(roomId, botId, updates);
    }, [roomId]);

    // Bot Auto-Typing Loop - Uses ref to avoid frequent resets
    useEffect(() => {
        const interval = setInterval(() => {
            const currentRoom = roomRef.current;
            if (currentRoom?.status === 'racing') {
                const players = currentRoom.players || {};
                const bots = Object.values(players).filter(p => p.id.startsWith('bot_') && !p.finishedAt);
                bots.forEach(bot => simulateBotTyping(bot.id, botSpeed));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [simulateBotTyping, botSpeed, isAuthorized]);

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-[#0d0b09] text-white flex items-center justify-center p-8 font-mono relative overflow-hidden">
                <BunkerBackground />
                <div className="relative z-10 w-full max-w-md bg-black/60 backdrop-blur-xl border border-red-500/20 p-8 space-y-8 rounded-lg shadow-[0_0_100px_rgba(255,0,0,0.1)]">
                    <div className="text-center space-y-2">
                        <div className="text-red-500 text-[10px] font-black tracking-[0.5em] uppercase flex items-center justify-center gap-2">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                            </svg>
                            Restricted Sector
                        </div>
                        <h1 className="text-2xl font-black italic tracking-tighter uppercase text-white/90">TERMINAL_LOCKED</h1>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                autoFocus
                                type="password"
                                value={accessInput}
                                onChange={(e) => setAccessInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAuthenticate()}
                                placeholder="ENTER_ACCESS_CODE"
                                className={`w-full bg-white/5 border ${authError ? 'border-red-500 animate-shake' : 'border-white/10'} rounded p-4 text-center text-xl font-bold tracking-[0.3em] outline-none focus:border-[#f5a623] transition-colors`}
                            />
                            {authError && (
                                <div className="absolute -bottom-6 left-0 right-0 text-center text-[8px] font-bold text-red-500 uppercase tracking-widest">
                                    Invalid Protocol Key // Access Denied
                                </div>
                            )}
                        </div>
                        <SkeletalButton
                            onClick={handleAuthenticate}
                            className="w-full py-4 h-auto text-xs uppercase tracking-[0.3em]"
                        >
                            Establish Link
                        </SkeletalButton>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex justify-between items-center text-[8px] font-bold text-white/20 uppercase tracking-widest">
                        <span>Cleared Operatives Only</span>
                        <span>UID_LOGGED</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d0b09] text-white p-8 font-mono relative overflow-hidden">
            <BunkerBackground />

            <div className="max-w-4xl mx-auto border border-[#f5a623]/20 rounded-xl overflow-hidden shadow-2xl bg-black/40 backdrop-blur-md relative z-10">
                {/* Header */}
                <div className="bg-[#f5a623] p-4 flex justify-between items-center text-black">
                    <h1 className="text-sm font-black tracking-[0.3em] uppercase">DEBUG_CENTER // v1.2</h1>
                    <div className="flex gap-2 text-[10px] font-bold">
                        <span className="opacity-50 text-black/60">SYSTEM_AUTH:</span>
                        <span className="animate-pulse">CONNECTED</span>
                    </div>
                </div>

                <div className="p-8 space-y-12">
                    {/* Room Connection */}
                    <div className="space-y-4">
                        <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#f5a623]/60">Room Interface</label>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                                placeholder="ENTER_ROOM_ID"
                                className="flex-1 bg-white/5 border border-white/10 rounded p-4 text-xs font-bold tracking-widest focus:border-[#f5a623] outline-none transition-colors"
                            />
                        </div>
                        {room ? (
                            <div className="flex gap-4 justify-between items-center bg-white/5 p-4 rounded border border-[#f5a623]/10">
                                <div className="flex gap-6">
                                    <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Status: <span className="text-[#f5a623]">{room.status}</span></span>
                                    <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Nodes: {Object.keys(room.players || {}).length}</span>
                                </div>
                                <div className="flex gap-2">
                                    <SkeletalButton
                                        variant="secondary"
                                        onClick={() => updateRoomStatus(roomId, 'lobby')}
                                        className="h-8 px-3 text-[9px]"
                                    >BACK_TO_LOBBY</SkeletalButton>
                                    <SkeletalButton
                                        variant="secondary"
                                        onClick={() => updateRoomStatus(roomId, 'finished')}
                                        className="h-8 px-3 text-[9px] text-[#f5a623]"
                                    >FORCE_FINISH</SkeletalButton>
                                    <SkeletalButton
                                        onClick={() => updateRoomStatus(roomId, 'racing')}
                                        className="h-8 px-3 text-[9px]"
                                    >INITIALIZE_RACE</SkeletalButton>
                                </div>
                            </div>
                        ) : roomId ? (
                            <div className="text-center py-4 bg-[#f5a623]/5 border border-[#f5a623]/20 rounded text-[10px] font-bold text-[#f5a623] uppercase tracking-widest italic">
                                Sector Not Located
                            </div>
                        ) : null}
                    </div>

                    {/* Squad Simulation */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#f5a623]/60">Node Simulation</label>
                            <div className="flex gap-3">
                                <SkeletalButton
                                    onClick={spawnBot}
                                    disabled={!room}
                                    className="h-10 px-4 text-[10px]"
                                >+ ADD_BOT_NODE</SkeletalButton>
                                <SkeletalButton
                                    variant="secondary"
                                    onClick={removeBots}
                                    disabled={!room}
                                    className="h-10 px-4 text-[10px]"
                                >PURGE_BOTS</SkeletalButton>
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-lg border border-white/10 p-6 space-y-8">
                            {/* Bot Config */}
                            <div className="flex items-center justify-between pb-6 border-b border-white/5">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Signal Intensity</span>
                                    <span className="text-[9px] opacity-40 font-bold uppercase italic">Global bot WPM override</span>
                                </div>
                                <div className="flex items-center gap-6">
                                    <input
                                        type="range" min="10" max="250" value={botSpeed}
                                        onChange={(e) => setBotSpeed(parseInt(e.target.value))}
                                        className="w-48 accent-[#f5a623]"
                                    />
                                    <span className="text-2xl font-black italic tracking-tighter w-20 text-[#f5a623]">{botSpeed} <span className="text-[10px] not-italic opacity-40 text-white">WPM</span></span>
                                </div>
                            </div>

                            {/* Player/Bot List */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {room && Object.values(room.players || {}).map(p => (
                                    <div key={p.id} className={`p-4 rounded border transition-all ${p.id.startsWith('bot_') ? 'bg-black/40 border-white/5' : 'bg-[#f5a623]/5 border-[#f5a623]/30'}`}>
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex flex-col">
                                                <span className={`text-[10px] font-black tracking-widest ${p.id.startsWith('bot_') ? 'text-white/60' : 'text-[#f5a623]'}`}>
                                                    {p.name} {p.id.startsWith('bot_') ? '(BOT)' : '(SIGNAL)'}
                                                </span>
                                                <span className="text-[8px] opacity-40 font-bold uppercase">{p.agent ? AGENTS[p.agent as AgentType].name : 'NO_AGENT'}</span>
                                            </div>
                                            <button
                                                onClick={() => forceComplete(p.id)}
                                                className="text-[9px] uppercase font-black px-2 py-1 bg-white/5 hover:bg-[#f5a623]/20 rounded border border-white/10 transition-colors"
                                            >Finish Node</button>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tighter">
                                                <span>Data Trace</span>
                                                <span>{p.progress}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${p.finishedAt ? 'bg-[#f5a623]' : 'bg-white/40'}`}
                                                    style={{ width: `${p.progress}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between items-center text-[8px] font-bold opacity-40 italic">
                                                <span>{p.wpm} WPM</span>
                                                <span>{p.finishedAt ? 'EXTRACTION_COMPLETE' : 'TRACE_ACTIVE'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {room && Object.keys(room.players || {}).length === 0 && (
                                    <div className="col-span-2 py-8 text-center text-[10px] uppercase font-bold tracking-[0.3em] opacity-20 italic">No Node Signatures Detected</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Operational Tips */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 bg-[#f5a623]/5 border border-[#f5a623]/20 rounded-lg">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f5a623]/80 mb-4">Verification Protocols</h3>
                            <ul className="text-[9px] space-y-2 opacity-60 font-bold uppercase leading-relaxed italic">
                                <li>• Finisher Logic: Finish yourself, then use "Finish Node" on a bot.</li>
                                <li>• Intensity Test: High WPM checks leaderboard sorting/sync.</li>
                                <li>• Reset Protocol: Force lobby status to re-initialize sectors.</li>
                            </ul>
                        </div>
                        <div className="p-6 bg-white/[0.02] border border-white/10 rounded-lg">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">Terminal Caution</h3>
                            <ul className="text-[9px] space-y-2 opacity-60 font-bold uppercase leading-relaxed">
                                <li>• Sector failures may occur if nodes lack operative profiles.</li>
                                <li>• Purge simulated nodes before high-stakes operations.</li>
                                <li>• Signal bandwidth may drop if terminal is backgrounded.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
