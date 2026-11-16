import React from "react";

/** Simple stylised world map in an equirectangular 1000x500 space. */
export const proj = (lon: number, lat: number) => ({ x: ((lon + 180) / 360) * 1000, y: ((90 - lat) / 180) * 500 });

const poly = (pts: [number, number][]) =>
  pts.map(([lo, la], i) => {
    const p = proj(lo, la);
    return `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(" ") + " Z";

const LAND: [number, number][][] = [
  // North America
  [[-168, 66], [-140, 70], [-100, 72], [-80, 72], [-62, 60], [-55, 50], [-66, 44], [-75, 35], [-81, 25], [-82, 30], [-90, 29], [-97, 26], [-97, 20], [-90, 15], [-83, 9], [-78, 8], [-85, 12], [-105, 20], [-112, 30], [-118, 34], [-124, 40], [-124, 48], [-135, 58], [-150, 60], [-165, 60]],
  // Greenland
  [[-55, 60], [-42, 60], [-20, 70], [-20, 80], [-40, 83], [-60, 80], [-70, 77], [-55, 68]],
  // South America
  [[-80, 8], [-75, 11], [-62, 11], [-50, 0], [-35, -5], [-38, -13], [-40, -22], [-48, -27], [-58, -38], [-65, -42], [-68, -52], [-72, -53], [-74, -45], [-72, -30], [-71, -18], [-77, -12], [-81, -5], [-80, 0]],
  // Eurasia
  [[-10, 36], [-9, 43], [-2, 44], [-5, 48], [2, 51], [5, 53], [8, 57], [5, 62], [15, 69], [25, 71], [40, 68], [45, 68], [60, 70], [70, 73], [80, 73], [100, 77], [110, 74], [130, 72], [140, 72], [160, 70], [180, 68], [180, 65], [170, 60], [160, 58], [156, 51], [142, 52], [140, 46], [135, 43], [130, 42], [126, 38], [122, 40], [121, 31], [118, 24], [110, 20], [108, 16], [109, 12], [105, 9], [100, 13], [98, 8], [103, 1.5], [100, 6], [98, 16], [94, 17], [92, 22], [88, 22], [80, 15], [77, 8], [73, 20], [67, 25], [60, 23], [57, 26], [56, 24], [52, 24], [50, 27], [48, 30], [50, 25], [52, 17], [44, 12], [39, 22], [35, 28], [34, 31], [36, 36], [28, 37], [26, 40], [23, 37], [20, 40], [15, 45], [13, 38], [16, 38], [18, 40], [12, 44], [8, 44], [3, 43], [0, 38], [-6, 36]],
  // Africa
  [[-17, 21], [-17, 15], [-12, 7], [-5, 5], [5, 5], [9, 4], [10, -2], [13, -12], [12, -18], [15, -27], [18, -34], [25, -34], [32, -28], [35, -22], [40, -15], [40, -5], [44, 0], [51, 11], [43, 12], [38, 18], [33, 28], [32, 31], [20, 32], [10, 37], [0, 36], [-6, 36], [-10, 30], [-15, 27]],
  // Australia
  [[114, -22], [122, -18], [130, -12], [137, -12], [142, -11], [146, -18], [153, -26], [151, -34], [145, -38], [138, -35], [130, -32], [115, -34], [114, -28]],
  // UK
  [[-5, 50], [1, 51], [-1, 55], [-3, 58.5], [-6, 57], [-4, 54]],
  // Japan
  [[130, 31], [135, 34], [140, 36], [142, 40], [141, 45], [139, 40], [134, 35]],
  // Borneo, Sumatra, Madagascar, New Zealand
  [[109, 2], [117, 7], [119, 1], [116, -4], [110, -3]],
  [[95, 5.5], [98, 4], [106, -6], [104, -5.5], [100, -1]],
  [[44, -25], [47, -25], [50, -15], [49, -12], [44, -17]],
  [[172, -35], [178, -38], [174, -42], [167, -46], [172, -41]],
];

export const LAND_PATHS = LAND.map(poly);

export type StopId = "europe" | "russia" | "singapore" | "dubai";
export const STOPS: Record<StopId, { x: number; y: number; label: string }> = {
  europe: { ...proj(4, 49), label: "ЕВРОПА" },
  russia: { ...proj(37.6, 55.7), label: "РОССИЯ" },
  singapore: { ...proj(103.8, 1.3), label: "СИНГАПУР" },
  dubai: { ...proj(55.3, 25.2), label: "ДУБАЙ" },
};
export const ROUTE: StopId[] = ["europe", "russia", "singapore", "dubai"];

/** control point of the arc between two points (arcs bend upward) */
export const arcCtrl = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const d = Math.hypot(b.x - a.x, b.y - a.y);
  return { x: mx, y: my - d * 0.35 };
};
export const qPoint = (a: { x: number; y: number }, c: { x: number; y: number }, b: { x: number; y: number }, t: number) => ({
  x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x,
  y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y,
});
export const qAngle = (a: { x: number; y: number }, c: { x: number; y: number }, b: { x: number; y: number }, t: number) => {
  const dx = 2 * (1 - t) * (c.x - a.x) + 2 * t * (b.x - c.x);
  const dy = 2 * (1 - t) * (c.y - a.y) + 2 * t * (b.y - c.y);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};

/** Map drawing only (use inside an <svg viewBox="0 0 1000 500">). */
export const WorldMapShapes: React.FC<{ land?: string; ocean?: string; grid?: string; opacity?: number }> = ({
  land = "#F8FAFC",
  ocean = "#1E3A8A",
  grid = "rgba(255,255,255,0.08)",
  opacity = 1,
}) => (
  <g opacity={opacity}>
    <rect x={-500} y={-300} width={2000} height={1100} fill={ocean} />
    {Array.from({ length: 19 }).map((_, i) => (
      <line key={"v" + i} x1={i * 55.5} y1={-300} x2={i * 55.5} y2={800} stroke={grid} strokeWidth={1} />
    ))}
    {Array.from({ length: 11 }).map((_, i) => (
      <line key={"h" + i} x1={-500} y1={i * 50} x2={1500} y2={i * 50} stroke={grid} strokeWidth={1} />
    ))}
    {LAND_PATHS.map((d, i) => (
      <path key={i} d={d} fill={land} stroke="rgba(30,58,138,0.35)" strokeWidth={1.2} strokeLinejoin="round" />
    ))}
  </g>
);

/** small airplane pointing right, centred at 0,0 */
export const PlaneIcon: React.FC<{ x: number; y: number; angle: number; s?: number; color?: string }> = ({ x, y, angle, s = 1, color = "#F97316" }) => (
  <g transform={`translate(${x},${y}) rotate(${angle}) scale(${s})`}>
    <path d="M14,0 C14,-2 10,-3 6,-3 L-2,-3 L-8,-13 L-12,-13 L-8,-3 L-12,-3 L-15,-8 L-18,-8 L-16,0 L-18,8 L-15,8 L-12,3 L-8,3 L-12,13 L-8,13 L-2,3 L6,3 C10,3 14,2 14,0 Z" fill={color} stroke="#fff" strokeWidth={1.4} strokeLinejoin="round" />
  </g>
);
