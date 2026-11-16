import React from "react";

const INK = "#3a3a4a";
const sk = { stroke: INK, strokeWidth: 3.5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** Soviet courtyard drawn like a pencil sketch: panel block, garages, swings, pull-up bar, bench. */
export const Courtyard: React.FC<{ ground?: number; frame: number; bench?: boolean; swingsX?: number }> = ({ ground = 880, frame, bench, swingsX = 330 }) => {
  const swing = Math.sin(frame * 0.08) * 14;
  return (
    <g>
      {/* panel building */}
      <rect x={180} y={ground - 560} width={1000} height={560} fill="#e6dcc8" {...sk} />
      {Array.from({ length: 5 }).map((_, r) =>
        Array.from({ length: 10 }).map((_, c) => (
          <rect key={`${r}-${c}`} x={215 + c * 96} y={ground - 530 + r * 100} width={52} height={60} fill={(r * 7 + c * 3) % 5 === 0 ? "#f6e3a1" : "#c9d6e6"} {...sk} strokeWidth={2.5} />
        )),
      )}
      {[2, 5, 8].map((c) => (
        <line key={c} x1={180 + c * 96 + 70} y1={ground - 560} x2={180 + c * 96 + 70} y2={ground} stroke={INK} strokeWidth={1.5} opacity={0.5} />
      ))}
      {/* tree */}
      <path d={`M1270,${ground} L1278,${ground - 240} L1296,${ground - 240} L1300,${ground}`} fill="#a8865c" {...sk} />
      <path d={`M1200,${ground - 260} q-40,-90 50,-130 q40,-90 120,-10 q90,0 60,100 q30,90 -80,90 q-80,40 -150,-50 Z`} fill="#b9c98f" {...sk} />
      {/* garages */}
      {Array.from({ length: 4 }).map((_, i) => (
        <g key={i}>
          <rect x={1370 + i * 140} y={ground - 190} width={140} height={190} fill={["#b8c4b0", "#c7b7a3", "#aebfcc", "#c9c0a6"][i]} {...sk} />
          <rect x={1385 + i * 140} y={ground - 160} width={110} height={160} fill="none" {...sk} strokeWidth={2.5} />
          <line x1={1440 + i * 140} y1={ground - 160} x2={1440 + i * 140} y2={ground} {...sk} strokeWidth={2} />
          <path d={`M${1365 + i * 140},${ground - 190} L${1515 + i * 140},${ground - 200}`} {...sk} />
        </g>
      ))}
      {/* swings */}
      <g transform={`translate(${swingsX},0)`}>
        <path d={`M-120,${ground} L-80,${ground - 260} L-40,${ground} M120,${ground} L80,${ground - 260} L40,${ground}`} fill="none" {...sk} strokeWidth={5} />
        <line x1={-80} y1={ground - 260} x2={80} y2={ground - 260} {...sk} strokeWidth={6} />
        <g transform={`rotate(${swing}, 0, ${ground - 260})`}>
          <line x1={-30} y1={ground - 260} x2={-30} y2={ground - 90} {...sk} strokeWidth={2.5} />
          <line x1={30} y1={ground - 260} x2={30} y2={ground - 90} {...sk} strokeWidth={2.5} />
          <rect x={-42} y={ground - 92} width={84} height={14} fill="#c2410c" {...sk} strokeWidth={2.5} />
        </g>
      </g>
      {/* pull-up bar */}
      <path d={`M1080,${ground} L1080,${ground - 300} M1230,${ground} L1230,${ground - 300}`} fill="none" {...sk} strokeWidth={6} />
      <line x1={1070} y1={ground - 290} x2={1240} y2={ground - 290} {...sk} strokeWidth={5} />
      {bench && (
        <g>
          <rect x={660} y={ground - 120} width={600} height={22} fill="#b45309" {...sk} />
          <rect x={660} y={ground - 200} width={600} height={18} fill="#b45309" {...sk} />
          <rect x={660} y={ground - 168} width={600} height={18} fill="#b45309" {...sk} />
          <path d={`M690,${ground} L690,${ground - 98} M1230,${ground} L1230,${ground - 98}`} {...sk} strokeWidth={6} />
        </g>
      )}
      {/* ground */}
      <path d={`M0,${ground + 4} Q480,${ground - 6} 960,${ground + 4} T1920,${ground + 2}`} fill="none" {...sk} strokeWidth={4} />
      {[100, 520, 900, 1500, 1800].map((x, i) => (
        <path key={i} d={`M${x},${ground + 30 + (i % 2) * 20} l30,-6 m20,10 l25,-4`} {...sk} strokeWidth={2} opacity={0.6} />
      ))}
    </g>
  );
};
