import React from 'react';
import { Agent } from '../lib/agents';

interface AbilityBarProps {
    agent: Agent;
    charge: number;
    onCooldown: boolean;
    cooldownRemaining: number;
}

const AbilityBar: React.FC<AbilityBarProps> = ({
    agent,
    charge,
    onCooldown,
    cooldownRemaining
}) => {
    const isReady = charge >= 1;

    return (
        <div className="w-full max-w-md mx-auto mt-8 flex flex-col items-center">
            <div className="flex justify-between w-full mb-1 px-1">
                <span className="text-[10px] uppercase font-black tracking-[0.3em] opacity-50">
                    {agent.name} {onCooldown ? 'RECHARGING' : 'ABILITY'}
                </span>
                <span className="text-xs font-mono font-bold" style={{ color: isReady ? agent.color : undefined }}>
                    {onCooldown ? `${cooldownRemaining}s` : `${Math.round(charge * 100)}%`}
                </span>
            </div>

            <div className="h-6 w-full bg-black/40 rounded-sm border-2 border-white/10 p-0.5 overflow-hidden relative">
                {/* Progress Fill */}
                <div
                    className={`h-full transition-all duration-300 ${isReady ? 'animate-pulse' : ''}`}
                    style={{
                        width: `${onCooldown ? 0 : charge * 100}%`,
                        backgroundColor: agent.color,
                        boxShadow: isReady ? `0 0 20px ${agent.color}` : 'none'
                    }}
                />

                {/* Ready Label */}
                {isReady && !onCooldown && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-black tracking-widest text-black mix-blend-overlay">
                            PRESS TAB TO ACTIVATE
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AbilityBar;
