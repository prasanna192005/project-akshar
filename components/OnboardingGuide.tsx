"use client";

import { useState, useEffect } from "react";
import SkeletalButton from "./SkeletalButton";

interface Step {
    id: string;
    title: string;
    content: string;
    targetId?: string;
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const STEPS: Step[] = [
    {
        id: 'welcome',
        title: 'TACTICAL_UPLINK_ESTABLISHED',
        content: 'Welcome, Operative. This is the AKSHAR Sector 7 Command Hub. Your mission is to master the grid through speed and tactical dominance.',
        position: 'center'
    },
    {
        id: 'training',
        title: 'CALIBRATE_SENSORS',
        content: 'New to the sector? We recommend the Testing Range to calibrate your typing sensors and learn specialist abilities before active combat.',
        targetId: 'btn-training',
        position: 'bottom'
    },
    {
        id: 'solo',
        title: 'DIRECT_DEPLOYMENT',
        content: 'Veteran operative? You can skip the briefing and deploy directly into a Solo Mission against tactical bots or join a squad.',
        targetId: 'btn-solo',
        position: 'bottom'
    }
];

export default function OnboardingGuide({
    onComplete,
    onStartTraining
}: {
    onComplete: () => void;
    onStartTraining: () => void;
}) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const step = STEPS[currentStep];

    const next = () => {
        if (step.id === 'training') {
            onStartTraining();
            return;
        }

        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            setIsVisible(false);
            onComplete();
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="max-w-md w-full bg-[#0d0b09] border-2 border-[#f5a623] p-8 shadow-[0_0_50px_rgba(245,166,35,0.2)] relative overflow-hidden group animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                {/* Tactical Decorations */}
                <div className="absolute top-0 left-0 w-full h-1 bg-[#f5a623]/20" />
                <div className="absolute top-0 left-0 w-1 h-full bg-[#f5a623]/20" />
                <div className="absolute bottom-0 right-0 p-2 opacity-5 pointer-events-none">
                    <span className="text-4xl font-black italic">GUIDE_v1.0</span>
                </div>
                {/* Step Content */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-2 bg-[#f5a623] rounded-full animate-ping" />
                    <h2 className="text-xl font-black italic tracking-tighter text-[#f5a623] uppercase">
                        {step.title}
                    </h2>
                </div>

                <p className="text-sm font-bold text-white/80 leading-relaxed mb-8 tracking-wide">
                    {step.content}
                </p>

                <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black tracking-widest text-[#f5a623]/40">
                            STEP {currentStep + 1} // {STEPS.length}
                        </span>
                        <button
                            onClick={onComplete}
                            className="text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-[#f5a623] transition-all hover:bg-white/5 px-0 py-1 rounded border border-transparent hover:border-white/10 w-fit cursor-pointer"
                        >
                            [ SKIP_BRIEFING ]
                        </button>
                    </div>
                    <SkeletalButton
                        onClick={next}
                        className="h-10 px-8 text-[10px] min-w-[140px] cursor-pointer"
                    >
                        {step.id === 'training' ? "BEGIN_TRAINING" : (currentStep === STEPS.length - 1 ? "UNDERSTOOD" : "NEXT_PHASE")}
                    </SkeletalButton>
                </div>
            </div>

            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                <div className="w-full h-[2px] bg-white animate-scanline" />
            </div>
        </div>
    );
}
