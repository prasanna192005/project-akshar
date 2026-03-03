import React from 'react';
import { Player } from '../types';
import { AGENTS } from '../lib/agents';

interface PlayerProgressBarProps {
    player: Player;
    isMe: boolean;
}

const PlayerProgressBar: React.FC<PlayerProgressBarProps> = ({ player, isMe }) => {
    const agent = player.agent ? AGENTS[player.agent] : null;
    const color = agent?.color || '#ffffff';

    return (
        <div className={`w-full py-2 ${isMe ? 'opacity-100 scale-105' : 'opacity-70'}`}>
            <div className="flex justify-between items-end mb-1 px-1">
                <div className="flex items-center gap-2">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: color }}
                    />
                    <span className={`text-sm font-bold ${isMe ? 'text-white' : 'text-white/70'}`}>
                        {player.name} {isMe && '(You)'}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    {player.effects?.progressHidden ? (
                        <span className="text-[10px] font-black tracking-widest text-[#FF4655] animate-pulse">REDACTED</span>
                    ) : (
                        <>
                            <span className="text-xs font-mono opacity-50">{Math.round(player.accuracy)}% ACC</span>
                            <span className="text-sm font-black italic">{player.wpm} <span className="text-[10px] not-italic opacity-50">WPM</span></span>
                        </>
                    )}
                </div>
            </div>

            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                <div
                    className={`h-full transition-all duration-500 ease-out relative ${player.effects?.progressHidden ? 'opacity-0' : 'opacity-100'}`}
                    style={{
                        width: `${player.progress}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 10px ${color}66`
                    }}
                >
                    {isMe && (
                        <div className="absolute right-0 top-0 h-full w-1 bg-white animate-pulse" />
                    )}
                </div>
                {player.effects?.progressHidden && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                )}
            </div>
        </div >
    );
};

export default PlayerProgressBar;
