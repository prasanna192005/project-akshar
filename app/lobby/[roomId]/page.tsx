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
        <main className="min-h-screen p-8 max-w-6xl mx-auto flex flex-col pt-12">
            <div className="flex justify-between items-start mb-12">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter mb-2">AGENT SELECT</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] uppercase font-bold tracking-[0.4em] opacity-40">Phase: Lobby</span>
                        <div className="h-px w-12 bg-white/10" />
                        <span className="text-[10px] uppercase font-bold tracking-[0.4em] opacity-40">Players: {players.length}/8</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="/lore"
                        className="px-6 py-2 bg-[#FF4655]/10 border border-[#FF4655]/20 hover:bg-[#FF4655] hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em] rounded-sm group flex items-center gap-3 backdrop-blur-sm shadow-[0_0_20px_rgba(255,70,85,0.1)]"
                    >
                        Tactical Archives
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
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
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h2 className="text-xs font-black uppercase tracking-widest opacity-30 mb-6">Party Members</h2>
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
                                        <span className="text-[10px] font-black text-green-500 uppercase tracking-tighter">READY</span>
                                    ) : (
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-tighter">WAITING</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => setReady(!player?.ready)}
                            disabled={!player?.agent}
                            className={`w-full h-16 font-black uppercase tracking-[0.2em] transition-all border-2 
                ${player?.ready
                                    ? 'bg-transparent border-green-500 text-green-500 hover:bg-green-500/10'
                                    : 'bg-white text-black border-white hover:bg-[#FF4655] hover:border-[#FF4655] hover:text-white'}
                ${!player?.agent && 'opacity-50 cursor-not-allowed'}
              `}
                        >
                            {player?.ready ? 'CANCEL READY' : 'LOCK IN'}
                        </button>

                        {isHost && (
                            <button
                                onClick={handleStartGame}
                                className={`w-full h-16 font-black uppercase tracking-[0.2em] transition-all
                  ${allReady ? 'bg-[#FF4655] hover:bg-white hover:text-black shadow-[0_0_30px_rgba(255,70,85,0.4)]' : 'bg-white/5 text-white/40 hover:bg-white/10'}
                `}
                            >
                                {allReady ? 'START MISSION' : 'FORCE START (DEBUG)'}
                            </button>
                        )}
                        {!isHost && (
                            <p className="text-center text-[10px] font-bold opacity-30 uppercase tracking-widest py-4">
                                Waiting for host to begin...
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
        </main>
    );
}
