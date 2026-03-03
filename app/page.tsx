"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoom, joinRoom } from "@/lib/roomUtils";
import { v4 as uuidv4 } from "uuid";
import { PromptCategory } from "@/lib/prompts";
import { ensureAuth } from "@/lib/firebase";
import { useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [roomIdInput, setRoomIdInput] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Room Configuration
  const [category, setCategory] = useState<PromptCategory>('tech');
  const [targeting, setTargeting] = useState<'random' | 'leader' | 'all'>('leader');
  const [abilitySpeed, setAbilitySpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    ensureAuth().catch(console.error);
  }, []);

  const handleCreateRoom = async () => {
    if (!name.trim()) {
      setError("Please enter your name first!");
      return;
    }

    setLoading(true);
    try {
      let playerId = sessionStorage.getItem('typeagents_player_id');
      if (!playerId) {
        playerId = uuidv4();
        sessionStorage.setItem('typeagents_player_id', playerId);
      }
      localStorage.setItem('typeagents_player_name', name);

      const newRoomId = await createRoom(playerId, name, category, {
        targeting,
        abilitySpeed
      });
      router.push(`/lobby/${newRoomId}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!name.trim()) {
      setError("Please enter your name first!");
      return;
    }
    if (!roomIdInput.trim()) {
      setError("Please enter a room code!");
      return;
    }

    setLoading(true);
    try {
      let playerId = sessionStorage.getItem('typeagents_player_id');
      if (!playerId) {
        playerId = uuidv4();
        sessionStorage.setItem('typeagents_player_id', playerId);
      }
      localStorage.setItem('typeagents_player_name', name);

      const rid = roomIdInput.toUpperCase();
      await joinRoom(rid, playerId, name);
      router.push(`/lobby/${rid}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 blur-[120px] rounded-full -z-10" />

      {/* Top Navigation */}
      <div className="absolute top-8 right-8 z-50">
        <Link
          href="/agents"
          className="px-6 py-2 bg-white/5 border border-white/10 hover:border-[#FF4655] hover:text-[#FF4655] transition-all text-[10px] font-black uppercase tracking-[0.2em] rounded-sm group flex items-center gap-3 backdrop-blur-sm"
        >
          Agent Intel
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="w-full max-w-md text-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div>
          <h1 className="text-6xl font-black tracking-tighter italic text-white mb-2 uppercase">
            TYPHO<span className="text-[#FF4655]">Ö</span>N
          </h1>
          <p className="text-xs uppercase tracking-[0.5em] font-bold opacity-40">
            Multiplayer Typing Battle
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="ENTER YOUR NAME"
              maxLength={16}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              className="w-full bg-white/5 border-b-2 border-white/10 px-0 py-4 text-center text-xl font-bold tracking-widest focus:border-[#FF4655] outline-none transition-all placeholder:text-white/10 uppercase"
            />
            {error && <p className="text-[#FF4655] text-[10px] mt-2 font-bold tracking-widest uppercase">{error}</p>}
          </div>

          {!showJoinInput && (
            <div className="pt-2">
              <div
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center justify-between py-3 border-y border-white/5 cursor-pointer group hover:bg-white/[0.02] transition-colors px-1"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-3 ${showSettings ? 'bg-[#FF4655]' : 'bg-white/20'} group-hover:bg-[#FF4655] transition-colors`} />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 group-hover:text-white transition-colors">
                    Mission Protocol
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {!showSettings && (
                    <div className="hidden sm:flex items-center gap-2 opacity-20 group-hover:opacity-40 transition-opacity">
                      <span className="text-[8px] font-bold uppercase tracking-widest">{category}</span>
                      <span className="w-1 h-1 rounded-full bg-white" />
                      <span className="text-[8px] font-bold uppercase tracking-widest">{targeting}</span>
                    </div>
                  )}
                  <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                    className={`text-white/20 group-hover:text-[#FF4655] transition-all duration-300 ${showSettings ? 'rotate-180' : ''}`}
                  >
                    <path d="m6 9 12 12 12-12" />
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>

              {showSettings && (
                <div className="py-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 gap-6 text-left">
                    {/* Category Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#FF4655]">01 // Scenario</label>
                        <span className="text-[8px] font-mono text-white/20">SELECT_PROMPT_POOL</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(['tech', 'lore', 'quotes', 'random'] as PromptCategory[]).map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`py-2 text-[9px] font-black uppercase tracking-widest border transition-all ${category === cat ? 'bg-[#FF4655] border-[#FF4655] text-black shadow-[0_0_15px_rgba(255,70,85,0.3)]' : 'bg-transparent border-white/10 text-white/40 hover:border-white/20'}`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Targeting Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-[#FF4655]">02 // Logic</label>
                          <span className="text-[8px] font-mono text-white/20">TARGET_SYSTEM</span>
                        </div>
                        <div className="flex flex-col gap-2">
                          {[
                            { id: 'random', label: 'Random Opponent' },
                            { id: 'leader', label: 'Race Leader' },
                            { id: 'all', label: 'Global (All)' }
                          ].map((t) => (
                            <button
                              key={t.id}
                              onClick={() => setTargeting(t.id as any)}
                              className={`px-4 py-2 text-left text-[9px] font-black uppercase tracking-widest border transition-all flex items-center justify-between ${targeting === t.id ? 'bg-[#FF4655]/10 border-[#FF4655] text-[#FF4655]' : 'bg-transparent border-white/5 text-white/20 hover:border-white/10'}`}
                            >
                              {t.label}
                              {targeting === t.id && <div className="w-1.5 h-1.5 bg-[#FF4655] rounded-full animate-pulse" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-[#FF4655]">03 // Intensity</label>
                          <span className="text-[8px] font-mono text-white/20">CHARGE_RATE</span>
                        </div>
                        <div className="flex flex-col gap-2">
                          {(['slow', 'normal', 'fast'] as const).map((speed) => (
                            <button
                              key={speed}
                              onClick={() => setAbilitySpeed(speed)}
                              className={`px-4 py-2 text-left text-[9px] font-black uppercase tracking-widest border transition-all flex items-center justify-between ${abilitySpeed === speed ? 'bg-[#FF4655]/10 border-[#FF4655] text-[#FF4655]' : 'bg-transparent border-white/5 text-white/20 hover:border-white/10'}`}
                            >
                              {speed}
                              {abilitySpeed === speed && <div className="w-1.5 h-1.5 bg-[#FF4655] rounded-full animate-pulse" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            {!showJoinInput ? (
              <>
                <button
                  disabled={loading}
                  onClick={handleCreateRoom}
                  className="group relative h-14 bg-[#FF4655] text-black font-black uppercase tracking-widest overflow-hidden transition-all hover:bg-white"
                >
                  <span className="relative z-10">Create Room</span>
                  {/* Decorative cut corners typical of Valorant UI can be added with CSS clips */}
                </button>
                <button
                  disabled={loading}
                  onClick={() => setShowJoinInput(true)}
                  className="h-14 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Join Room
                </button>
              </>
            ) : (
              <div className="space-y-3 animate-in slide-in-from-top-4 duration-300">
                <input
                  type="text"
                  placeholder="ROOM CODE"
                  maxLength={6}
                  value={roomIdInput}
                  onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
                  className="w-full bg-white/5 border border-white/10 h-14 text-center text-xl font-mono focus:border-[#FF4655] outline-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowJoinInput(false)}
                    className="h-14 border border-white/10 text-white/50 font-bold uppercase tracking-widest text-xs hover:text-white transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleJoinRoom}
                    className="h-14 bg-white text-black font-black uppercase tracking-widest"
                  >
                    Join
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-12 text-[10px] uppercase tracking-[0.3em] font-bold opacity-20">
          Powered by Next.js + Firebase
        </div>
      </div>
    </main>
  );
}
