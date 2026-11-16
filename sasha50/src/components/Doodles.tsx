import React from "react";
import { clamp, rand } from "../lib/anim";
import { Star } from "./Figure";

export const heartPath = (s: number) =>
  `M0,${s * 0.3} C${-s * 0.05},${s * 0.25} ${-s * 0.5},${-s * 0.05} ${-s * 0.5},${-s * 0.3} C${-s * 0.5},${-s * 0.55} ${-s * 0.15},${-s * 0.62} 0,${-s * 0.35} C${s * 0.15},${-s * 0.62} ${s * 0.5},${-s * 0.55} ${s * 0.5},${-s * 0.3} C${s * 0.5},${-s * 0.05} ${s * 0.05},${s * 0.25} 0,${s * 0.3} Z`;

export const Heart: React.FC<{ x: number; y: number; s: number; fill?: string; stroke?: string; sw?: number; rot?: number; opacity?: number; scale?: number }> = ({
  x,
  y,
  s,
  fill = "#FF6B6B",
  stroke = "#7f1d1d",
  sw = 3,
  rot = 0,
  opacity = 1,
  scale = 1,
}) => <path d={heartPath(s)} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" transform={`translate(${x},${y}) rotate(${rot}) scale(${scale})`} opacity={opacity} />;

/** hand-drawn hearts and stars popping around a point */
export const PopDoodles: React.FC<{ frame: number; at: number; cx: number; cy: number; r: number; count?: number; seed?: number }> = ({ frame, at, cx, cy, r, count = 9, seed = 3 }) => {
  const out: React.ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const t = frame - at - i * 4;
    if (t < 0) continue;
    const a = (i / count) * Math.PI * 2 + rand(seed + i) * 0.6;
    const pop = clamp(t / 8);
    const sc = pop < 1 ? pop * 1.3 : 1 + Math.sin(t * 0.25 + i) * 0.08;
    const dist = r * (0.8 + rand(seed + i * 3) * 0.4) + t * 0.6;
    const x = cx + Math.cos(a) * dist;
    const y = cy + Math.sin(a) * dist * 0.85;
    const op = clamp(1 - (t - 50) / 20);
    out.push(
      i % 2 ? (
        <Heart key={i} x={x} y={y} s={36} fill="none" stroke="#DC2626" sw={4} scale={sc} opacity={op} rot={rand(i) * 30 - 15} />
      ) : (
        <g key={i} opacity={op}>
          <Star x={x} y={y} r={20 * sc} fill="none" stroke="#2563EB" sw={3.5} rot={t * 2} />
        </g>
      ),
    );
  }
  return <g>{out}</g>;
};

/** Spark trail behind a moving point. pos(f) gives the point at local frame f. */
export const SparkTrail: React.FC<{ frame: number; from: number; to: number; pos: (f: number) => { x: number; y: number }; colors?: string[]; length?: number }> = ({
  frame,
  from,
  to,
  pos,
  colors = ["#F59E0B", "#EF4444", "#FDE047"],
  length = 26,
}) => {
  const out: React.ReactNode[] = [];
  for (let k = 0; k < length; k++) {
    const f = frame - k;
    if (f < from || f > to) continue;
    const p = pos(f);
    for (let j = 0; j < 3; j++) {
      const sd = f * 7 + j * 13;
      const life = k / length;
      const dx = (rand(sd) - 0.5) * 60 * life;
      const dy = (rand(sd + 1) - 0.5) * 60 * life + k * 1.5;
      const s = (1 - life) * (10 + rand(sd + 2) * 10);
      out.push(<Star key={k + "-" + j} x={p.x + dx} y={p.y + dy} r={s} fill={colors[(k + j) % colors.length]} rot={f * 9} />);
    }
  }
  return <g>{out}</g>;
};

/** Firework bursts. Each burst: [frame, x, y, colorIndex] */
export const Fireworks: React.FC<{ frame: number; bursts: [number, number, number, number][]; colors?: string[] }> = ({ frame, bursts, colors = ["#E8B04B", "#2EC4B6", "#FF6B6B", "#FFFFFF"] }) => (
  <g>
    {bursts.map(([at, x, y, ci], b) => {
      const t = frame - at;
      if (t < -20 || t > 55) return null;
      if (t < 0) {
        // rocket going up
        const ry = y + 420 * (-t / 20);
        return <circle key={b} cx={x} cy={ry} r={4} fill="#fff" opacity={0.9} />;
      }
      const c = colors[ci % colors.length];
      const n = 26;
      const op = clamp(1 - t / 55);
      const rr = 180 * (1 - Math.pow(0.92, t));
      return (
        <g key={b} opacity={op}>
          {Array.from({ length: n }).map((_, i) => {
            const a = (i / n) * Math.PI * 2;
            const x2 = x + Math.cos(a) * rr;
            const y2 = y + Math.sin(a) * rr + t * t * 0.03;
            const x1 = x + Math.cos(a) * rr * 0.7;
            const y1 = y + Math.sin(a) * rr * 0.7 + t * t * 0.025;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={4} strokeLinecap="round" />;
          })}
          <circle cx={x} cy={y} r={rr * 0.25} fill={c} opacity={0.15} />
        </g>
      );
    })}
  </g>
);
