"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoom } from "@/hooks/useRoom";
import { AGENTS } from "@/lib/agents";
import { Player } from "@/types";
import { updateRoomStatus, updatePlayerState, INITIAL_EFFECTS } from "@/lib/roomUtils";
import { getRandomPrompt } from "@/lib/prompts";
import BunkerBackground from "@/components/BunkerBackground";
import SkeletalButton from "@/components/SkeletalButton";
import LoadingScreen from "@/components/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { saveUserStats, subscribeToUserProfile, UserProfile } from "@/lib/userService";
import { PREMADE_AVATARS } from "@/lib/avatars";
export default function Results() {
    const { roomId } = useParams() as { roomId: string };
    const router = useRouter();
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [playerId, setPlayerId] = useState<string | null>(null);

    useEffect(() => {
        const id = sessionStorage.getItem('typeagents_player_id');
        setPlayerId(id);

        if (user?.uid) {
            const unsubscribe = subscribeToUserProfile(user.uid, (data) => {
                setProfile(data);
            });
            return () => unsubscribe();
        }
    }, [user?.uid]);

    const { room, players, status, loading } = useRoom(roomId);

    const sortedPlayers = [...players].sort((a, b) => {
        if (a.finishedAt && b.finishedAt) return a.finishedAt - b.finishedAt;
        if (a.finishedAt) return -1;
        if (b.finishedAt) return 1;
        return (b.progress || 0) - (a.progress || 0);
    });

    const userPlacement = sortedPlayers.findIndex((p: Player) => p.id === playerId);
    const userPlayer = players.find(p => p.id === playerId);

    // Save stats for authenticated users
    useEffect(() => {
        if (!loading && user && !user.isAnonymous && userPlayer && userPlayer.finishedAt && userPlacement !== -1) {
            saveUserStats(user.uid, {
                wpm: userPlayer.wpm,
                accuracy: userPlayer.accuracy,
                placement: userPlacement + 1,
                roomId,
                finishedAt: userPlayer.finishedAt
            }).catch(console.error);
        }
    }, [loading, user, userPlayer, userPlacement, roomId]);
    const userAgent = userPlayer?.agent ? AGENTS[userPlayer.agent] : null;
    const commentary = userAgent ? (userPlacement === 0 ? userAgent.commentary.win : userAgent.commentary.loss) : null;

    // Redirection logic: If status changes to 'lobby', navigate to lobby
    useEffect(() => {
        if (!loading && status === 'lobby') {
            router.push(`/lobby/${roomId}`);
        }
    }, [status, loading, roomId, router]);

    const handlePlayAgain = async () => {
        if (room?.hostId === playerId) {
            // Reset all players locally before the room status change kicks in
            const resetPromises = players.map(p =>
                updatePlayerState(roomId, p.id, {
                    ready: false,
                    progress: 0,
                    wpm: 0,
                    accuracy: 100,
                    abilityCharge: 0,
                    abilityCooldown: false,
                    finishedAt: null,
                    placement: null,
                    effects: INITIAL_EFFECTS
                })
            );

            await Promise.all(resetPromises);

            // Trigger the global status change which redirects everyone
            await updateRoomStatus(roomId, 'lobby', {
                prompt: getRandomPrompt((room?.promptCategory as any) || 'tech'),
                countdownStartAt: null,
                raceStartAt: null
            });
        }
    };

    const winner = sortedPlayers[0];
    const winnerAgent = winner?.agent ? AGENTS[winner.agent] : null;

    if (loading || !room) {
        return <LoadingScreen />;
    }

    return (
        <main className="min-h-screen flex flex-col items-center bg-[#0d0b09] overflow-y-auto py-20 px-8 relative">
            <BunkerBackground />
            <div className="fixed top-0 left-0 w-full h-1 bg-[#f5a623] shadow-[0_0_20px_#f5a623] z-[100]" />

            {/* Top Quick Actions */}
            <div className="absolute top-8 right-8 flex gap-4 z-50 animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
                <button
                    onClick={() => router.push('/')}
                >
                    <SkeletalButton variant="secondary" className="h-10 px-6 text-[10px]">
                        Return Home
                    </SkeletalButton>
                </button>
                {room?.hostId === playerId ? (
                    <button
                        onClick={handlePlayAgain}
                    >
                        <SkeletalButton className="h-10 px-8 text-[10px]">
                            Play Again
                        </SkeletalButton>
                    </button>
                ) : (
                    <div className="h-10 px-6 flex items-center bg-white/5 border border-white/10 text-[10px] text-white/40 font-black uppercase tracking-widest gap-2">
                        <div className="w-1.5 h-1.5 bg-[#f5a623] rounded-full animate-ping" />
                        Awaiting Host
                    </div>
                )}
            </div>

            <div className="text-center mb-16 animate-in fade-in slide-in-from-top-8 duration-700 relative z-10">
                <h1 className="text-[80px] font-black italic tracking-tighter leading-none mb-2">MISSION_DEBRIEF</h1>
                <p className="text-xs uppercase tracking-[1em] font-bold text-[#f5a623]/40">Authenticated Battle Record</p>
            </div>

            {/* Match MVP Hero Section */}
            {winner && (
                <div className="w-full max-w-5xl mb-12 animate-in fade-in slide-in-from-top-12 duration-1000">
                    <div className="relative group">
                        {/* Skewed Background Panel */}
                        <div className="absolute inset-0 bg-[#f5a623] skew-x-[-6deg] opacity-10 blur-xl group-hover:opacity-20 transition-opacity"
                            style={{ backgroundColor: winnerAgent?.color }} />
                        <div className="relative bg-[#0d0b09]/40 border border-[#f5a623]/20 p-10 flex items-center justify-between skew-x-[-6deg] overflow-hidden backdrop-blur-sm">
                            {/* Inner Decorative Elements */}
                            <div className="absolute inset-0 opacity-[0.02]"
                                style={{ backgroundImage: 'linear-gradient(45deg, white 25%, transparent 25%, transparent 50%, white 50%, white 75%, transparent 75%, transparent)', backgroundSize: '40px 40px' }} />

                            <div className="flex items-center gap-12 skew-x-[6deg]">
                                {/* Rank Tag */}
                                <div className="flex flex-col items-center">
                                    <div className="text-[10px] font-black tracking-[0.4em] text-[#f5a623]/40 mb-2">RANK</div>
                                    <div className="text-8xl font-black italic text-white/90 drop-shadow-[0_0_20px_rgba(245,166,35,0.3)]">#1</div>
                                </div>

                                {/* Divider */}
                                <div className="w-1 h-32 bg-[#f5a623]/10" />

                                {/* Player Info */}
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="bg-[#f5a623] text-black px-3 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse"
                                            style={{ backgroundColor: winnerAgent?.color }}>
                                            DATA_MVP
                                        </span>
                                        <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-[#f5a623]/30">Protocol Accomplished</span>
                                    </div>
                                    <h2 className="text-7xl font-black italic tracking-tighter text-white mb-2 leading-none uppercase">
                                        {winner.id === playerId && profile?.operativeHandle ? profile.operativeHandle : winner.name}
                                    </h2>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-[#0d0b09]">
                                            {winner.id === playerId && profile?.selectedAvatar ? (
                                                <img
                                                    src={PREMADE_AVATARS.find(a => a.id === profile.selectedAvatar)?.url}
                                                    alt="Avatar"
                                                    className="w-full h-full rounded-full scale-125"
                                                />
                                            ) : winner.agent ? (
                                                <div className="w-full h-full flex items-center justify-center font-black text-xs" style={{ color: winnerAgent?.color, backgroundColor: `${winnerAgent?.color}10` }}>
                                                    {winnerAgent?.name[0]}
                                                </div>
                                            ) : null}
                                        </div>
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

            {/* Stats Table / Match Report */}
            <div className="w-full max-w-4xl mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-px flex-1 bg-white/10" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 italic">Squad Combat Report</h3>
                    <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className="bg-white/5 border border-white/10 rounded-sm overflow-hidden shadow-2xl">
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
                                                {p.id === playerId && profile?.operativeHandle ? profile.operativeHandle : p.name} {p.id === playerId && '(You)'}
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

            <div className="flex flex-col items-center gap-6 mt-12 pb-20 animate-in fade-in duration-500 delay-1000 relative z-10">
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push('/')}
                    >
                        <SkeletalButton variant="secondary" className="h-14 px-12">
                            Return Home
                        </SkeletalButton>
                    </button>
                    {room?.hostId === playerId ? (
                        <button
                            onClick={handlePlayAgain}
                        >
                            <SkeletalButton className="h-14 px-12">
                                Initiate Next Sequence
                            </SkeletalButton>
                        </button>
                    ) : (
                        <div className="h-14 px-12 flex items-center bg-white/5 border border-white/10 text-white/40 font-black uppercase tracking-widest gap-3">
                            <div className="w-2 h-2 bg-[#f5a623] rounded-full animate-ping" />
                            Awaiting Sequence Reset
                        </div>
                    )}
                </div>
                <div className="text-[10px] uppercase font-bold text-white/20 tracking-[0.3em] flex items-center gap-4">
                    <span className="w-12 h-px bg-white/5" />
                    Protocol: Terminated
                    <span className="w-12 h-px bg-white/5" />
                </div>
            </div>
        </main>
    );
}
