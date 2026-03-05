"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, update, get } from "firebase/database";
import { AGENTS, AgentType } from "@/lib/agents";
import { updateRoomStatus, updatePlayerState, INITIAL_EFFECTS } from "@/lib/roomUtils";
import { Room, Player, RoomStatus } from "@/types";

export default function DebugCenter() {
    const [roomId, setRoomId] = useState("");
    const [room, setRoom] = useState<Room | null>(null);
    const roomRef = useRef<Room | null>(null);
    const [botSpeed, setBotSpeed] = useState(60); // WPM

    // Attach to room
    useEffect(() => {
        if (!roomId) return;
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
    }, [roomId]);

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
    }, [simulateBotTyping, botSpeed]);

    return (
        <div className="min-h-screen bg-[#0F1923] text-white p-8 font-mono">
            <div className="max-w-4xl mx-auto border border-white/10 rounded-xl overflow-hidden shadow-2xl bg-black/40 backdrop-blur-md">
                {/* Header */}
                <div className="bg-[#FF4655] p-4 flex justify-between items-center">
                    <h1 className="text-sm font-black tracking-[0.3em] uppercase">Protocol Debug Center v1.1</h1>
                    <div className="flex gap-2 text-[10px] font-bold">
                        <span className="opacity-50">STATUS:</span>
                        <span className="animate-pulse">CONNECTED</span>
                    </div>
                </div>

                <div className="p-8 space-y-12">
                    {/* Room Connection */}
                    <div className="space-y-4">
                        <label className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40">Room Interface</label>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                                placeholder="ENTER ROOM ID"
                                className="flex-1 bg-white/5 border border-white/10 rounded p-4 text-xs font-bold tracking-widest focus:border-[#FF4655] outline-none transition-colors"
                            />
                        </div>
                        {room ? (
                            <div className="flex gap-4 justify-between items-center bg-white/5 p-4 rounded border border-white/5">
                                <div className="flex gap-6">
                                    <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Status: <span className="text-[#FF4655]">{room.status}</span></span>
                                    <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Players: {Object.keys(room.players || {}).length}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => updateRoomStatus(roomId, 'lobby')}
                                        className="text-[9px] uppercase font-black px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded"
                                    >Back to Lobby</button>
                                    <button
                                        onClick={() => updateRoomStatus(roomId, 'finished')}
                                        className="text-[9px] uppercase font-black px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-yellow-500"
                                    >Force Finished</button>
                                    <button
                                        onClick={() => updateRoomStatus(roomId, 'racing')}
                                        className="text-[9px] uppercase font-black px-3 py-1.5 bg-[#FF4655] hover:bg-white hover:text-black rounded"
                                    >Force Race</button>
                                </div>
                            </div>
                        ) : roomId ? (
                            <div className="text-center py-4 bg-red-500/10 border border-red-500/20 rounded text-[10px] font-bold text-red-400 uppercase tracking-widest">
                                Sector Not Found
                            </div>
                        ) : null}
                    </div>

                    {/* Squad Simulation */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <label className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40">Squad Simulation</label>
                            <div className="flex gap-3">
                                <button
                                    onClick={spawnBot}
                                    disabled={!room}
                                    className="text-[10px] uppercase font-black px-4 py-2 border border-white/20 hover:border-[#FF4655] hover:text-[#FF4655] disabled:opacity-20 transition-all rounded"
                                >+ Add Target Bot</button>
                                <button
                                    onClick={removeBots}
                                    disabled={!room}
                                    className="text-[10px] uppercase font-black px-4 py-2 border border-white/20 hover:border-white/40 disabled:opacity-20 transition-all rounded"
                                >Clear All Bots</button>
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-lg border border-white/10 p-6 space-y-8">
                            {/* Bot Config */}
                            <div className="flex items-center justify-between pb-6 border-b border-white/5">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Bot Typing Intensity</span>
                                    <span className="text-[9px] opacity-40 font-bold uppercase">Applied to all active bots</span>
                                </div>
                                <div className="flex items-center gap-6">
                                    <input
                                        type="range" min="10" max="250" value={botSpeed}
                                        onChange={(e) => setBotSpeed(parseInt(e.target.value))}
                                        className="w-48 accent-[#FF4655]"
                                    />
                                    <span className="text-2xl font-black italic tracking-tighter w-20 text-[#FF4655]">{botSpeed} <span className="text-[10px] not-italic opacity-40 text-white">WPM</span></span>
                                </div>
                            </div>

                            {/* Player/Bot List */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {room && Object.values(room.players || {}).map(p => (
                                    <div key={p.id} className={`p-4 rounded border transition-all ${p.id.startsWith('bot_') ? 'bg-black/40 border-white/5' : 'bg-[#FF4655]/5 border-[#FF4655]/30'}`}>
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex flex-col">
                                                <span className={`text-[10px] font-black tracking-widest ${p.id.startsWith('bot_') ? 'text-white/60' : 'text-[#FF4655]'}`}>
                                                    {p.name} {p.id.startsWith('bot_') ? '(BOT)' : '(HUMAN)'}
                                                </span>
                                                <span className="text-[8px] opacity-40 font-bold uppercase">{p.agent || 'NO AGENT'}</span>
                                            </div>
                                            <button
                                                onClick={() => forceComplete(p.id)}
                                                className="text-[9px] uppercase font-black px-2 py-1 bg-white/5 hover:bg-white/20 rounded border border-white/10"
                                            >Finish Now</button>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tighter">
                                                <span>Progress</span>
                                                <span>{p.progress}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${p.finishedAt ? 'bg-green-500' : 'bg-white/40'}`}
                                                    style={{ width: `${p.progress}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between items-center text-[8px] font-bold opacity-40">
                                                <span>{p.wpm} WPM</span>
                                                <span>{p.finishedAt ? 'MISSION SUCCESS' : 'IN PURSUIT'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {room && Object.keys(room.players || {}).length === 0 && (
                                    <div className="col-span-2 py-8 text-center text-[10px] uppercase font-bold tracking-[0.3em] opacity-20">No Signatures Detected</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Operational Tips */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4">Scenario Verification</h3>
                            <ul className="text-[9px] space-y-2 opacity-60 font-bold uppercase leading-relaxed">
                                <li>• Finisher Logic: Finish yourself, then use "Finish Now" on a bot to trigger results.</li>
                                <li>• High Speed Test: Set bots to 200 WPM to test leaderboard sorting.</li>
                                <li>• Rematch Test: After result screen, force status to "Lobby" to reset all.</li>
                            </ul>
                        </div>
                        <div className="p-6 bg-[#FF4655]/5 border border-[#FF4655]/20 rounded-lg">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF4655] mb-4">Caution</h3>
                            <ul className="text-[9px] space-y-2 opacity-60 font-bold uppercase leading-relaxed">
                                <li>• Don't use Force Race if players are still in lobby without agents.</li>
                                <li>• Clear bots before starting a real production match.</li>
                                <li>• Browser may throttle bot typing if this tab is in background.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
