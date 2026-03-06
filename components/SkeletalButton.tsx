import React from 'react';

export default function SkeletalButton({
    children,
    onClick,
    disabled,
    className = "",
    borderClassName = "",
    variant = "primary"
}: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    borderClassName?: string;
    variant?: "primary" | "secondary";
}) {
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className={`group relative h-14 overflow-hidden border transition-all duration-300 font-black uppercase tracking-widest ${variant === "primary"
                ? `${borderClassName || "border-[#f5a623]"} text-[#f5a623] hover:text-black`
                : `${borderClassName || "border-white/10"} text-white/50 hover:border-white/40 hover:text-white`
                } ${className}`}
        >
            <div className={`absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ${variant === "primary" ? "bg-[#f5a623]" : "bg-white/10"
                }`} />
            <div className="relative z-10 flex items-center justify-center gap-3 px-0 whitespace-nowrap">
                {children}
            </div>
        </button>
    );
}
