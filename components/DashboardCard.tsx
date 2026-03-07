import React from 'react';

interface DashboardCardProps {
    title: string;
    value: string | number;
    label: string;
    icon?: React.ReactNode;
    className?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export default function DashboardCard({ title, value, label, icon, className = "", trend }: DashboardCardProps) {
    return (
        <div className={`bg-[#f5a623]/5 border border-[#f5a623]/10 p-6 relative overflow-hidden group ${className}`}>
            {/* Background Decor */}
            <div className="absolute top-0 right-0 p-2 opacity-5">
                <div className="text-[40px] font-black italic select-none">DATA</div>
            </div>

            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#f5a623]">{title}</h3>
                {icon && <div className="text-[#f5a623]/40 group-hover:text-[#f5a623] transition-colors">{icon}</div>}
            </div>

            <div className="space-y-1">
                <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black italic tracking-tighter text-white group-hover:text-[#f5a623] transition-colors duration-500">
                        {value}
                    </span>
                    {trend && (
                        <span className={`text-[9px] font-bold ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {trend.isPositive ? '↑' : '↓'} {trend.value}%
                        </span>
                    )}
                </div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">{label}</p>
            </div>

            {/* Decorative scanning line */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#f5a623]/20 overflow-hidden">
                <div className="w-1/3 h-full bg-[#f5a623] animate-scan" />
            </div>
        </div>
    );
}
