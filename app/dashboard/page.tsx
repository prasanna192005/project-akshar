"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { subscribeToUserProfile, UserProfile, updateOperativeHandle } from "@/lib/userService";
import BunkerBackground from "@/components/BunkerBackground";
import SkeletalButton from "@/components/SkeletalButton";
import DashboardCard from "@/components/DashboardCard";
import Link from "next/link";
import TrendChart from "@/components/TrendChart";
import { PREMADE_AVATARS } from "@/lib/avatars";
import { updateSelectedAvatar } from "@/lib/userService";

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading, signOut } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [handleInput, setHandleInput] = useState("");
    const [isEditingHandle, setIsEditingHandle] = useState(false);
    const [savingHandle, setSavingHandle] = useState(false);
    const [handleMessage, setHandleMessage] = useState("");
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        if (!user || user.isAnonymous) {
            router.push("/");
            return;
        }

        const unsubscribe = subscribeToUserProfile(user.uid, (data) => {
            setProfile(data);
            if (data?.operativeHandle && !handleInput) {
                setHandleInput(data.operativeHandle);
            } else if (!data?.operativeHandle && user?.displayName && !handleInput) {
                setHandleInput(user.displayName.split(' ')[0].toUpperCase());
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading, router, handleInput]);

    const handleUpdateHandle = async () => {
        if (!user || !handleInput.trim() || handleInput.length < 3 || handleInput === profile?.operativeHandle) {
            setIsEditingHandle(false);
            return;
        }

        setSavingHandle(true);
        try {
            await updateOperativeHandle(user.uid, handleInput.trim());
            setHandleMessage("HANDLE_SYNCED");
            setIsEditingHandle(false);
            setTimeout(() => setHandleMessage(""), 3000);
        } catch (error) {
            setHandleMessage("SYNC_FAILED");
        } finally {
            setSavingHandle(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-[#0d0b09] flex items-center justify-center">
                <div className="text-[#f5a623] text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">
                    Connecting to AKSHAR Network...
                </div>
            </div>
        );
    }

    const stats = profile?.stats || {
        totalWins: 0,
        totalMatches: 0,
        peakWpm: 0,
        careerAvgWpm: 0,
        accuracy: 0,
    };

    return (
        <main className="min-h-screen bg-[#0d0b09] text-white p-8 relative overflow-hidden">
            <BunkerBackground />

            {/* Header */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-6">
                    <div className="relative group cursor-pointer" onClick={() => setShowAvatarPicker(true)}>
                        <div className="w-20 h-20 rounded-full border-2 border-[#f5a623]/20 p-1 relative z-10 overflow-hidden bg-[#0d0b09]">
                            {profile?.selectedAvatar ? (
                                <img
                                    src={PREMADE_AVATARS.find(a => a.id === profile.selectedAvatar)?.url}
                                    alt="Avatar"
                                    className="w-full h-full rounded-full transition-all duration-500 scale-110"
                                />
                            ) : user?.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full transition-all duration-500" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-[#f5a623]/10 flex items-center justify-center font-black text-2xl text-[#f5a623]">
                                    {profile?.operativeHandle?.[0] || user?.displayName?.[0] || 'O'}
                                </div>
                            )}
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-[#f5a623]/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[8px] font-black text-black uppercase bg-[#f5a623] px-1">EDIT</span>
                            </div>
                        </div>
                        <div className="absolute -inset-2 bg-[#f5a623]/5 rounded-full blur-xl animate-pulse" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            {isEditingHandle ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        autoFocus
                                        type="text"
                                        maxLength={16}
                                        value={handleInput}
                                        onChange={(e) => setHandleInput(e.target.value.toUpperCase())}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleUpdateHandle();
                                            if (e.key === 'Escape') {
                                                setIsEditingHandle(false);
                                                setHandleInput(profile?.operativeHandle || "");
                                            }
                                        }}
                                        className="bg-white/5 border-b-2 border-[#f5a623] text-4xl font-black italic tracking-tighter uppercase outline-none text-[#f5a623] w-[300px]"
                                    />
                                    <button
                                        onClick={handleUpdateHandle}
                                        disabled={savingHandle || handleInput.length < 3}
                                        className="text-[#f5a623] hover:text-white transition-colors"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditingHandle(false);
                                            setHandleInput(profile?.operativeHandle || "");
                                        }}
                                        className="text-white/20 hover:text-red-500 transition-colors"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 group/handle cursor-pointer" onClick={() => setIsEditingHandle(true)}>
                                    <h1 className="text-4xl font-black italic tracking-tighter uppercase">{profile?.operativeHandle || user?.displayName || 'OPERATIVE'}</h1>
                                    <button
                                        className="opacity-20 group-hover/handle:opacity-100 text-[#f5a623] transition-all hover:scale-110"
                                        title="Edit Handle"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    </button>
                                    {handleMessage && <span className="text-[10px] font-black text-[#f5a623] animate-pulse ml-2 lowercase tracking-normal">{handleMessage}</span>}
                                </div>
                            )}
                            <div className="px-2 py-0.5 bg-[#f5a623]/20 border border-[#f5a623]/30 text-[#f5a623] text-[8px] font-bold tracking-widest uppercase ml-2">Verified Operative</div>
                        </div>
                        <p className="text-[10px] font-bold text-white/30 tracking-[0.3em] uppercase">UID: {user?.uid.substring(0, 12)}... // THAR_SECTOR_07</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/">
                        <SkeletalButton variant="secondary" className="px-6 py-2 h-auto text-[9px] uppercase tracking-widest border-white/5 bg-white/5">
                            Return to HQ
                        </SkeletalButton>
                    </Link>
                    <SkeletalButton
                        onClick={() => {
                            signOut();
                            router.push("/");
                        }}
                        variant="secondary"
                        className="px-6 py-2 h-auto text-[9px] uppercase tracking-widest border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500/50 hover:text-red-500"
                    >
                        Terminate Session
                    </SkeletalButton>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10 mb-8">
                <DashboardCard title="Average Bandwidth" value={Math.round(stats.careerAvgWpm)} label="Words Per Minute (Career)" />
                <DashboardCard title="Peak Output" value={Math.round(stats.peakWpm)} label="Words Per Minute (Record)" />
                <DashboardCard title="Packet Integrity" value={`${Math.round(stats.accuracy)}%`} label="Transmission Accuracy" />
                <DashboardCard title="Nodes Restored" value={stats.totalWins} label={`Matches Won out of ${stats.totalMatches}`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white/[0.02] border border-white/5 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#f5a623]">Forensic Trend Analysis</h2>
                            <span className="text-[8px] font-mono text-white/10 uppercase">TELEMETRY_STREAM_STABLE</span>
                        </div>
                        <div className="h-[150px] w-full">
                            <TrendChart data={profile?.recentMatches || []} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#f5a623]">Recent Incident Reports</h2>
                            <span className="text-[8px] font-mono text-white/10 uppercase">MATCH_HISTORY_LOG</span>
                        </div>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {profile?.recentMatches && profile.recentMatches.length > 0 ? (
                                profile.recentMatches.map((match, i) => (
                                    <div key={match.id + i} className="bg-white/[0.02] border border-white/5 p-4 flex items-center justify-between hover:bg-white/[0.04] transition-colors group">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-8 h-8 flex items-center justify-center font-black italic text-lg ${match.placement === 1 ? 'text-[#f5a623]' : 'text-white/20'}`}>#{match.placement}</div>
                                            <div>
                                                <div className="text-[10px] font-black tracking-widest text-white group-hover:text-[#f5a623] transition-colors uppercase">REPORT_{match.id.substring(0, 8)}</div>
                                                <div className="text-[8px] font-bold text-white/20 tracking-widest uppercase">{new Date(match.timestamp).toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-12">
                                            <div className="text-right">
                                                <div className="text-xl font-black italic text-white leading-none">{match.wpm}</div>
                                                <div className="text-[8px] font-bold text-white/20 uppercase">WPM</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-black italic text-white leading-none">{match.accuracy}%</div>
                                                <div className="text-[8px] font-bold text-white/20 uppercase">ACC</div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-32 flex items-center justify-center border border-dashed border-white/5 text-[9px] font-bold text-white/10 uppercase tracking-widest">
                                    No incident records found in active archive
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#f5a623]">System Diagnostics</h2>
                        </div>
                        <div className="bg-[#f5a623]/5 border border-[#f5a623]/10 p-6 space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[9px] font-bold tracking-widest">
                                    <span className="text-white/40">NETWORK_SYNC</span>
                                    <span className="text-green-500">OPTIMAL</span>
                                </div>
                                <div className="h-1 bg-white/5">
                                    <div className="h-full bg-green-500/50 w-[94%]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[9px] font-bold tracking-widest">
                                    <span className="text-white/40">VITAL_SIGNS</span>
                                    <span className="text-[#f5a623]">STABLE</span>
                                </div>
                                <div className="h-1 bg-white/5">
                                    <div className="h-full bg-[#f5a623]/50 w-[82%]" />
                                </div>
                            </div>
                            <div className="pt-4 border-t border-[#f5a623]/10">
                                <p className="text-[9px] font-bold text-[#f5a623]/60 leading-relaxed italic">
                                    "INTELLIGENCE: YOUR BANDWIDTH INTEGRITY HAS IMPROVED BY {(stats.careerAvgWpm > 0) ? Math.round(stats.careerAvgWpm / 10) : 0}% SINCE INITIAL RECRUITMENT. MAINTAIN FOCUS."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showAvatarPicker && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0d0b09]/90 backdrop-blur-sm" onClick={() => setShowAvatarPicker(false)} />
                    <div className="relative w-full max-w-lg bg-[#0d0b09] border border-[#f5a623]/20 p-8 space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center justify-between border-b border-[#f5a623]/10 pb-4">
                            <h2 className="text-xl font-black italic tracking-tighter uppercase text-[#f5a623]">Choose Tactical Avatar</h2>
                            <button onClick={() => setShowAvatarPicker(false)} className="text-white/20 hover:text-[#f5a623] transition-colors">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {PREMADE_AVATARS.map((avatar) => (
                                <button
                                    key={avatar.id}
                                    onClick={async () => {
                                        if (user) {
                                            await updateSelectedAvatar(user.uid, avatar.id);
                                            setShowAvatarPicker(false);
                                        }
                                    }}
                                    className={`relative aspect-square rounded-full p-1 border-2 transition-all duration-300 group ${profile?.selectedAvatar === avatar.id ? 'border-[#f5a623] bg-[#f5a623]/10' : 'border-white/5 hover:border-[#f5a623]/50'}`}
                                >
                                    <img src={avatar.url} alt={avatar.name} className="w-full h-full rounded-full transition-all duration-500 scale-110" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                        <div className="bg-[#f5a623] text-black text-[7px] font-black px-1 uppercase whitespace-nowrap">{avatar.name}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="pt-4 border-t border-[#f5a623]/10 flex justify-between items-center text-[8px] font-bold text-white/20 uppercase tracking-widest">
                            <span>Select visual identity for tactical network</span>
                            <span>VERIFIED_ASSETS_ONLY</span>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
