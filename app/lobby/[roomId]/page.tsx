"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import { useRoom } from "@/hooks/useRoom";
import { usePlayer } from "@/hooks/usePlayer";
import { AGENTS, AgentType } from "@/lib/agents";
import { AGENT_LORE } from "@/lib/lore";
import { updateRoomStatus, leaveRoom } from "@/lib/roomUtils";
import RoomCodeDisplay from "@/components/RoomCodeDisplay";
import LoadingScreen from "@/components/LoadingScreen";
import ChatBox from "@/components/ChatBox";
import BunkerBackground from "@/components/BunkerBackground";
import SkeletalButton from "@/components/SkeletalButton";
import { useAuth } from "@/hooks/useAuth";

export default function Lobby() {
    const { roomId } = useParams() as { roomId: string };
    const router = useRouter();

    const { user } = useAuth();
    const [playerId, setPlayerId] = useState<string | null>(null);
    const [playerName, setPlayerName] = useState<string | null>(null);
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        let storedId = sessionStorage.getItem('typeagents_player_id');
        const storedName = localStorage.getItem('typeagents_player_name');

        if (!storedName) {
            setIsRedirecting(true);
            router.push(`/?join=${roomId}`);
            return;
        }

        if (!storedId) {
            const newId = uuidv4();
            sessionStorage.setItem('typeagents_player_id', newId);
            storedId = newId;
        }

        setPlayerId(storedId);
        setPlayerName(storedName);
    }, [roomId, router]);

    const { room, players, status, loading } = useRoom(roomId);
    const { player, selectAgent, setReady } = usePlayer(roomId, playerId || "");

    // Redirect if game starts
    useEffect(() => {
        if (!loading && (status === 'countdown' || status === 'racing')) {
            router.push(`/game/${roomId}`);
        }
    }, [status, roomId, router, loading]);

    if (isRedirecting || !playerId) return null;

    if (loading || !room) {
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

    const handleLeaveLobby = async () => {
        if (!playerId) return;
        await leaveRoom(roomId, playerId);
        router.push('/');
    };

    const selectedAgentIds = players.map(p => p.agent).filter(Boolean) as AgentType[];

    return (
        <main className="h-screen w-screen bg-[#0d0b09] text-white p-8 relative overflow-hidden flex flex-col">
            <BunkerBackground />

            {/* Dynamic Agent Hero Stage */}
            <div className="absolute inset-0 z-0 transition-all duration-1000">
                {player?.agent ? (
                    <div className="relative w-full h-full animate-in fade-in zoom-in-110 duration-1000">
                        <img
                            src={AGENT_LORE[player.agent].image}
                            alt="Background"
                            className="w-full h-full object-cover opacity-60 grayscale-[0.1]"
                        />
                        {/* Dramatic Watermark Overlay (Centered Left) */}
                        <div className="absolute inset-y-0 left-0 flex items-center justify-start pl-24 pointer-events-none select-none opacity-[0.08]">
                            <h2 className="text-[35vw] font-black italic tracking-tighter leading-none uppercase rotate-[-5deg] origin-left">
                                {AGENTS[player.agent].name}
                            </h2>
                        </div>
                        {/* Glow Overlay */}
                        <div 
                            className="absolute inset-0 opacity-20 mix-blend-overlay"
                            style={{ background: `radial-gradient(circle at 30% 50%, ${AGENTS[player.agent].color}, transparent 70%)` }}
                        />
                    </div>
                ) : (
                    <div className="relative w-full h-full flex items-center justify-center bg-black/40">
                        <div className="text-center animate-pulse">
                            <h2 className="text-9xl font-black italic tracking-tighter uppercase text-white/5 select-none">
                                SELECT_OPERATIVE
                            </h2>
                        </div>
                    </div>
                )}
                
                {/* Tactical Fades */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b09] via-[#0d0b09]/40 to-[#0d0b09]/80" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0d0b09] via-transparent to-[#0d0b09]" />
                <div className="absolute inset-0 bg-[#f5a623]/5 mix-blend-overlay" />
            </div>

            {/* Match Status Header */}
            <div className="fixed top-0 left-0 w-full p-12 px-16 flex justify-between items-start z-[200] pointer-events-none">
                <div className="pointer-events-auto">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.6em] text-[#f5a623] mb-1 font-mono">AKSHAR_FORMATION_PROTOCOL</h3>
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl font-black italic tracking-tighter mb-0 leading-none">
                            BRIEFING_<span className="text-[#f5a623]">ROOM</span>
                        </h1>
                        <div className="h-px w-12 bg-white/10" />
                        <RoomCodeDisplay code={roomId} />
                    </div>
                </div>
                <div className="flex flex-col items-end gap-3 pointer-events-auto">
                    <div className="flex items-center gap-4">
                        <Link href="/lore">
                            <SkeletalButton variant="secondary" className="px-6 h-10 border-[#f5a623]/20 bg-black/40 backdrop-blur-md">
                                <span className="text-[10px]">Archives</span>
                            </SkeletalButton>
                        </Link>
                        <SkeletalButton 
                            variant="secondary" 
                            onClick={handleLeaveLobby}
                            className="px-6 h-10 border-red-500/20 text-red-500/60 hover:text-red-500 bg-black/40 backdrop-blur-md"
                        >
                            <span className="text-[10px]">LEAVE</span>
                        </SkeletalButton>
                    </div>
                    <div className="text-[10px] font-mono text-white/10 uppercase tracking-widest hidden lg:block">NEURAL_ID: {roomId.slice(0, 8)}</div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto w-full relative z-[150] flex-1 flex flex-col pt-36 pb-40 px-12 min-h-0">
                <div className="flex-1 flex gap-12 relative min-h-0 overflow-hidden">
                    
                    {/* LEFT HUD: Tactical Dossier */}
                    <div className="w-[450px] flex flex-col justify-start pt-4 overflow-hidden">
                        {player?.agent ? (
                            <div className="animate-in slide-in-from-left-12 duration-700 space-y-6">
                                <div className="space-y-1">
                                    <h2 className="text-8xl font-black italic tracking-tighter uppercase leading-none" style={{ color: AGENTS[player.agent].color }}>
                                        {AGENTS[player.agent].name}
                                    </h2>
                                    <div className="flex items-center gap-4">
                                        <div className="h-0.5 w-12" style={{ backgroundColor: AGENTS[player.agent].color }} />
                                        <p className="text-[10px] font-bold text-white/40 tracking-[0.4em] uppercase italic">
                                            {AGENTS[player.agent].tagline}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3 max-w-sm">
                                    {/* Passive Panel */}
                                    <div className="p-4 bg-white/[0.02] border border-white/5 backdrop-blur-md relative rounded-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-1 h-1 rotate-45" style={{ backgroundColor: AGENTS[player.agent].color }} />
                                            <h4 className="text-[10px] font-black text-[#f5a623] uppercase tracking-[0.3em] font-mono">Passive_Protocol</h4>
                                        </div>
                                        <p className="text-xs font-black italic tracking-tight text-white/90 leading-tight">
                                            {AGENTS[player.agent].passive}
                                        </p>
                                    </div>

                                    {/* Active Panel */}
                                    <div className="p-5 bg-black/60 border-l-4 backdrop-blur-md relative shadow-2xl rounded-sm" style={{ borderLeftColor: AGENTS[player.agent].color }}>
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: AGENTS[player.agent].color }} />
                                                <h4 className="text-[10px] font-black text-[#f5a623] uppercase tracking-[0.3em] font-mono">Signature_Tech</h4>
                                            </div>
                                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest font-mono">[ TAB ]</span>
                                        </div>
                                        <h5 className="text-xl font-black italic tracking-tight text-white uppercase leading-none mb-2">
                                            {AGENTS[player.agent].active}
                                        </h5>
                                        <p className="text-[11px] text-white/50 mb-3 leading-tight uppercase font-bold italic">
                                            {AGENTS[player.agent].lore}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] italic font-mono">NEURAL_READY</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4 animate-pulse pt-12">
                                <h2 className="text-4xl font-black italic tracking-tighter text-white/10 uppercase">Awaiting_Sync</h2>
                                <div className="h-px w-32 bg-white/5" />
                                <p className="text-[10px] font-bold text-white/5 uppercase tracking-[0.4em]">Select an operative to initialize dossier</p>
                            </div>
                        )}
                    </div>

                    {/* RIGHT HUD: Formation Sync, Controls, and Embedded Chat */}
                    <div className="flex-1 flex flex-col items-end justify-start pt-4 gap-4 overflow-hidden">
                        <div className="w-80 flex flex-col gap-4 h-full">
                            {/* Sync Manifest */}
                            <div className="bg-black/80 border border-white/5 backdrop-blur-xl p-5 relative overflow-hidden rounded-sm shadow-2xl">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#f5a623] mb-4 flex items-center justify-between">
                                    <span>Sync_Manifest</span>
                                    <span className="text-white/20 font-mono italic">{players.length}/8</span>
                                </h2>
                                <div className="max-h-32 overflow-y-auto scrollbar-hide space-y-2">
                                    {players.map((p, index) => (
                                        <div key={p.id || `player-${index}`} className="flex items-center justify-between border-b border-white/[0.03] pb-2 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1 h-3" style={{ backgroundColor: p.agent ? AGENTS[p.agent].color : '#333' }} />
                                                <span className={`text-[11px] font-black uppercase tracking-tight ${p.id === playerId ? 'text-[#f5a623]' : 'text-white/80'}`}>
                                                    {p.name}
                                                </span>
                                            </div>
                                            {p.ready && <div className="w-1.5 h-1.5 bg-[#f5a623] rounded-full animate-pulse" />}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Controls Panel */}
                            <div className="space-y-2 bg-black/80 p-4 border border-[#f5a623]/20 backdrop-blur-md shadow-2xl rounded-sm">
                                <SkeletalButton
                                    onClick={() => setReady(!player?.ready)}
                                    disabled={!player?.agent}
                                    variant={player?.ready ? "secondary" : "primary"}
                                    className="w-full h-12 tracking-[0.2em] text-xs"
                                >
                                    {player?.ready ? 'ABORT_LOCK' : 'LOCK_SIGNAL'}
                                </SkeletalButton>

                                {isHost && (
                                    <SkeletalButton
                                        onClick={handleStartGame}
                                        disabled={!allReady}
                                        className="w-full h-9 border-white/10 hover:border-white/30 text-[10px]"
                                    >
                                        {allReady ? 'INITIALIZE_GRID' : 'AWAITING_SYNC'}
                                    </SkeletalButton>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Tactical Comms (Bottom Right) */}
                <ChatBox
                    roomId={roomId}
                    playerId={playerId}
                    playerName={playerName || 'Agent'}
                    agentId={player?.agent || undefined}
                />

                {/* BOTTOM HUD: Tactical Selection Row */}
                <div className="fixed bottom-0 left-0 w-full pb-8 pt-6 px-12 z-[250] pointer-events-none">
                    <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 pointer-events-auto">
                        <div className="flex items-center gap-2">
                            <div className="h-px w-20 bg-[#f5a623]/20" />
                            <span className="text-[9px] font-black text-[#f5a623] uppercase tracking-[0.6em] italic">Operative_Manifest</span>
                            <div className="h-px w-20 bg-[#f5a623]/20" />
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {Object.values(AGENTS).map((agent) => {
                                const isOccupied = selectedAgentIds.includes(agent.id) && player?.agent !== agent.id;
                                const isSelected = player?.agent === agent.id;
                                return (
                                    <div key={agent.id} className="relative group">
                                        <button
                                            onClick={() => !isOccupied && selectAgent(agent.id)}
                                            disabled={isOccupied}
                                            className={`
                                                relative w-16 h-20 transition-all duration-500 overflow-hidden
                                                border-b-4 bg-black/80 backdrop-blur-md
                                                ${isSelected ? 'scale-110 -translate-y-2 brightness-125 z-10' : 'hover:-translate-y-1 hover:brightness-110'}
                                                ${isOccupied ? 'opacity-20 grayscale cursor-not-allowed border-white/10' : 'cursor-pointer border-white/20 active:scale-95'}
                                            `}
                                            style={{ 
                                                borderBottomColor: isSelected ? agent.color : (isOccupied ? '#333' : 'rgba(255,255,255,0.1)'),
                                                boxShadow: isSelected ? `0 10px 30px ${agent.color}33` : 'none'
                                            }}
                                        >
                                            <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
                                                <div className={`text-2xl font-black italic tracking-tighter transition-all duration-500 mb-1 ${isSelected ? 'scale-110' : 'opacity-40 group-hover:opacity-100'}`} style={{ color: agent.color }}>
                                                    {agent.name[0]}
                                                </div>
                                                <div className={`text-[8px] font-black uppercase tracking-tighter transition-all ${isSelected ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`}>
                                                    {agent.name}
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
