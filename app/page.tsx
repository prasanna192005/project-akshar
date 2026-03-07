"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoom, joinRoom } from "@/lib/roomUtils";
import { v4 as uuidv4 } from "uuid";
import { PromptCategory } from "@/lib/prompts";
import { ensureAuth } from "@/lib/firebase";
import { useEffect } from "react";
import Link from "next/link";
import LoadingScreen from "@/components/LoadingScreen";
import BunkerBackground from "@/components/BunkerBackground";
import SkeletalButton from "@/components/SkeletalButton";
import { useAuth } from "@/hooks/useAuth";
import { subscribeToUserProfile, UserProfile } from "@/lib/userService";
import { PREMADE_AVATARS } from "@/lib/avatars";


function DecryptedText({ text, hoverText }: { text: string; hoverText: string }) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+अआइईउऊऋएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह";

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let iteration = 0;
    const target = isHovered ? hoverText : text;

    interval = setInterval(() => {
      setDisplayText(prev =>
        target.split("")
          .map((char, index) => {
            if (index < iteration) {
              return target[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= target.length) {
        clearInterval(interval);
      }

      iteration += 1 / 3;
    }, 30);

    return () => clearInterval(interval);
  }, [isHovered, text, hoverText]);

  return (
    <span
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="cursor-default select-none transition-colors duration-300 hover:text-[#f5a623]"
    >
      {displayText}
    </span>
  );
}

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
  const [authProcessing, setAuthProcessing] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  const [showSystemMenu, setShowSystemMenu] = useState(false);

  const { user, isGuest, loginWithGoogle, linkGoogleAccount, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user && !user.isAnonymous) {
      return subscribeToUserProfile(user.uid, (data) => {
        setProfile(data);
      });
    } else {
      setProfile(null);
    }
  }, [user]);

  useEffect(() => {
    if (profile?.operativeHandle) {
      setName(profile.operativeHandle);
    } else if (user && !user.isAnonymous && user.displayName) {
      setName(user.displayName.split(' ')[0].toUpperCase());
    } else {
      const savedName = localStorage.getItem('typeagents_player_name');
      if (savedName) setName(savedName);
    }
  }, [user, profile]);

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
      }, user ? !user.isAnonymous : false);
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
      await joinRoom(rid, playerId, name, user ? !user.isAnonymous : false);
      router.push(`/lobby/${rid}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#0d0b09] select-none">
      <BunkerBackground />

      {/* Top Navigation */}
      <div className="absolute top-8 left-8 z-[60]">
        <div
          className="relative"
          onMouseEnter={() => setShowSystemMenu(true)}
          onMouseLeave={() => setShowSystemMenu(false)}
        >
          <SkeletalButton
            variant="secondary"
            className={`px-6 py-2 h-auto text-[10px] flex items-center gap-3 transition-all duration-300 ${showSystemMenu ? 'bg-[#f5a623] border-[#f5a623] text-black' : 'border-white/5 bg-white/5 backdrop-blur-sm'}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${showSystemMenu ? 'bg-black' : 'bg-[#f5a623]'}`} />
            [ SYSTEM_PROTOCOLS ]
            <svg
              width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"
              className={`transition-transform duration-300 ${showSystemMenu ? 'rotate-180' : ''}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </SkeletalButton>

          {/* Tactical Dropdown */}
          {showSystemMenu && (
            <div className="absolute top-full left-0 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="w-64 bg-[#0d0b09]/95 backdrop-blur-xl border border-[#f5a623]/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="border-b border-[#f5a623]/10 px-4 py-2 bg-[#f5a623]/5">
                  <span className="text-[7px] font-black tracking-[0.3em] uppercase opacity-40">AKSHAR_FILES_v4.2</span>
                </div>
                <div className="flex flex-col">
                  <Link href="/guide" className="px-4 py-3 flex items-center justify-between group hover:bg-[#f5a623]/10 transition-colors border-b border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-[#f5a623]">Mission Briefing</span>
                    <div className="w-1 h-1 bg-white/10 group-hover:bg-[#f5a623] rounded-full" />
                  </Link>
                  <Link href="/lore" className="px-4 py-3 flex items-center justify-between group hover:bg-[#f5a623]/10 transition-colors border-b border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-[#f5a623]">Tactical Archives</span>
                    <div className="w-1 h-1 bg-white/10 group-hover:bg-white rounded-full" />
                  </Link>
                  <Link href="/agents" className="px-4 py-3 flex items-center justify-between group hover:bg-[#f5a623]/10 transition-colors">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-[#f5a623]">Operative Files</span>
                    <div className="w-1 h-1 bg-white/10 group-hover:bg-white rounded-full" />
                  </Link>
                </div>
                <div className="px-4 py-2 bg-white/[0.02] border-t border-white/5">
                  <p className="text-[7px] font-bold italic opacity-20 uppercase tracking-[0.2em]">Authorized access only // Sector 7</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-8 right-8 z-50 flex items-center gap-4">
        <Link href="/test">
          <SkeletalButton variant="secondary" className="px-6 py-2 h-auto text-[10px] flex items-center gap-3 border-white/5 bg-white/5 backdrop-blur-sm group hover:border-yellow-500/50">
            Testing Range
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse group-hover:animate-ping" />
          </SkeletalButton>
        </Link>

        {isGuest ? (
          <div className="flex flex-col items-end gap-2">
            <SkeletalButton
              onClick={async () => {
                setAuthProcessing(true);
                setAuthMessage("");
                try {
                  await linkGoogleAccount();
                  setAuthMessage("UPLINK SUCCESSFUL");
                  setTimeout(() => setAuthMessage(""), 3000);
                } catch (err: any) {
                  setAuthMessage("UPLINK FAILED");
                  console.error(err);
                } finally {
                  setAuthProcessing(false);
                }
              }}
              disabled={authProcessing}
              variant="secondary"
              className="px-6 py-2 h-auto text-[10px] flex items-center gap-3 border-[#f5a623]/20 bg-[#f5a623]/10 backdrop-blur-sm hover:bg-[#f5a623]/20"
            >
              {authProcessing ? "CONNECTING..." : "SIGN IN WITH GOOGLE"}
              <div className={`w-1.5 h-1.5 bg-[#f5a623] rounded-full ${authProcessing ? 'animate-ping' : 'animate-pulse'}`} />
            </SkeletalButton>
            {authMessage && <span className="text-[8px] font-bold tracking-widest text-[#f5a623] animate-pulse">{authMessage}</span>}
          </div>
        ) : (
          <Link href="/dashboard">
            <SkeletalButton
              variant="secondary"
              className="px-6 py-2 h-auto text-[10px] flex items-center gap-3 border-[#f5a623]/20 bg-[#f5a623]/10 backdrop-blur-sm"
            >
              {profile?.operativeHandle || "COMMAND CENTER"}
              {profile?.selectedAvatar ? (
                <img
                  src={PREMADE_AVATARS.find(a => a.id === profile.selectedAvatar)?.url}
                  alt="Avatar"
                  className="w-4 h-4 rounded-full border border-[#f5a623]/50 scale-110"
                />
              ) : user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-4 h-4 rounded-full border border-[#f5a623]/50" />
              ) : (
                <div className="w-1.5 h-1.5 bg-[#f5a623] rounded-full" />
              )}
            </SkeletalButton>
          </Link>
        )}
      </div>

      <div className="w-full max-w-md text-center space-y-8 animate-in fade-in zoom-in duration-700 z-10">
        <div>
          <h1 className="text-8xl font-black tracking-tighter italic text-white mb-2 uppercase leading-none drop-shadow-[0_0_30px_rgba(245,166,35,0.2)]">
            <DecryptedText text="AKSHAR" hoverText="अक्षर" />
          </h1>
          <p className="text-xs uppercase tracking-[0.5em] font-bold opacity-30 text-[#f5a623]">
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
              className="w-full bg-white/5 border-b-2 border-white/10 px-0 py-4 text-center text-xl font-bold tracking-widest focus:border-[#f5a623] outline-none transition-all placeholder:text-white/10 uppercase text-[#e8d9c5]"
            />
            {profile?.operativeHandle === name && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-40">
                <div className="w-1 h-1 bg-[#f5a623] rounded-full animate-pulse" />
                <span className="text-[7px] font-black tracking-widest text-[#f5a623]">SECURE_UPLINK</span>
              </div>
            )}
            {error && <p className="text-[#f5a623] text-[10px] mt-2 font-bold tracking-widest uppercase">{error}</p>}
          </div>

          {!showJoinInput && (
            <div className="pt-2">
              <div
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center justify-between py-3 border-y border-white/5 cursor-pointer group hover:bg-white/[0.02] transition-colors px-1"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-3 ${showSettings ? 'bg-[#f5a623]' : 'bg-white/20'} group-hover:bg-[#f5a623] transition-colors`} />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 group-hover:text-white transition-colors">
                    Mission Protocol
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {!showSettings && (
                    <div className="hidden sm:flex items-center gap-2 opacity-20 group-hover:opacity-40 transition-opacity">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-[#f5a623]">{category}</span>
                      <span className="w-1 h-1 rounded-full bg-white" />
                      <span className="text-[8px] font-bold uppercase tracking-widest">{targeting}</span>
                    </div>
                  )}
                  <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                    className={`text-white/20 group-hover:text-[#f5a623] transition-all duration-300 ${showSettings ? 'rotate-180' : ''}`}
                  >
                    <path d="m6 9 12 12 12-12" />
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>

              {showSettings && (
                <div className="py-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 gap-6 text-left">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#f5a623]">01 // Scenario</label>
                        <span className="text-[8px] font-mono text-white/10">SELECT_PROMPT_POOL</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(['tech', 'lore', 'quotes', 'random'] as PromptCategory[]).map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`py-2 text-[9px] font-black uppercase tracking-widest border transition-all ${category === cat ? 'bg-[#f5a623] border-[#f5a623] text-black shadow-[0_0_15px_rgba(245,166,35,0.3)]' : 'bg-transparent border-white/10 text-white/40 hover:border-white/20'}`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-[#f5a623]">02 // Logic</label>
                          <span className="text-[8px] font-mono text-white/10">TARGET_SYSTEM</span>
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
                              className={`px-4 py-2 text-left text-[9px] font-black uppercase tracking-widest border transition-all flex items-center justify-between ${targeting === t.id ? 'bg-[#f5a623]/10 border-[#f5a623] text-[#f5a623]' : 'bg-transparent border-white/5 text-white/20 hover:border-white/10'}`}
                            >
                              {t.label}
                              {targeting === t.id && <div className="w-1.5 h-1.5 bg-[#f5a623] rounded-full animate-pulse" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-[#f5a623]">03 // Intensity</label>
                          <span className="text-[8px] font-mono text-white/10">CHARGE_RATE</span>
                        </div>
                        <div className="flex flex-col gap-2">
                          {(['slow', 'normal', 'fast'] as const).map((speed) => (
                            <button
                              key={speed}
                              onClick={() => setAbilitySpeed(speed)}
                              className={`px-4 py-2 text-left text-[9px] font-black uppercase tracking-widest border transition-all flex items-center justify-between ${abilitySpeed === speed ? 'bg-[#f5a623]/10 border-[#f5a623] text-[#f5a623]' : 'bg-transparent border-white/5 text-white/20 hover:border-white/10'}`}
                            >
                              {speed}
                              {abilitySpeed === speed && <div className="w-1.5 h-1.5 bg-[#f5a623] rounded-full animate-pulse" />}
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
                <SkeletalButton
                  disabled={loading}
                  onClick={handleCreateRoom}
                >
                  Create Room
                </SkeletalButton>
                <SkeletalButton
                  variant="secondary"
                  disabled={loading}
                  onClick={() => setShowJoinInput(true)}
                >
                  Join Room
                </SkeletalButton>
              </>
            ) : (
              <div className="space-y-3 animate-in slide-in-from-top-4 duration-300">
                <input
                  type="text"
                  placeholder="ROOM CODE"
                  maxLength={6}
                  value={roomIdInput}
                  onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
                  className="w-full bg-white/5 border border-white/10 h-14 text-center text-xl font-mono focus:border-[#f5a623] outline-none text-[#f5a623]"
                />
                <div className="grid grid-cols-2 gap-3">
                  <SkeletalButton
                    variant="secondary"
                    onClick={() => setShowJoinInput(false)}
                    className="h-14"
                  >
                    Back
                  </SkeletalButton>
                  <SkeletalButton
                    onClick={handleJoinRoom}
                    className="h-14"
                  >
                    Join
                  </SkeletalButton>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-12 text-[10px] uppercase tracking-[0.3em] font-bold opacity-10 text-[#f5a623]">
          AKSHAR SYSTEMS // YAAO PRODUCTIONS
        </div>
      </div>
    </main>
  );
}
