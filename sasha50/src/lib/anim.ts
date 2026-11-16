import { Easing, interpolate, spring } from "remotion";
import { FPS } from "../timings";

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** interpolate with clamping on both sides */
export const ip = (f: number, input: number[], output: number[], ease?: (t: number) => number) =>
  interpolate(f, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

export const eio = Easing.inOut(Easing.cubic);
export const eo = Easing.out(Easing.cubic);
export const ei = Easing.in(Easing.cubic);
export const eBack = Easing.out(Easing.back(1.7));

/** spring that starts at local frame `at` */
export const sp = (frame: number, at: number, cfg: { damping?: number; stiffness?: number; mass?: number } = {}) =>
  frame < at ? 0 : spring({ frame: frame - at, fps: FPS, config: { damping: 12, stiffness: 120, mass: 1, ...cfg } });

/** fade-in at a, fade-out at b, with length d (frames) */
export const fadeWin = (f: number, a: number, b: number, d = 8) =>
  Math.min(ip(f, [a, a + d], [0, 1]), ip(f, [b - d, b], [1, 0]));

/** deterministic pseudo-random in [0,1) */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
export const randRange = (seed: number, a: number, b: number) => a + rand(seed) * (b - a);

/** cheap smooth noise for idle wobble */
export const wobble = (f: number, seed = 0, speed = 0.08) =>
  Math.sin(f * speed + seed * 1.7) * 0.6 + Math.sin(f * speed * 2.3 + seed * 3.1) * 0.4;
