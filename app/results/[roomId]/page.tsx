"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoom } from "@/hooks/useRoom";
import { AGENTS } from "@/lib/agents";
import { updateRoomStatus, updatePlayerState, INITIAL_EFFECTS } from "@/lib/roomUtils";

export default function Results() {
    const { roomId } = useParams() as { roomId: string };
    const router = useRouter();

    const [playerId, setPlayerId] = useState<string | null>(null);

    useEffect(() => {
        setPlayerId(localStorage.getItem('typeagents_player_id'));
    }, []);

    const { room, players, status } = useRoom(roomId);

    // Redirect if game restarts
    useEffect(() => {
        if (status === 'lobby') {
            router.push(`/lobby/${roomId}`);
        }
    }, [status, roomId, router]);

    if (!room || !playerId) return null;

    const sortedPlayers = [...players].sort((a, b) => {
        if (a.finishedAt && b.finishedAt) return a.finishedAt - b.finishedAt;
        if (a.finishedAt) return -1;
        if (b.finishedAt) return 1;
        return b.progress - a.progress;
    });

    const handlePlayAgain = async () => {
        if (room.hostId === playerId) {
            // Reset all players
            for (const p of players) {
                await updatePlayerState(roomId, p.id, {
                    ready: false,
                    progress: 0,
                    wpm: 0,
                    accuracy: 100,
                    abilityCharge: 0,
                    finishedAt: null,
                    placement: null,
                    effects: INITIAL_EFFECTS
                });
            }
            await updateRoomStatus(roomId, 'lobby');
        }
    };

    const podiumNodes = [
        { rank: 2, player: sortedPlayers[1], height: 'h-48', label: '2ND' },
        { rank: 1, player: sortedPlayers[0], height: 'h-64', label: '1ST' },
        { rank: 3, player: sortedPlayers[2], height: 'h-32', label: '3RD' },
    ];

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#0F1923] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#FF4655] shadow-[0_0_20px_#FF4655]" />

            <div className="text-center mb-16 animate-in fade-in slide-in-from-top-8 duration-700">
                <h1 className="text-[80px] font-black italic tracking-tighter leading-none mb-2">MISSION COMPLETE</h1>
                <p className="text-xs uppercase tracking-[1em] font-bold opacity-30">Summary of Battle Record</p>
            </div>

            {/* Podium */}
            <div className="flex items-end gap-4 mb-20 animate-in fade-in zoom-in duration-1000 delay-300">
                {podiumNodes.map((node) => (
                    node.player && (
                        <div key={node.rank} className="flex flex-col items-center group">
                            <div className="mb-4 text-center">
                                <div
                                    className="text-sm font-black italic mb-1"
                                    style={{ color: node.player.agent ? AGENTS[node.player.agent].color : 'white' }}
                                >
                                    {node.player.name}
                                </div>
                                <div className="text-[10px] font-mono opacity-40">{node.player.wpm} WPM</div>
                            </div>
                            <div
                                className={`w-32 ${node.height} bg-white/5 border-t-4 transition-all duration-500 group-hover:bg-white/10 flex flex-col items-center justify-end pb-4`}
                                style={{ borderTopColor: node.player.agent ? AGENTS[node.player.agent].color : 'white' }}
                            >
                                <span className="text-4xl font-black italic opacity-20">{node.label}</span>
                            </div>
                        </div>
                    )
                ))}
            </div>

            {/* Stats Table */}
            <div className="w-full max-w-4xl bg-white/5 border border-white/10 rounded-sm overflow-hidden mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
                <div className="grid grid-cols-5 p-4 border-b border-white/10 bg-white/5 text-[10px] uppercase font-bold tracking-widest opacity-40">
                    <div className="col-span-2">Agent / Player</div>
                    <div className="text-center">WPM</div>
                    <div className="text-center">Accuracy</div>
                    <div className="text-center">Status</div>
                </div>
                <div className="divide-y divide-white/5">
                    {sortedPlayers.map((p, idx) => {
                        const agent = p.agent ? AGENTS[p.agent] : null;
                        return (
                            <div key={p.id} className="grid grid-cols-5 p-4 items-center">
                                <div className="col-span-2 flex items-center gap-4">
                                    <div className="text-xs font-mono opacity-20">{(idx + 1).toString().padStart(2, '0')}</div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">{p.name} {p.id === playerId && '(You)'}</span>
                                        <span className="text-[10px] uppercase opacity-40" style={{ color: agent?.color }}>{agent?.name}</span>
                                    </div>
                                </div>
                                <div className="text-center font-mono font-bold">{p.wpm}</div>
                                <div className="text-center font-mono text-white/60">{p.accuracy}%</div>
                                <div className="text-center">
                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-sm ${idx === 0 ? 'bg-[#FF4655] text-black' : 'bg-white/10 text-white/40'}`}>
                                        {idx === 0 ? 'Winner' : 'Finished'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 animate-in fade-in duration-500 delay-1000">
                <button
                    onClick={() => router.push('/')}
                    className="h-14 px-12 border border-white/20 text-white font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                    Return Home
                </button>
                {room.hostId === playerId && (
                    <button
                        onClick={handlePlayAgain}
                        className="h-14 px-12 bg-white text-black font-black uppercase tracking-widest hover:bg-[#FF4655] hover:text-white transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                    >
                        Play Again
                    </button>
                )}
            </div>
        </main>
    );
}
