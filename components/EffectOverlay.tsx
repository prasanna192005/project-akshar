import React from 'react';
import { PlayerEffects } from '../types';

interface EffectOverlayProps {
    effects: PlayerEffects;
}

const EffectOverlay: React.FC<EffectOverlayProps> = ({ effects }) => {
    if (!effects) return null;
    return (
        <div className="fixed inset-0 pointer-events-none z-[60]">
            {/* Flash Effect */}
            {effects.flashed && (
                <div className="absolute inset-0 bg-white animate-flash" />
            )}

            {/* Freeze Effect (Blue Vignette) */}
            {effects.frozen && (
                <div className="absolute inset-0 border-[100px] border-blue-500/20 blur-3xl mix-blend-screen animate-pulse" />
            )}

            {/* Input Locked (Yellow Grid) */}
            {effects.inputLocked && (
                <div className="absolute inset-0 bg-yellow-500/5 flex items-center justify-center">
                    <div className="text-yellow-500 font-black text-xs uppercase tracking-[1em] opacity-40 bg-black/40 px-8 py-2 border-y border-yellow-500/50">
                        LOCKDOWN ACTIVE
                    </div>
                </div>
            )}

            {/* Toxins (Green Tint) - Viper Passive */}
            {/* In a real app, logic for determining if Viper is close would trigger this */}

            <style jsx global>{`
        @keyframes flash {
          0% { opacity: 0; }
          10% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-flash {
          animation: flash 0.5s ease-out forwards;
        }
      `}</style>
        </div>
    );
};

export default EffectOverlay;
