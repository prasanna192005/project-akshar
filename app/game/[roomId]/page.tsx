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
    const isHost = room && playerId ? room.hostId === playerId : false;
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

    const opponents = players.filter(p => p.id !== playerId);
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
        if (player?.finishedAt) return;

        if (status === 'racing' && playerId) {
            // When isComplete is true, we send the final 100% and a timestamp.
            // Firebase will update, and then on next render, player?.finishedAt will be non-null,
            // triggering the AUTH_LOCK above.
            updateProgress({
                progress: isComplete ? 100 : Math.min(99, progress),
                wpm: isComplete ? player?.wpm || wpm : wpm, // Keep last WPM
                accuracy: isComplete ? player?.accuracy || accuracy : Math.min(100, accuracy),
                finishedAt: isComplete ? Date.now() : null
            });
        }
    }, [progress, wpm, accuracy, isComplete, status, playerId, updateProgress, player?.finishedAt, player?.wpm, player?.accuracy]);

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
    }, [status, room?.raceStartAt, isHost, roomId]);

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

    if (isLoading || !room || !playerId) return <LoadingScreen />;

    const agent = player?.agent ? AGENTS[player.agent] : null;

    return (
        <main className="min-h-screen grid grid-cols-1 lg:grid-cols-4 overflow-hidden">
            {/* Game Area */}
            <div className="lg:col-span-3 flex flex-col p-12 justify-center relative">
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
                                className="px-4 py-2 bg-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-widest border border-yellow-500/50 rounded hover:bg-yellow-500 hover:text-black transition-all"
                            >
                                FORCE GO
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

                {/* Status Indicator */}
                <div className="mb-4 flex items-center justify-center gap-4">
                    <span className={`text-[10px] font-black uppercase tracking-[0.4em] px-3 py-1 rounded-full ${status === 'racing' ? 'bg-green-500/20 text-green-500 border border-green-500/30' :
                        status === 'countdown' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 animate-pulse' :
                            'bg-white/10 text-white/40 border border-white/10'
                        }`}>
                        STATUS: {status}
                    </span>
                    {isHost && (
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] px-3 py-1 rounded-full bg-[#FF4655]/20 text-[#FF4655] border border-[#FF4655]/30">
                            YOU ARE HOST
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
                        accentColor={agent?.color || '#FF4655'}
                        isActive={status === 'racing' && !isComplete}
                        isBlurred={player?.effects?.blurred}
                        isScrambled={(player?.effects?.scrambledWords?.length ?? 0) > 0}
                        isParanoid={player?.effects?.paranoia}
                        agentId={player?.agent || undefined}
                    />

                    {/* Mission Accomplished Overlay - Tactical / Industrial Design */}
                    {(isComplete || (player && player.finishedAt)) && (
                        <div className="absolute inset-x-[-10px] inset-y-[-10px] z-50 flex flex-col items-center justify-center bg-[#0F1923]/98 backdrop-blur-md border-y-2 border-green-500/50 animate-in fade-in slide-in-from-top-1 duration-500">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />

                            <div className="relative flex flex-col items-center">
                                <div className="text-7xl font-black italic text-green-500 tracking-tighter mb-2 translate-x-[-4px]">
                                    MISSION ACCOMPLISHED
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="flex items-center gap-4 bg-white/[0.03] px-8 py-3 border border-white/10 skew-x-[-12deg]">
                                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-none animate-pulse skew-x-[12deg]" />
                                        <span className="text-[14px] uppercase font-black tracking-[0.5em] text-white/90 skew-x-[12deg]">WAITING FOR SQUAD</span>
                                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-none animate-pulse skew-x-[12deg]" />
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
                                    className="bg-white text-black px-10 py-4 rounded-sm text-xs font-black uppercase tracking-[0.2em] border-b-4 border-gray-300 active:border-b-0 active:translate-y-1 transition-all shadow-2xl"
                                >
                                    Force Start Now
                                </button>
                                <span className="text-[10px] uppercase font-bold text-white/50 tracking-widest px-3 py-1 rounded">Host Fail-Safe</span>
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
