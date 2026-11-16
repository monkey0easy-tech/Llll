import React from "react";
import { clamp } from "../lib/anim";

type P = { x: number; y: number };

/** Glowing friendship lines from a hub (or between neighbours) drawn by progress 0..1. */
export const FriendNetwork: React.FC<{ hub: P; nodes: P[]; progress: number; frame: number; mesh?: number; color?: string }> = ({
  hub,
  nodes,
  progress,
  frame,
  mesh = 0,
  color = "#FDE68A",
}) => {
  const n = nodes.length;
  return (
    <g>
      <defs>
        <filter id="netglow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#netglow)">
        {nodes.map((p, i) => {
          const local = clamp(progress * (n * 0.4 + 1) - i * 0.4);
          if (local <= 0) return null;
          const cx = (hub.x + p.x) / 2;
          const cy = Math.min(hub.y, p.y) - 60;
          const d = `M${hub.x},${hub.y} Q${cx},${cy} ${p.x},${p.y}`;
          const pulse = 0.6 + 0.4 * Math.sin(frame * 0.2 + i);
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - local} opacity={0.9} />
              {local >= 1 && <circle cx={p.x} cy={p.y} r={10 + pulse * 6} fill={color} opacity={0.5} />}
            </g>
          );
        })}
        {mesh > 0 &&
          nodes.map((p, i) => {
            const q = nodes[(i + 1) % n];
            const local = clamp(mesh * n - i);
            return (
              <line key={"m" + i} x1={p.x} y1={p.y} x2={p.x + (q.x - p.x) * local} y2={p.y + (q.y - p.y) * local} stroke={color} strokeWidth={3} opacity={0.7} strokeLinecap="round" />
            );
          })}
        <circle cx={hub.x} cy={hub.y} r={14} fill={color} opacity={clamp(progress * 5)} />
      </g>
    </g>
  );
};
