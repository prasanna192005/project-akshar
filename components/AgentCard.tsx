import React from 'react';
import { Agent } from '../lib/agents';

interface AgentCardProps {
    agent: Agent;
    selected: boolean;
    disabled: boolean;
    onSelect: (agentId: Agent['id']) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, selected, disabled, onSelect }) => {
    return (
        <div
            onClick={() => !disabled && onSelect(agent.id)}
            className={`relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer overflow-hidden
        ${selected
                    ? `border-[${agent.color}] bg-[${agent.color}]/10 shadow-[0_0_20px_rgba(0,0,0,0.3)]`
                    : 'border-white/10 bg-white/5 hover:border-white/30'}
        ${disabled && !selected ? 'opacity-40 cursor-not-allowed grayscale' : 'opacity-100'}
      `}
            style={{
                borderColor: selected ? agent.color : undefined,
                boxShadow: selected ? `0 0 15px ${agent.color}44` : undefined
            }}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold tracking-tighter" style={{ color: agent.color }}>
                    {agent.name}
                </h3>
                <span className="text-xs font-mono uppercase opacity-50">{agent.abilityKey}</span>
            </div>

            <p className="text-xs italic opacity-70 mb-3 leading-tight">"{agent.tagline}"</p>

            <div className="space-y-2">
                <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-40">Passive</span>
                    <p className="text-[11px] leading-tight">{agent.passive}</p>
                </div>
                <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-40">Ability</span>
                    <p className="text-[11px] leading-tight">{agent.active}</p>
                </div>
            </div>

            {selected && (
                <div
                    className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: agent.color }}
                />
            )}
        </div>
    );
};

export default AgentCard;
