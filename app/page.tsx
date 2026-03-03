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

      const newRoomId = await createRoom(playerId, name, 'tech'); // Default to tech
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
          <h1 className="text-6xl font-black tracking-tighter italic text-white mb-2">
            TYPE <span className="text-[#FF4655]">AGENTS</span>
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
