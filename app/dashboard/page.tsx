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
import { updateSelectedAvatar, claimMissionReward, ensureMissions, getOperativeLevel, purchaseAvatar } from "@/lib/userService";
import MissionCard from "@/components/MissionCard";

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
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [purchasingId, setPurchasingId] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;
        if (!user || user.isAnonymous) {
            router.push("/");
            return;
        }

        // Ensure missions exist for the day
        ensureMissions(user.uid);

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

    const levelData = getOperativeLevel(profile?.xp || 0);

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

    const handleClaimMission = async (missionId: string) => {
        if (!user) return;
        setClaimingId(missionId);
        try {
            await claimMissionReward(user.uid, missionId);
        } catch (error) {
            console.error("Claim failed:", error);
        } finally {
            setClaimingId(null);
        }
    };

    const handlePurchaseAvatar = async (avatar: any) => {
        if (!user || !profile) return;
        if (profile.credits < avatar.price) return;
        if (levelData.level < (avatar.minLevel || 0)) return;

        setPurchasingId(avatar.id);
        try {
            const result = await purchaseAvatar(user.uid, avatar.id, avatar.price);
            if (!result.success) {
                alert(result.message);
            }
        } catch (error) {
            console.error("Purchase failed:", error);
        } finally {
            setPurchasingId(null);
        }
    };

    const handleSelectAvatar = async (avatarId: string) => {
        if (!user) return;
        try {
            await updateSelectedAvatar(user.uid, avatarId);
            setShowAvatarPicker(false);
        } catch (error) {
            console.error("Avatar selection failed:", error);
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
                            <div className="flex items-center gap-2 ml-4">
                                <div className="relative">
                                    <div className="w-10 h-10 bg-[#f5a623] skew-x-[-12deg] flex items-center justify-center text-black font-black text-xl italic shadow-[0_0_15px_rgba(245,166,35,0.3)]">
                                        <span className="skew-x-[12deg]">{levelData.level}</span>
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_5px_white]" />
                                </div>
                                <div className="space-y-0.5">
                                    <div className="px-2 py-0.5 bg-[#f5a623]/20 border border-[#f5a623]/30 text-[#f5a623] text-[9px] font-black tracking-widest uppercase">{levelData.title}</div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-32 h-1.5 bg-white/5 relative overflow-hidden">
                                            <div
                                                className="h-full bg-[#f5a623] transition-all duration-1000 shadow-[0_0_10px_#f5a623]"
                                                style={{ width: `${levelData.progress}%` }}
                                            />
                                        </div>
                                        <span className="text-[8px] font-bold text-white/30 uppercase tracking-tighter">XP: {levelData.xpToNext} to next</span>
                                    </div>
                                </div>
                            </div>
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

                {/* Right Sidebar: Missions & Economy */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#f5a623]">Daily Operations</h2>
                            <span className="text-[8px] font-mono text-white/10 uppercase">MISSIONS_LIVE</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {profile?.missions && profile.missions.length > 0 ? (
                                profile.missions.map(mission => (
                                    <MissionCard
                                        key={mission.id}
                                        mission={mission}
                                        onClaim={handleClaimMission}
                                        isClaiming={claimingId === mission.id}
                                    />
                                ))
                            ) : (
                                <div className="p-8 border border-dashed border-white/5 text-center space-y-2">
                                    <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">No Active Missions</div>
                                    <p className="text-[7px] font-bold text-white/10 uppercase italic">Check back tomorrow for new tactical assignments</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-[#f5a623]/5 border border-[#f5a623]/10 p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-[#f5a623]/10 pb-2">
                            <h3 className="text-[9px] font-black text-[#f5a623] uppercase tracking-widest">Currency Reserves</h3>
                            <span className="text-[7px] font-mono text-[#f5a623]/20">007_LEDGER</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <div className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Tactical XP</div>
                                <div className="text-2xl font-black italic text-white leading-none">{profile?.xp || 0}</div>
                            </div>
                            <div className="space-y-1 border-l border-white/5 pl-4">
                                <div className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Akshar Credits</div>
                                <div className="text-2xl font-black italic text-[#f5a623] leading-none">{profile?.credits || 0}</div>
                            </div>
                        </div>
                        <div className="pt-2">
                            <p className="text-[7px] font-bold text-white/10 uppercase tracking-tighter leading-tight">
                                Assets are synced with mission control. use credits to unlock custom avatars in the tactical roster.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tactical Roster / Store Modal */}
            {showAvatarPicker && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0d0b09]/90 backdrop-blur-sm" onClick={() => setShowAvatarPicker(false)} />
                    <div className="bg-[#1a1714] border border-[#f5a623]/20 w-full max-w-2xl relative z-10 animate-in zoom-in-95 duration-200 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0d0b09]">
                            <div>
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-[#f5a623]">Tactical Roster</h2>
                                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Recruit new operatives // Marketplace</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-2 px-3 py-1 bg-[#f5a623]/10 border border-[#f5a623]/20 rounded-full">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#f5a623] animate-pulse" />
                                    <span className="text-[10px] font-black text-[#f5a623]">{profile?.credits || 0} Akshar Credits</span>
                                </div>
                                <button onClick={() => setShowAvatarPicker(false)} className="text-white/20 hover:text-[#f5a623] transition-colors">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar bg-[#0d0b09]/50">
                            {PREMADE_AVATARS.map((avatar) => {
                                const isUnlocked = profile?.unlockedAvatars?.includes(avatar.id) || avatar.price === 0 || avatar.id === "alpha_unit";
                                const isSelected = profile?.selectedAvatar === avatar.id;
                                const canAfford = (profile?.credits || 0) >= avatar.price;
                                const levelLocked = levelData.level < (avatar.minLevel || 0);

                                return (
                                    <div
                                        key={avatar.id}
                                        className={`
                                            relative p-3 border transition-all group overflow-hidden
                                            ${isSelected ? 'border-[#f5a623] bg-[#f5a623]/5' : 'border-white/5 bg-white/[0.02] hover:border-white/20'}
                                            ${!isUnlocked && 'opacity-60'}
                                        `}
                                    >
                                        <div className="aspect-square mb-3 bg-black/40 relative overflow-hidden flex items-center justify-center">
                                            <img src={avatar.url} alt={avatar.name} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${!isUnlocked ? 'grayscale blur-[2px]' : ''}`} />
                                            {!isUnlocked && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                    <svg className="w-6 h-6 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                                    </svg>
                                                </div>
                                            )}
                                            {isSelected && (
                                                <div className="absolute top-0 right-0 p-1 bg-[#f5a623] text-black text-[8px] font-black uppercase italic tracking-tighter z-10">
                                                    Selected
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-[10px] font-black uppercase text-white/80 mb-2 truncate group-hover:text-[#f5a623] transition-colors">{avatar.name}</div>

                                        {isUnlocked ? (
                                            <button
                                                onClick={() => !isSelected && handleSelectAvatar(avatar.id)}
                                                className={`w-full py-1.5 text-[8px] font-black uppercase tracking-widest border transition-all ${isSelected ? 'border-[#f5a623] text-[#f5a623]' : 'border-white/10 text-white/40 hover:border-[#f5a623] hover:text-[#f5a623]'}`}
                                            >
                                                {isSelected ? 'ACTIVE' : 'DEPLOY'}
                                            </button>
                                        ) : (
                                            <button
                                                disabled={!canAfford || levelLocked || purchasingId === avatar.id}
                                                onClick={() => handlePurchaseAvatar(avatar)}
                                                className={`
                                                    w-full py-1.5 text-[8px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-1
                                                    ${levelLocked ? 'border-red-500/20 text-red-500/40 cursor-not-allowed' :
                                                        canAfford ? 'border-[#f5a623]/30 text-[#f5a623] hover:bg-[#f5a623] hover:text-black' :
                                                            'border-white/5 text-white/10 cursor-not-allowed'}
                                                `}
                                            >
                                                {levelLocked ? (
                                                    `Lvl ${avatar.minLevel} REQUIRED`
                                                ) : purchasingId === avatar.id ? (
                                                    <div className="w-3 h-3 border-2 border-current border-t-transparent animate-spin rounded-full" />
                                                ) : (
                                                    <>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#f5a623]" />
                                                        {avatar.price} Credits
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-6 border-t border-white/10 bg-[#0d0b09]">
                            <div className="text-[9px] text-white/40 italic uppercase flex items-center gap-3">
                                <div className="p-1 px-2 border border-[#f5a623]/20 text-[#f5a623] font-black">MARKET_LOGS</div>
                                <span>Recruiting new operatives requires Akshar Credits earned via Daily Operations. Higher ranks grant access to elite personnel.</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
