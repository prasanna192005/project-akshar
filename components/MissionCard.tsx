import React from 'react';
import SkeletalButton from './SkeletalButton';

interface MissionCardProps {
    mission: {
        id: string;
        description: string;
        goal: number;
        progress: number;
        rewardXp: number;
        rewardCredits: number;
        claimed: boolean;
    };
    onClaim: (id: string) => void;
    isClaiming: boolean;
}

const MissionCard: React.FC<MissionCardProps> = ({ mission, onClaim, isClaiming }) => {
    const isCompleted = mission.progress >= mission.goal;
    const progressPercent = Math.min(100, (mission.progress / mission.goal) * 100);

    return (
        <div className={`p-4 bg-white/[0.02] border ${isCompleted ? 'border-[#f5a623]/30 bg-[#f5a623]/5' : 'border-white/5'} transition-all group`}>
            <div className="flex justify-between items-start mb-3">
                <div className="space-y-1 flex-1">
                    <h4 className={`text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'text-[#f5a623]' : 'text-white/60'}`}>
                        {mission.description}
                    </h4>
                    <div className="flex items-center gap-2">
                        <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Rewards:</span>
                        <span className="text-[8px] font-black text-[#f5a623]">{mission.rewardXp} XP</span>
                        <span className="text-[8px] font-black text-blue-400">{mission.rewardCredits} CR</span>
                    </div>
                </div>
                {isCompleted && !mission.claimed && (
                    <SkeletalButton
                        variant="primary"
                        className="px-3 py-1 h-auto text-[8px] animate-pulse"
                        onClick={() => onClaim(mission.id)}
                        disabled={isClaiming}
                    >
                        {isClaiming ? "SYNCING..." : "CLAIM"}
                    </SkeletalButton>
                )}
                {mission.claimed && (
                    <div className="px-2 py-1 bg-green-500/20 border border-green-500/30 text-green-500 text-[8px] font-black uppercase tracking-widest">
                        CLAIMED
                    </div>
                )}
            </div>

            <div className="space-y-1.5">
                <div className="flex justify-between text-[7px] font-bold tracking-widest uppercase">
                    <span className="text-white/40">Operation Progress</span>
                    <span className={isCompleted ? 'text-[#f5a623]' : 'text-white/20'}>
                        {Math.floor(mission.progress)} / {mission.goal}
                    </span>
                </div>
                <div className="h-1 bg-white/5 relative overflow-hidden">
                    <div
                        className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-[#f5a623]' : 'bg-white/20'}`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default MissionCard;
