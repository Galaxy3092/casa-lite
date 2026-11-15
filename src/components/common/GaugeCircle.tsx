import React from 'react';

interface GaugeCircleProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: string;
}

export const GaugeCircle: React.FC<GaugeCircleProps> = ({
  percent,
  size = 54,
  strokeWidth = 4.5,
  label,
  sublabel,
  color,
}) => {
  const safePercent = Math.max(0, Math.min(100, percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safePercent / 100) * circumference;

  const determineColor = () => {
    if (color) return color;
    if (safePercent > 85) return '#f43f5e'; // Rose
    if (safePercent > 70) return '#f59e0b'; // Amber
    return '#10b981'; // Emerald
  };

  const ringColor = determineColor();

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#27272a"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <span className="absolute font-mono text-xs font-semibold text-zinc-100">
          {safePercent}%
        </span>
      </div>
      {(label || sublabel) && (
        <div className="flex flex-col">
          {label && <span className="text-xs font-medium text-zinc-200">{label}</span>}
          {sublabel && <span className="text-[11px] font-mono text-zinc-400">{sublabel}</span>}
        </div>
      )}
    </div>
  );
};
