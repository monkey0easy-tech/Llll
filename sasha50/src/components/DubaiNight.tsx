import React from "react";
import { rand } from "../lib/anim";

/** Dubai at night: sky, stars, skyline with one very tall tower, water reflection. */
type B = { x: number; w: number; h: number; top?: "flat" | "spire" | "slant" | "round" };
const BUILDINGS: B[] = [
  { x: 40, w: 90, h: 210 },
  { x: 140, w: 70, h: 300, top: "spire" },
  { x: 220, w: 110, h: 250, top: "slant" },
  { x: 345, w: 80, h: 380, top: "spire" },
  { x: 440, w: 120, h: 290 },
  { x: 575, w: 70, h: 420, top: "round" },
  { x: 660, w: 95, h: 330, top: "slant" },
  { x: 770, w: 80, h: 470, top: "spire" },
  { x: 870, w: 120, h: 360 },
  // the tall tower is drawn separately around x = 1080
  { x: 1180, w: 90, h: 440, top: "spire" },
  { x: 1285, w: 110, h: 340, top: "round" },
  { x: 1410, w: 80, h: 400, top: "slant" },
  { x: 1505, w: 120, h: 280 },
  { x: 1640, w: 70, h: 360, top: "spire" },
  { x: 1725, w: 100, h: 250 },
  { x: 1835, w: 85, h: 320, top: "slant" },
];

export const TOWER_X = 1080;

const towerPath = (cx: number, ground: number, height: number) => {
  // stepped needle tower
  const steps = [
    [70, 0], [58, 0.18], [46, 0.34], [36, 0.5], [26, 0.64], [17, 0.76], [10, 0.86], [4, 0.94], [1.5, 1],
  ];
  let left = "";
  let right = "";
  steps.forEach(([hw, t], i) => {
    const y = ground - height * t;
    const yn = i + 1 < steps.length ? ground - height * steps[i + 1][1] : y;
    left = `L${cx - hw},${y} L${cx - hw},${yn} ` + left;
    right += `L${cx + hw},${y} L${cx + hw},${yn} `;
  });
  return `M${cx - 70},${ground} ${right} L${cx},${ground - height - 30} ${left.replace(/^L/, "L")} Z`;
};

const Skyline: React.FC<{ ground: number; frame: number; windows?: boolean; color?: string; tower?: number }> = ({ ground, frame, windows = true, color = "#0a0f24", tower = 820 }) => {
  const els: React.ReactNode[] = [];
  BUILDINGS.forEach((b, i) => {
    const top = ground - b.h;
    let d = `M${b.x},${ground} L${b.x},${top} `;
    if (b.top === "spire") d += `L${b.x + b.w / 2 - 4},${top} L${b.x + b.w / 2},${top - 60} L${b.x + b.w / 2 + 4},${top} `;
    if (b.top === "slant") d = `M${b.x},${ground} L${b.x},${top + 40} L${b.x + b.w},${top - 10} `;
    if (b.top === "round") d += `Q${b.x + b.w / 2},${top - 70} ${b.x + b.w},${top} `;
    d += `L${b.x + b.w},${top} L${b.x + b.w},${ground} Z`;
    els.push(<path key={"b" + i} d={d} fill={color} />);
    if (windows) {
      const cols = Math.floor(b.w / 18);
      const rows = Math.floor((b.h - 30) / 22);
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const seed = i * 1000 + r * 31 + c;
          const on = rand(seed) > 0.45;
          if (!on) continue;
          const tw = 0.55 + 0.45 * Math.sin(frame * 0.05 * (0.5 + rand(seed + 7)) + seed);
          els.push(
            <rect key={`w${i}-${r}-${c}`} x={b.x + 6 + c * 18} y={top + 18 + r * 22} width={8} height={10} fill={rand(seed + 3) > 0.8 ? "#2EC4B6" : "#E8B04B"} opacity={0.35 + 0.6 * tw} />,
          );
        }
    }
  });
  els.push(<path key="tower" d={towerPath(TOWER_X, ground, tower)} fill={color} />);
  if (windows) {
    for (let k = 0; k < 40; k++) {
      const t = k / 40;
      const y = ground - tower * t * 0.94;
      const hw = 64 * (1 - t) + 4;
      const blink = 0.5 + 0.5 * Math.sin(frame * 0.12 - k * 0.5);
      els.push(<rect key={"tl" + k} x={TOWER_X - hw * 0.6} y={y - 8} width={hw * 1.2} height={3} fill="#E8B04B" opacity={0.25 + blink * 0.55} />);
    }
    const beacon = 0.5 + 0.5 * Math.sin(frame * 0.3);
    els.push(<circle key="beacon" cx={TOWER_X} cy={ground - tower - 30} r={5 + beacon * 4} fill="#FF6B6B" opacity={0.6 + beacon * 0.4} />);
  }
  return <g>{els}</g>;
};

export const DubaiNight: React.FC<{ frame: number; ground?: number; showWater?: boolean; children?: React.ReactNode; dim?: number }> = ({ frame, ground = 760, showWater = true, children, dim = 0 }) => (
  <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
    <defs>
      <linearGradient id="dnSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#050818" />
        <stop offset="0.6" stopColor="#0B1026" />
        <stop offset="1" stopColor="#23285a" />
      </linearGradient>
      <linearGradient id="dnWater" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0f1a3e" />
        <stop offset="1" stopColor="#050818" />
      </linearGradient>
      <radialGradient id="dnGlow" cx="0.56" cy="0.7" r="0.5">
        <stop offset="0" stopColor="#E8B04B" stopOpacity="0.25" />
        <stop offset="1" stopColor="#E8B04B" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width={1920} height={1080} fill="url(#dnSky)" />
    {Array.from({ length: 120 }).map((_, i) => {
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.04 + i * 1.7));
      return <circle key={i} cx={rand(i) * 1920} cy={rand(i + 500) * (ground - 200)} r={0.8 + rand(i + 900) * 1.8} fill="#fff" opacity={tw * 0.8} />;
    })}
    <rect width={1920} height={1080} fill="url(#dnGlow)" />
    <Skyline ground={ground} frame={frame} />
    {showWater && (
      <g>
        <rect y={ground} width={1920} height={1080 - ground} fill="url(#dnWater)" />
        <g transform={`translate(0,${ground * 2}) scale(1,-1)`} opacity={0.32}>
          <Skyline ground={ground} frame={frame} />
        </g>
        {Array.from({ length: 26 }).map((_, i) => {
          const y = ground + 12 + i * 12;
          const off = Math.sin(frame * 0.06 + i) * 40;
          return <line key={i} x1={rand(i + 40) * 1500 + off} y1={y} x2={rand(i + 40) * 1500 + 200 + off} y2={y} stroke="#E8B04B" strokeOpacity={0.18} strokeWidth={2} />;
        })}
        <rect y={ground} width={1920} height={4} fill="#E8B04B" opacity={0.25} />
      </g>
    )}
    {dim > 0 && <rect width={1920} height={1080} fill="#000" opacity={dim} />}
    {children}
  </svg>
);
