"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoom } from "@/hooks/useRoom";
import { AGENTS } from "@/lib/agents";
import { Player } from "@/types";
import { updateRoomStatus, updatePlayerState, INITIAL_EFFECTS } from "@/lib/roomUtils";
import { getRandomPrompt } from "@/lib/prompts";

export default function Results() {
    const { roomId } = useParams() as { roomId: string };
    const router = useRouter();

    const [playerId, setPlayerId] = useState<string | null>(null);

    useEffect(() => {
        setPlayerId(sessionStorage.getItem('typeagents_player_id'));
    }, []);

    const { room, players, status, loading } = useRoom(roomId);

    // Redirect if game restarts - ONLY after loading is done
    useEffect(() => {
        if (!loading && status === 'lobby') {
            router.push(`/lobby/${roomId}`);
        }
    }, [status, roomId, router, loading]);

    if (loading || !room || !playerId) return null;

    const sortedPlayers = [...players].sort((a, b) => {
        if (a.finishedAt && b.finishedAt) return a.finishedAt - b.finishedAt;
        if (a.finishedAt) return -1;
        if (b.finishedAt) return 1;
        return (b.progress || 0) - (a.progress || 0);
    });

    const userPlacement = sortedPlayers.findIndex((p: Player) => p.id === playerId);
    const userPlayer = players.find(p => p.id === playerId);
    const userAgent = userPlayer?.agent ? AGENTS[userPlayer.agent] : null;
    const commentary = userAgent ? (userPlacement === 0 ? userAgent.commentary.win : userAgent.commentary.loss) : null;

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
            await updateRoomStatus(roomId, 'lobby', {
                prompt: getRandomPrompt((room.promptCategory as any) || 'tech'),
                countdownStartAt: null,
                raceStartAt: null
            });
        }
    };

    const winner = sortedPlayers[0];
    const winnerAgent = winner?.agent ? AGENTS[winner.agent] : null;

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#0F1923] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#FF4655] shadow-[0_0_20px_#FF4655]" />

            <div className="text-center mb-16 animate-in fade-in slide-in-from-top-8 duration-700">
                <h1 className="text-[80px] font-black italic tracking-tighter leading-none mb-2">MISSION COMPLETE</h1>
                <p className="text-xs uppercase tracking-[1em] font-bold opacity-30">Summary of Battle Record</p>
            </div>

            {/* Match MVP Hero Section */}
            {winner && (
                <div className="w-full max-w-5xl mb-12 animate-in fade-in slide-in-from-top-12 duration-1000">
                    <div className="relative group">
                        {/* Skewed Background Panel */}
                        <div className="absolute inset-0 bg-[#FF4655] skew-x-[-6deg] opacity-10 blur-xl group-hover:opacity-20 transition-opacity"
                            style={{ backgroundColor: winnerAgent?.color }} />
                        <div className="relative bg-white/5 border border-white/10 p-10 flex items-center justify-between skew-x-[-6deg] overflow-hidden">
                            {/* Inner Decorative Elements */}
                            <div className="absolute inset-0 opacity-[0.02]"
                                style={{ backgroundImage: 'linear-gradient(45deg, white 25%, transparent 25%, transparent 50%, white 50%, white 75%, transparent 75%, transparent)', backgroundSize: '40px 40px' }} />

                            <div className="flex items-center gap-12 skew-x-[6deg]">
                                {/* Rank Tag */}
                                <div className="flex flex-col items-center">
                                    <div className="text-[10px] font-black tracking-[0.4em] opacity-30 mb-2">RANK</div>
                                    <div className="text-8xl font-black italic text-white/90 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">#1</div>
                                </div>

                                {/* Divider */}
                                <div className="w-1 h-32 bg-white/10" />

                                {/* Player Info */}
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="bg-[#FF4655] text-black px-3 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse"
                                            style={{ backgroundColor: winnerAgent?.color }}>
                                            MATCH MVP
                                        </span>
                                        <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-white/30">Protocol Accomplished</span>
                                    </div>
                                    <h2 className="text-7xl font-black italic tracking-tighter text-white mb-2 leading-none uppercase">
                                        {winner.name}
                                    </h2>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xl font-bold tracking-[0.2em]" style={{ color: winnerAgent?.color }}>{winnerAgent?.name}</span>
                                        <span className="text-xs uppercase font-bold text-white/20 tracking-widest">// COMBAT REPORT OVERVIEW</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Snapshot */}
                            <div className="flex items-center gap-16 skew-x-[6deg] pr-8">
                                <div className="text-center">
                                    <div className="text-[10px] font-black opacity-30 tracking-widest mb-1">FINAL WPM</div>
                                    <div className="text-5xl font-black italic font-mono text-white tracking-widest">{winner.wpm}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] font-black opacity-30 tracking-widest mb-1">ACCURACY</div>
                                    <div className="text-5xl font-black italic font-mono text-white tracking-widest" style={{ color: winnerAgent?.color }}>{winner.accuracy}%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Table */}
            <div className="w-full max-w-4xl bg-white/5 border border-white/10 rounded-sm overflow-hidden mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
                <div className="grid grid-cols-5 p-4 border-b border-white/10 bg-white/5 text-[10px] uppercase font-bold tracking-widest opacity-40">
                    <div className="col-span-2">Agent / Player</div>
                    <div className="text-center">WPM</div>
                    <div className="text-center">Accuracy</div>
                    <div className="text-center">Status</div>
                </div>
                <div className="divide-y divide-white/5">
                    {sortedPlayers.slice(1).map((p, idx) => {
                        const agent = p.agent ? AGENTS[p.agent] : null;
                        return (
                            <div key={p.id} className="grid grid-cols-5 p-4 items-center group hover:bg-white/[0.02] transition-colors">
                                <div className="col-span-2 flex items-center gap-4">
                                    <div className="text-xs font-mono opacity-20">{(idx + 2).toString().padStart(2, '0')}</div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm text-white/80 group-hover:text-white transition-colors">
                                            {p.name} {p.id === playerId && '(You)'}
                                        </span>
                                        <span className="text-[10px] uppercase opacity-40 font-bold" style={{ color: agent?.color }}>{agent?.name}</span>
                                    </div>
                                </div>
                                <div className="text-center font-mono font-bold text-white/60">{p.wpm} WPM</div>
                                <div className="text-center font-mono text-white/40 group-hover:text-white/60 transition-colors">{p.accuracy}%</div>
                                <div className="text-center">
                                    <span className="text-[10px] font-black uppercase px-2 py-1 rounded-sm bg-white/5 text-white/30 tracking-widest">
                                        Finished
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    {sortedPlayers.length <= 1 && (
                        <div className="p-12 text-center text-[10px] uppercase font-bold tracking-[0.3em] opacity-20">
                            No additional participants detected.
                        </div>
                    )}
                </div>
            </div>

            {/* Agent Commentary / Debrief */}
            {userAgent && commentary && (
                <div className="w-full max-w-4xl mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700">
                    <div className="flex items-start gap-6 p-8 bg-white/5 border-l-4 border-white/10 rounded-r-lg relative overflow-hidden group hover:bg-white/10 transition-all"
                        style={{ borderLeftColor: userAgent.color }}>
                        {/* Decorative Background Icon/Effect */}
                        <div className="absolute -right-4 -bottom-4 text-8xl font-black italic opacity-5 select-none pointer-events-none group-hover:opacity-10 transition-opacity">
                            {userAgent.name}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-[10px] uppercase font-black tracking-[0.4em] opacity-30">Tactical Debrief</span>
                                <div className="h-px flex-1 bg-white/10" />
                                <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: userAgent.color }}>{userAgent.name}</span>
                            </div>
                            <p className="text-2xl font-black italic tracking-tight leading-tight max-w-2xl">
                                "{commentary}"
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500 delay-1000">
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push('/')}
                        className="h-14 px-12 border border-white/20 text-white font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                        Return Home
                    </button>
                    {room.hostId === playerId ? (
                        <button
                            onClick={handlePlayAgain}
                            className="h-14 px-12 bg-white text-black font-black uppercase tracking-widest hover:bg-[#FF4655] hover:text-white transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                        >
                            Play Again
                        </button>
                    ) : (
                        <div className="h-14 px-12 flex items-center bg-white/5 border border-white/10 text-white/40 font-black uppercase tracking-widest gap-3">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping" />
                            Waiting for Host to Reset
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
