"use client";

interface TrendChartProps {
    data: Array<{ wpm: number; timestamp: number }>;
    color?: string;
}

export default function TrendChart({ data, color = "#f5a623" }: TrendChartProps) {
    if (!data || data.length < 2) {
        return (
            <div className="h-full w-full flex items-center justify-center text-[8px] font-bold text-white/10 uppercase tracking-widest border border-dashed border-white/5">
                Insufficient data for trend analysis
            </div>
        );
    }

    // Sort by timestamp just in case
    const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);

    // Reverse to show oldest to newest (history is usually newest first)
    // Actually our recentMatches is newest first, so we reverse it for the chart
    const points = sortedData.slice(-10); // Show last 10 matches

    const maxWpm = Math.max(...points.map(d => d.wpm));
    const minWpm = Math.min(...points.map(d => d.wpm));
    const range = maxWpm - minWpm || 10;

    const width = 400;
    const height = 100;
    const padding = 20;

    const getX = (index: number) => (index / (points.length - 1)) * (width - padding * 2) + padding;
    const getY = (wpm: number) => height - ((wpm - minWpm) / range) * (height - padding * 2) - padding;

    const pathData = points.reduce((acc, point, i) => {
        const x = getX(i);
        const y = getY(point.wpm);
        return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, "");

    const areaData = `${pathData} L ${getX(points.length - 1)} ${height} L ${getX(0)} ${height} Z`;

    return (
        <div className="w-full h-full relative group">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                {/* Grid Lines */}
                <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="white" strokeOpacity="0.05" strokeWidth="1" strokeDasharray="4 4" />
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="white" strokeOpacity="0.05" strokeWidth="1" strokeDasharray="4 4" />

                {/* Area */}
                <path d={areaData} fill={color} fillOpacity="0.05" />

                {/* Line */}
                <path d={pathData} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(245,166,35,0.5)]" />

                {/* Points */}
                {points.map((point, i) => (
                    <circle
                        key={i}
                        cx={getX(i)}
                        cy={getY(point.wpm)}
                        r="3"
                        fill="#0d0b09"
                        stroke={color}
                        strokeWidth="1.5"
                        className="transition-all duration-300 hover:r-4 cursor-crosshair"
                    />
                ))}
            </svg>

            {/* Axis Labels */}
            <div className="absolute top-0 left-0 text-[7px] font-black text-white/20 uppercase tracking-tighter">{maxWpm} WPM</div>
            <div className="absolute bottom-4 left-0 text-[7px] font-black text-white/20 uppercase tracking-tighter">{minWpm} WPM</div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[7px] font-black text-white/20 uppercase tracking-widest leading-none">FORENSIC_TREND_ANALYSIS_V1.0</div>
        </div>
    );
}
