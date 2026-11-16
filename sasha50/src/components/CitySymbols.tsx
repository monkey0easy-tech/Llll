import React from "react";
import { StopId } from "./WorldMap";

const INK = "#1f2937";

/** Little vignettes for each stop of the route, drawn around (0,0), ~200 wide. */
export const CitySymbol: React.FC<{ id: StopId; x: number; y: number; s?: number; opacity?: number; frame?: number }> = ({ id, x, y, s = 1, opacity = 1, frame = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={opacity}>
    {id === "europe" && (
      <g>
        {[-70, -10, 50].map((hx, i) => (
          <g key={i} transform={`translate(${hx},${i === 1 ? -10 : 0})`}>
            <rect x={-26} y={-30} width={52} height={60} fill={["#FDE68A", "#FBCFE8", "#BFDBFE"][i]} stroke={INK} strokeWidth={2.5} />
            <path d="M-34,-28 L0,-70 L34,-28 Z" fill="#C2410C" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
            {[-52, -42, -34].map((ty, k) => (
              <path key={k} d={`M${-28 + k * 6},${ty + 14} q6,6 12,0 q6,6 12,0 q6,6 12,0 q6,6 12,0`} fill="none" stroke="#7c2d12" strokeWidth={1.6} />
            ))}
            <rect x={-10} y={-10} width={20} height={16} fill="#fff" stroke={INK} strokeWidth={2} />
            <rect x={-8} y={12} width={16} height={18} fill="#78350F" />
          </g>
        ))}
      </g>
    )}
    {id === "russia" && (
      <g>
        {[[-60, 0.8, "#16A34A"], [0, 1.1, "#DC2626"], [60, 0.8, "#2563EB"]].map(([dx, k, c], i) => (
          <g key={i} transform={`translate(${dx},0) scale(${k})`}>
            <rect x={-20} y={-40} width={40} height={70} fill="#FEF3C7" stroke={INK} strokeWidth={2.5} />
            <path d="M-24,-40 C-30,-60 -8,-70 0,-92 C8,-70 30,-60 24,-40 Z" fill={c as string} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
            <line x1={0} y1={-92} x2={0} y2={-108} stroke={INK} strokeWidth={2.5} />
            <path d="M-6,-10 a6,8 0 0 1 12,0 v14 h-12 Z" fill="#78350F" />
          </g>
        ))}
        <path d="M-110,32 Q0,18 110,32 L110,40 L-110,40 Z" fill="#fff" />
        {Array.from({ length: 14 }).map((_, i) => {
          const fx = -110 + ((i * 37) % 220);
          const fy = -110 + ((i * 53 + frame * 1.5) % 150);
          return (
            <g key={i} transform={`translate(${fx},${fy})`} stroke="#fff" strokeWidth={1.8} strokeLinecap="round">
              <line x1={-6} y1={0} x2={6} y2={0} />
              <line x1={-3} y1={-5} x2={3} y2={5} />
              <line x1={3} y1={-5} x2={-3} y2={5} />
            </g>
          );
        })}
      </g>
    )}
    {id === "singapore" && (
      <g>
        <rect x={-110} y={22} width={220} height={18} fill="#38BDF8" />
        {[-30, 0, 30].map((dx, i) => (
          <rect key={i} x={dx - 11} y={-90} width={22} height={112} fill="#CBD5E1" stroke={INK} strokeWidth={2} />
        ))}
        <path d="M-50,-96 L52,-96 Q58,-100 52,-104 L-50,-104 Q-56,-100 -50,-96 Z" fill="#94A3B8" stroke={INK} strokeWidth={2} />
        {[-85, 85].map((px, i) => (
          <g key={i} transform={`translate(${px},22)`}>
            <path d="M0,0 Q-4,-40 4,-70" fill="none" stroke="#92400E" strokeWidth={6} strokeLinecap="round" />
            {[-60, -20, 20, 60, 100].map((a, k) => (
              <path key={k} d={`M4,-70 q${Math.cos((a * Math.PI) / 180) * 22},${-14 + Math.sin((a * Math.PI) / 180) * 6} ${Math.cos((a * Math.PI) / 180) * 40},${Math.sin((a * Math.PI) / 180) * 26 - 4}`} fill="none" stroke="#16A34A" strokeWidth={6} strokeLinecap="round" />
            ))}
          </g>
        ))}
      </g>
    )}
    {id === "dubai" && (
      <g>
        <circle cx={60} cy={-60} r={22} fill="#FDBA74" />
        <path d="M-6,30 L-6,-20 L-4,-60 L-2,-110 L0,-150 L2,-110 L4,-60 L6,-20 L6,30 Z" fill="#94A3B8" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
        <path d="M-12,30 L-12,0 L12,0 L12,30 Z" fill="#94A3B8" stroke={INK} strokeWidth={2} />
        <path d="M-120,40 Q-70,0 -20,30 Q30,5 70,28 Q100,10 120,30 L120,44 L-120,44 Z" fill="#F59E0B" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      </g>
    )}
  </g>
);
