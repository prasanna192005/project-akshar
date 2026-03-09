"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoom } from "@/hooks/useRoom";
import { usePlayer } from "@/hooks/usePlayer";
import { useTyping } from "@/hooks/useTyping";
import { useAbility } from "@/hooks/useAbility";
import { AGENTS } from "@/lib/agents";
import { updateRoomStatus, updatePlayerState, INITIAL_EFFECTS } from "@/lib/roomUtils";
import TypingInput from "@/components/TypingInput";
import Leaderboard from "@/components/Leaderboard";
import AbilityBar from "@/components/AbilityBar";
import CountdownOverlay from "@/components/CountdownOverlay";
import EffectOverlay from "@/components/EffectOverlay";
import LoadingScreen from "@/components/LoadingScreen";
import BunkerBackground from "@/components/BunkerBackground";

import { ensureAuth } from "@/lib/firebase";

export default function Game() {
    const { roomId } = useParams() as { roomId: string };
    const router = useRouter();

    const [playerId, setPlayerId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        ensureAuth().catch(console.error);
        setPlayerId(sessionStorage.getItem('typeagents_player_id'));

        // Show loading screen for at least 2 seconds for tips to be read
        const timer = setTimeout(() => setIsLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const { room, players, status, loading } = useRoom(roomId);
    const { player, updateProgress, clearEffect } = usePlayer(roomId, playerId || "");

    const opponents = players.filter(p => p.id !== playerId);
    const {
        currentWordIndex,
        currentInput,
        handleInput,
        wpm,
        accuracy,
        progress,
        isComplete,
        words,
        lastInputAt,
        skipWords,
        isError
    } = useTyping(room?.prompt || "", status === 'racing', room?.raceStartAt, player?.effects?.inputLocked, player?.effects?.empress);

    const { charge, onCooldown, cooldownRemaining, activateAbility } = useAbility(
        player?.agent || null,
        wpm,
        accuracy,
        roomId,
        playerId || "",
        opponents,
        lastInputAt,
        isError,
        room?.config,
        skipWords
    );

    // Handle Tab key for abilities
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                activateAbility();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activateAbility]);

    // Sync progress to Firebase
    useEffect(() => {
        // AUTH_LOCK: If the server already confirms we finished, NEVER sync again.
        // This stops the progress bar from "resetting" due to local state cleanup.
        if (!player || player.finishedAt) return;

        if (status === 'racing' && playerId) {
            // When isComplete is true, we send the final 100% and a timestamp.
            // Firebase will update, and then on next render, player?.finishedAt will be non-null,
            // triggering the AUTH_LOCK above.
            updateProgress({
                progress: isComplete ? 100 : Math.min(99, progress),
                wpm: isComplete ? player.wpm || wpm : wpm, // Keep last WPM
                accuracy: isComplete ? player.accuracy || accuracy : Math.min(100, accuracy),
                finishedAt: isComplete ? Date.now() : null
            });
        }
    }, [progress, wpm, accuracy, isComplete, status, playerId, updateProgress, player, player?.finishedAt, player?.wpm, player?.accuracy]);

    // Handle game end
    useEffect(() => {
        if (status === 'racing' && players.length > 0 && players.every(p => p.finishedAt)) {
            updateRoomStatus(roomId, 'finished');
        }
    }, [status, players, roomId]);

    // Redirect to results with a generous delay for celebration
    useEffect(() => {
        if (!loading && status === 'finished') {
            const timer = setTimeout(() => router.push(`/results/${roomId}`), 4000);
            return () => clearTimeout(timer);
        }
    }, [status, roomId, router, loading]);

    // Effect auto-clear timers
    useEffect(() => {
        if (!player) return;
        if (player.effects.flashed) setTimeout(() => clearEffect('flashed'), 2500);
        if (player.effects.blurred) setTimeout(() => clearEffect('blurred'), 5000);
        if (player.effects.inputLocked) setTimeout(() => clearEffect('inputLocked'), 2000);
        if (player.effects.scrambledWords?.length > 0) setTimeout(() => clearEffect('scrambledWords'), 6000);
        if (player.effects.paranoia) setTimeout(() => clearEffect('paranoia'), 4000);
    }, [player?.effects, clearEffect, player]);

    // Timer and Status transition logic
    const [elapsedTime, setElapsedTime] = useState(0);

    // Host: Force transition to racing when countdown ends
    useEffect(() => {
        const isHost = room && playerId ? room.hostId === playerId : false;
        if (status === 'countdown' && room?.raceStartAt && isHost) {
            const now = Date.now();
            const delay = Math.max(0, room.raceStartAt - now);

            console.log(`[Host] Race starting in ${delay}ms...`);

            const timer = setTimeout(async () => {
                console.log("[Host] Triggering race start!");
                try {
                    await updateRoomStatus(roomId, 'racing');
                } catch (e) {
                    console.error("Host transition failed:", e);
                }
            }, delay + 500);

            return () => clearTimeout(timer);
        }
    }, [status, room?.raceStartAt, room?.hostId, playerId, roomId]);

    useEffect(() => {
        if (status !== 'racing' || !room?.raceStartAt) {
            setElapsedTime(0);
            return;
        }

        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = Math.max(0, Math.floor((now - (room.raceStartAt || 0)) / 1000));
            setElapsedTime(elapsed);
        }, 100);

        return () => clearInterval(interval);
    }, [status, room?.raceStartAt]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading || !room || isLoading || !playerId) {
        return <LoadingScreen />;
    }

    const isHost = room.hostId === playerId;

    const agent = player?.agent ? AGENTS[player.agent] : null;

    return (
        <main className="min-h-screen grid grid-cols-1 lg:grid-cols-4 overflow-hidden bg-[#0d0b09] relative">
            <BunkerBackground />

            {/* Game Area */}
            <div className="lg:col-span-3 flex flex-col p-12 justify-center relative z-10">
                {/* Top Stats */}
                <div className="flex justify-between items-center mb-12">
                    <div className="flex items-center gap-6">
                        <div>
                            <span className="text-[10px] uppercase font-bold tracking-[0.3em] opacity-40 block mb-1">Agent</span>
                            <span className="text-xl font-black italic tracking-tighter" style={{ color: agent?.color }}>
                                {agent?.name}
                            </span>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div>
                            <span className="text-[10px] uppercase font-bold tracking-[0.3em] opacity-40 block mb-1">Performance</span>
                            <span className="text-xl font-mono font-black">{wpm} WPM</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        {isHost && status === 'countdown' && (
                            <button
                                onClick={() => updateRoomStatus(roomId, 'racing')}
                                className="px-6 py-2 bg-[#f5a623]/10 text-[#f5a623] text-[10px] font-black uppercase tracking-widest border border-[#f5a623]/30 rounded-sm hover:bg-[#f5a623] hover:text-black transition-all group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                                FORCE_GO
                            </button>
                        )}
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold opacity-30 uppercase tracking-widest">MISSION TIME</span>
                            <span className="text-2xl font-mono font-black animate-pulse">
                                {formatTime(elapsedTime)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mb-4 flex items-center justify-center gap-4">
                    <span className={`text-[10px] font-black uppercase tracking-[0.4em] px-3 py-1 rounded-sm border ${status === 'racing' ? 'bg-[#f5a623]/10 text-[#f5a623] border-[#f5a623]/30' :
                        status === 'countdown' ? 'bg-[#f5a623]/20 text-[#f5a623] border-[#f5a623]/50 animate-pulse' :
                            'bg-white/5 text-white/20 border-white/10'
                        }`}>
                        STATUS_LINK: {status === 'racing' ? 'ACTIVE' : status.toUpperCase()}
                    </span>
                    {isHost && (
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] px-3 py-1 rounded-sm bg-[#f5a623]/5 text-[#f5a623]/40 border border-[#f5a623]/10">
                            HOST_OVERRIDE: ENGAGED
                        </span>
                    )}
                </div>

                {/* Typing Interface */}
                <div className="relative">
                    <TypingInput
                        words={words}
                        currentWordIndex={currentWordIndex}
                        currentInput={currentInput}
                        handleInput={handleInput}
                        accentColor={agent?.color || '#f5a623'}
                        isActive={status === 'racing' && !isComplete}
                        isBlurred={player?.effects?.blurred}
                        isScrambled={(player?.effects?.scrambledWords?.length ?? 0) > 0}
                        isParanoid={player?.effects?.paranoia}
                        agentId={player?.agent || undefined}
                    />

                    {/* Mission Accomplished Overlay - Tactical / Industrial Design */}
                    {(isComplete || (player && player.finishedAt)) && (
                        <div className="absolute inset-x-[-10px] inset-y-[-10px] z-50 flex flex-col items-center justify-center bg-[#0d0b09]/95 backdrop-blur-md border-y-2 border-[#f5a623]/50 animate-in fade-in slide-in-from-top-1 duration-500">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />

                            <div className="relative flex flex-col items-center">
                                <div className="text-7xl font-black italic text-[#f5a623] tracking-tighter mb-2 translate-x-[-4px]">
                                    EXTRACTED_SUCCESS
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="flex items-center gap-4 bg-[#f5a623]/10 px-8 py-3 border border-[#f5a623]/20 skew-x-[-12deg]">
                                        <div className="w-1.5 h-1.5 bg-[#f5a623] rounded-none animate-pulse skew-x-[12deg]" />
                                        <span className="text-[14px] uppercase font-black tracking-[0.5em] text-[#f5a623] skew-x-[12deg]">WAITING_FOR_SQUAD_SYNC</span>
                                        <div className="w-1.5 h-1.5 bg-[#f5a623] rounded-none animate-pulse skew-x-[12deg]" />
                                    </div>
                                    <div className="text-[10px] uppercase font-bold text-white/20 tracking-[0.3em] mt-2">
                                        PHASE TRANSITION IMMINENT // STAND BY
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Ability Section */}
                {agent && (
                    <AbilityBar
                        agent={agent}
                        charge={charge}
                        onCooldown={onCooldown}
                        cooldownRemaining={cooldownRemaining}
                    />
                )}



                {/* Overlays */}
                {status === 'countdown' && room.countdownStartAt && (
                    <div className="relative">
                        <CountdownOverlay
                            startAt={room.raceStartAt || (Date.now() + 3000)}
                            onComplete={async () => {
                                if (isHost) {
                                    console.log("[Host] Countdown complete, updating status...");
                                    try {
                                        await updateRoomStatus(roomId, 'racing');
                                    } catch (e) {
                                        console.error("Callback transition failed:", e);
                                    }
                                }
                            }}
                        />
                        {isHost && (
                            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-4">
                                <button
                                    onClick={() => updateRoomStatus(roomId, 'racing')}
                                    className="bg-[#f5a623] text-black px-10 py-4 rounded-sm text-xs font-black uppercase tracking-[0.3em] border-b-4 border-[#c88a1c] hover:bg-white hover:border-white active:border-b-0 active:translate-y-1 transition-all shadow-[0_0_50px_rgba(245,166,35,0.2)]"
                                >
                                    INITIALIZE_NOW
                                </button>
                                <span className="text-[9px] uppercase font-bold text-[#f5a623]/40 tracking-[0.5em] px-3 py-1 rounded bg-[#f5a623]/5 border border-[#f5a623]/10">HOST_FAILSAFE_PROTOCOL</span>
                            </div>
                        )}
                    </div>
                )}
                {player && <EffectOverlay effects={player.effects} />}
            </div>

            {/* Leaderboard Panel */}
            <Leaderboard players={players} myId={playerId} />

            {/* Subtle Debug Indicator */}
            <div className="absolute bottom-2 left-2 text-[8px] font-mono opacity-20 flex gap-4 pointer-events-none z-50 bg-black/40 px-2 py-1 rounded">
                <span>ROOM: {roomId}</span>
                <span>STATUS: {status}</span>
                <span>YOU: {playerId?.substring(0, 4)}</span>
                <span>HOST: {room?.hostId?.substring(0, 4)}</span>
                <span>IS_HOST: {isHost ? 'YES' : 'NO'}</span>
            </div>
        </main>
    );
}
