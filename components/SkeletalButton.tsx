import React from 'react';

export default function SkeletalButton({
    children,
    onClick,
    disabled,
    id,
    className = "",
    borderClassName = "",
    variant = "primary"
}: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    id?: string;
    className?: string;
    borderClassName?: string;
    variant?: "primary" | "secondary";
}) {
    return (
        <button
            id={id}
            disabled={disabled}
            onClick={onClick}
            className={`group relative overflow-hidden border transition-all duration-300 font-black uppercase tracking-widest ${!className.includes('h-') ? 'h-14' : ''
                } ${variant === "primary"
                    ? `${borderClassName || "border-[#f5a623]"} text-[#f5a623] hover:text-black`
                    : `${borderClassName || "border-white/20"} text-white/60 hover:border-white/40 hover:text-white`
                } ${className}`}
        >
            <div className={`absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ${variant === "primary" ? "bg-[#f5a623]" : "bg-white/10"
                }`} />
            <div className={`relative z-10 flex items-center justify-center gap-3 whitespace-nowrap transition-colors duration-300 ${variant === "primary" ? "group-hover:text-black" : "group-hover:text-white"
                }`}>
                {children}
            </div>
        </button>
    );
}
