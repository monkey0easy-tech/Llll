import React from "react";
import { rand } from "../lib/anim";

export const FESTIVE = ["#E8B04B", "#2EC4B6", "#FF6B6B", "#FFD166", "#ffffff"];

/**
 * Burst from a point (mode "burst", starts at `at`) or a continuous rain
 * (mode "rain"). Pure function of the frame, so renders are deterministic.
 */
export const Confetti: React.FC<{
  frame: number;
  at?: number;
  mode?: "burst" | "rain";
  count?: number;
  x?: number;
  y?: number;
  seed?: number;
  pulse?: number; // beat 0..1 -> slight scale
  colors?: string[];
  width?: number;
  height?: number;
}> = ({ frame, at = 0, mode = "burst", count = 140, x = 960, y = 540, seed = 1, pulse = 0, colors = FESTIVE, width = 1920, height = 1080 }) => {
  const t = frame - at;
  if (t < 0) return null;
  const items: React.ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const r1 = rand(seed * 100 + i);
    const r2 = rand(seed * 200 + i * 1.3);
    const r3 = rand(seed * 300 + i * 2.1);
    const r4 = rand(seed * 400 + i * 0.7);
    let px: number, py: number;
    if (mode === "burst") {
      const ang = r1 * Math.PI * 2;
      const v = 14 + r2 * 26;
      const drag = 0.94;
      const n = (1 - Math.pow(drag, t)) / (1 - drag);
      px = x + Math.cos(ang) * v * n + Math.sin(t * 0.1 + i) * 12;
      py = y + Math.sin(ang) * v * n - 4 * n + t * 2.6;
      if (py > height + 60) continue;
    } else {
      const speed = 2.2 + r2 * 3;
      const startY = -50 - r3 * height;
      py = (((startY + t * speed + 50) % (height + 100)) + height + 100) % (height + 100) - 50;
      px = r1 * width + Math.sin(t * 0.05 + i) * 30;
    }
    const s = (8 + r4 * 10) * (1 + pulse * 0.35);
    const rot = t * (4 + r3 * 10) * (r1 > 0.5 ? 1 : -1);
    const flipY = Math.abs(Math.cos(t * 0.15 + i));
    const c = colors[i % colors.length];
    items.push(
      r4 > 0.75 ? (
        <circle key={i} cx={px} cy={py} r={s * 0.4} fill={c} />
      ) : (
        <rect key={i} x={-s / 2} y={-s / 4} width={s} height={s / 2} fill={c} transform={`translate(${px},${py}) rotate(${rot}) scale(1,${0.3 + flipY * 0.7})`} />
      ),
    );
  }
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      {items}
    </svg>
  );
};
