"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useRoom } from "@/hooks/useRoom";
import { usePlayer } from "@/hooks/usePlayer";
import { AGENTS, AgentType } from "@/lib/agents";
import { updateRoomStatus } from "@/lib/roomUtils";
import AgentCard from "@/components/AgentCard";
import RoomCodeDisplay from "@/components/RoomCodeDisplay";
import LoadingScreen from "@/components/LoadingScreen";
import ChatBox from "@/components/ChatBox";
import BunkerBackground from "@/components/BunkerBackground";
import SkeletalButton from "@/components/SkeletalButton";

import { ensureAuth } from "@/lib/firebase";

export default function Lobby() {
    const { roomId } = useParams() as { roomId: string };
    const router = useRouter();

    const [playerId, setPlayerId] = useState<string | null>(null);
    const [playerName, setPlayerName] = useState<string | null>(null);

    useEffect(() => {
        ensureAuth().catch(console.error);
        setPlayerId(sessionStorage.getItem('typeagents_player_id'));
        setPlayerName(localStorage.getItem('typeagents_player_name'));
    }, []);

    const { room, players, status, loading } = useRoom(roomId);
    const { player, selectAgent, setReady } = usePlayer(roomId, playerId || "");

    // Redirect if game starts
    useEffect(() => {
        if (!loading && (status === 'countdown' || status === 'racing')) {
            router.push(`/game/${roomId}`);
        }
    }, [status, roomId, router, loading]);

    if (loading || !room || !playerId) {
        return <LoadingScreen />;
    }

    const allReady = players.length >= 2 && players.every(p => p.ready && p.agent);
    const isHost = room.hostId === playerId;

    const handleStartGame = async () => {
        if (allReady && isHost) {
            await updateRoomStatus(roomId, 'countdown', {
                countdownStartAt: Date.now(),
                raceStartAt: Date.now() + 3000
            });
        }
    };

    const selectedAgentIds = players.map(p => p.agent).filter(Boolean) as AgentType[];

    return (
        <main className="min-h-screen bg-[#0d0b09] text-white p-8 relative overflow-hidden">
            <BunkerBackground />

            <div className="max-w-6xl mx-auto relative z-10 pt-12">
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tighter mb-2">AGENT_SELECT</h1>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-[#f5a623]">Phase: Formation</span>
                            <div className="h-px w-12 bg-white/10" />
                            <span className="text-[10px] uppercase font-bold tracking-[0.4em] opacity-40">Operatives: {players.length}/8</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/lore"
                        >
                            <SkeletalButton variant="secondary" className="px-6 h-10 border-[#f5a623]/20 flex items-center gap-3">
                                <span className="text-[10px]">Tactical Archives</span>
                                <div className="w-1.5 h-1.5 bg-[#f5a623] rounded-full animate-ping" />
                            </SkeletalButton>
                        </Link>
                        <RoomCodeDisplay code={roomId} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Agent Grid */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {(Object.values(AGENTS)).map((agent) => (
                            <AgentCard
                                key={agent.id}
                                agent={agent}
                                selected={player?.agent === agent.id}
                                disabled={selectedAgentIds.includes(agent.id) && player?.agent !== agent.id}
                                onSelect={selectAgent}
                            />
                        ))}
                    </div>

                    {/* Sidebar / Ready Up */}
                    <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f5a623]/5 blur-2xl rounded-full -z-10" />
                            <h2 className="text-xs font-black uppercase tracking-widest text-[#f5a623]/40 mb-6">Formation Members</h2>
                            <div className="space-y-4">
                                {players.map((p, index) => (
                                    <div key={p.id || `player-${index}`} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-1.5 h-1.5 rounded-full"
                                                style={{ backgroundColor: p.agent ? AGENTS[p.agent].color : '#333' }}
                                            />
                                            <span className={`text-sm font-bold ${p.id === playerId ? 'text-white' : 'text-white/60'}`}>
                                                {p.name}
                                            </span>
                                        </div>
                                        {p.ready ? (
                                            <span className="text-[10px] font-black text-[#f5a623] uppercase tracking-tighter shadow-[#f5a623]/20 shadow-sm px-2 py-0.5 rounded border border-[#f5a623]/20 bg-[#f5a623]/10">LOCKED_IN</span>
                                        ) : (
                                            <span className="text-[10px] font-black text-white/20 uppercase tracking-tighter">WAITING</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <SkeletalButton
                                onClick={() => setReady(!player?.ready)}
                                disabled={!player?.agent}
                                variant={player?.ready ? "secondary" : "primary"}
                                className="w-full"
                            >
                                {player?.ready ? 'ABORT_LOCK' : 'LOCK_SIGNAL'}
                            </SkeletalButton>

                            {isHost && (
                                <SkeletalButton
                                    onClick={handleStartGame}
                                    disabled={!allReady}
                                    className="w-full"
                                >
                                    {allReady ? 'INITIALIZE_GRID' : 'AWAITING_SYNC'}
                                </SkeletalButton>
                            )}
                            {!isHost && (
                                <p className="text-center text-[10px] font-bold text-[#f5a623]/30 uppercase tracking-widest py-4 italic">
                                    Awaiting host initialization...
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <ChatBox
                    roomId={roomId}
                    playerId={playerId}
                    playerName={playerName || 'Agent'}
                    agentId={player?.agent || undefined}
                />
            </div>
        </main>
    );
}
