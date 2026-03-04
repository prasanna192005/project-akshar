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
                <div className="absolute inset-0 bg-yellow-500/5 flex items-center justify-center border-[20px] border-yellow-500/10">
                    <div className="text-yellow-500 font-black text-xs uppercase tracking-[1em] opacity-40 bg-black/40 px-8 py-2 border-y border-yellow-500/50 animate-pulse">
                        LOCKDOWN ACTIVE
                    </div>
                </div>
            )}

            {/* Toxic Effect (Green Tint) */}
            {effects.scrambledWords?.length > 0 && (
                <div className="absolute inset-0 bg-green-500/5 pointer-events-none mix-blend-screen" />
            )}

            {/* Progress Hidden (Omen Shadow) */}
            {effects.progressHidden && (
                <div className="absolute inset-0 bg-black/20 backdrop-grayscale-[0.5] transition-all" />
            )}

            {/* Paranoia (Nearsight) */}
            {effects.paranoia && (
                <div className="absolute inset-0 bg-black/40 ring-[150px] ring-inset ring-black/80 blur-2xl pointer-events-none transition-opacity duration-500" />
            )}

            {/* EMPRESS Effect (Soul Steal Heartbeat) */}
            {effects.empress && (
                <div className="absolute inset-0 border-[40px] border-[#C84FA8]/30 blur-3xl mix-blend-multiply animate-heartbeat pointer-events-none" />
            )}

            <style jsx global>{`
        @keyframes heartbeat {
          0% { transform: scale(1); opacity: 0.3; }
          15% { transform: scale(1.05); opacity: 0.5; }
          30% { transform: scale(1); opacity: 0.3; }
          45% { transform: scale(1.1); opacity: 0.6; }
          100% { transform: scale(1); opacity: 0.3; }
        }
        .animate-heartbeat {
          animation: heartbeat 1.5s ease-in-out infinite;
        }
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
