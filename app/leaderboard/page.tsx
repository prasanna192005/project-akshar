"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getGlobalLeaderboard, UserProfile } from "@/lib/userService";
import BunkerBackground from "@/components/BunkerBackground";
import SkeletalButton from "@/components/SkeletalButton";
import LoadingScreen from "@/components/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { PREMADE_AVATARS } from "@/lib/avatars";

type SortCategory = 'totalWins' | 'peakWpm' | 'totalMatches';

export default function Leaderboard() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
    const [sortBy, setSortBy] = useState<SortCategory>('totalWins');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const data = await getGlobalLeaderboard(sortBy, 10);
                setLeaderboard(data);
            } catch (error) {
                console.error("Failed to fetch leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [sortBy]);

    const categories: { id: SortCategory; label: string; sub: string }[] = [
        { id: 'totalWins', label: 'Victories', sub: 'TOTAL_WINS' },
        { id: 'peakWpm', label: 'Velocity', sub: 'PEAK_WPM' },
        { id: 'totalMatches', label: 'Activity', sub: 'MATCHES_PLAYED' }
    ];

    const getStatValue = (player: UserProfile, category: SortCategory) => {
        switch (category) {
            case 'totalWins': return `${player.stats.totalWins} WINS`;
            case 'peakWpm': return `${Math.round(player.stats.peakWpm)} WPM`;
            case 'totalMatches': return `${player.stats.totalMatches} OPS`;
            default: return '';
        }
    };

    if (loading && leaderboard.length === 0) {
        return <LoadingScreen />;
    }

    return (
        <main className="min-h-screen bg-[#0d0b09] text-white p-8 relative overflow-hidden font-mono">
            <BunkerBackground />

            <div className="max-w-4xl mx-auto relative z-10 pt-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 bg-[#f5a623] animate-pulse" />
                            <h1 className="text-4xl font-black italic tracking-tighter uppercase">GLOBAL_LEADERBOARD</h1>
                        </div>
                        <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-[#f5a623]/60">
                            Sector: Universal // Operative Rankings
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <SkeletalButton
                            variant="secondary"
                            onClick={() => router.push('/')}
                            className="h-10 px-6 text-[10px]"
                        >
                            RETURN_HOME
                        </SkeletalButton>
                        <SkeletalButton
                            variant="secondary"
                            onClick={() => router.push('/dashboard')}
                            className="h-10 px-6 text-[10px]"
                        >
                            COMMAND_CENTER
                        </SkeletalButton>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="grid grid-cols-3 gap-1 mb-8 bg-white/5 border border-white/10 p-1">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSortBy(cat.id)}
                            className={`py-4 transition-all relative overflow-hidden group ${sortBy === cat.id ? 'bg-[#f5a623] text-black' : 'hover:bg-white/5'}`}
                        >
                            <div className="flex flex-col items-center gap-1">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${sortBy === cat.id ? 'text-black' : 'text-white/40'}`}>
                                    {cat.label}
                                </span>
                                <span className={`text-[7px] font-bold opacity-40 ${sortBy === cat.id ? 'text-black' : 'text-white'}`}>
                                    [{cat.sub}]
                                </span>
                            </div>
                            {sortBy === cat.id && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black/20" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Leaderboard List */}
                <div className="space-y-2 mb-12">
                    {leaderboard.length > 0 ? (
                        leaderboard.map((player, index) => {
                            const isCurrentUser = player.uid === user?.uid;
                            const avatar = PREMADE_AVATARS.find(a => a.id === player.selectedAvatar);

                            return (
                                <div
                                    key={player.uid}
                                    className={`flex items-center justify-between p-4 border transition-all duration-300 ${isCurrentUser ? 'bg-[#f5a623]/10 border-[#f5a623] shadow-[0_0_20px_rgba(245,166,35,0.1)]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                                >
                                    <div className="flex items-center gap-6">
                                        {/* Rank */}
                                        <div className={`w-8 text-2xl font-black italic tracking-tighter ${index < 3 ? 'text-[#f5a623]' : 'text-white/20'}`}>
                                            {(index + 1).toString().padStart(2, '0')}
                                        </div>

                                        {/* Avatar & Name */}
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className={`w-10 h-10 rounded-full border-2 overflow-hidden ${isCurrentUser ? 'border-[#f5a623]' : 'border-white/10'}`}>
                                                    {avatar ? (
                                                        <img src={avatar.url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                                            <span className="text-[10px] opacity-20">?</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {isCurrentUser && (
                                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#f5a623] rounded-full border-2 border-[#0d0b09] animate-pulse" />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-black uppercase tracking-widest ${isCurrentUser ? 'text-[#f5a623]' : 'text-white'}`}>
                                                    {player.operativeHandle || player.displayName || 'UNKNOWN_OPERATIVE'}
                                                </span>
                                                <span className="text-[7px] font-bold text-white/20 tracking-[0.2em]">
                                                    ID: {player.uid.substring(0, 8)} // SEC_VERIFIED
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stat */}
                                    <div className="text-right flex flex-col items-end gap-1">
                                        <span className={`text-xl font-black italic tracking-tighter ${isCurrentUser ? 'text-[#f5a623]' : 'text-white/80'}`}>
                                            {getStatValue(player, sortBy)}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-[#f5a623]/40"
                                                    style={{ width: index === 0 ? '100%' : `${100 - (index * 10)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-20 text-center border border-dashed border-white/10 opacity-30">
                            <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Searching database for operatives...</p>
                        </div>
                    )}
                </div>

                {/* Footer Metadata */}
                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 opacity-40">
                    <div className="text-[8px] font-bold tracking-[0.3em] uppercase">
                        Real-time synchronization active // AKSHAR_SYSTEMS_v2.4
                    </div>
                    <div className="flex gap-4">
                        <span className="text-[8px] font-bold tracking-[0.3em]">LATENCY_OPTIMIZED</span>
                        <span className="text-[8px] font-bold tracking-[0.3em]">ENCRYPTED_LINK</span>
                    </div>
                </div>
            </div>
        </main>
    );
}
