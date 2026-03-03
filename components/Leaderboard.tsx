import React from 'react';
import { Player } from '../types';
import PlayerProgressBar from './PlayerProgressBar';

interface LeaderboardProps {
    players: Player[];
    myId: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ players, myId }) => {
    const sortedPlayers = [...players].sort((a, b) => {
        // Sort by progress desc, then wpm desc
        if (b.progress !== a.progress) return b.progress - a.progress;
        return b.wpm - a.wpm;
    });

    return (
        <div className="w-full bg-white/5 border-l border-white/10 p-6 h-full backdrop-blur-sm overflow-y-auto">
            <h2 className="text-xs uppercase tracking-[0.4em] font-black opacity-30 mb-8 px-1">
                Live Leaderboard
            </h2>

            <div className="space-y-6">
                {sortedPlayers.map((player, index) => (
                    <div key={player.id} className="relative">
                        <div className="absolute -left-4 top-1 text-[10px] font-bold opacity-20">
                            {(index + 1).toString().padStart(2, '0')}
                        </div>
                        <PlayerProgressBar
                            player={player}
                            isMe={player.id === myId}
                        />
                    </div>
                ))}
            </div>

            {players.length === 0 && (
                <div className="text-center py-20 opacity-20 italic text-sm">
                    Waiting for players...
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
