import React from "react";
import { AbsoluteFill } from "remotion";
import { rand } from "../lib/anim";

/** Old film: grain, scratches, dust, flicker, vignette. */
export const FilmLook: React.FC<{ frame: number; strength?: number }> = ({ frame, strength = 1 }) => {
  const flick = 0.06 + rand(frame * 1.3) * 0.12;
  const scratches = [0, 1, 2].map((i) => ({
    on: rand(frame * 3 + i) > 0.45,
    x: rand(Math.floor(frame / 3) * 11 + i) * 1920,
  }));
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: strength }}>
      <svg viewBox="0 0 480 270" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", mixBlendMode: "multiply", opacity: 0.55 }}>
        <filter id="filmgrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 9} />
          <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.24  0 0 0 0 0.15  0 0 0 0.9 0" />
        </filter>
        <rect width="480" height="270" filter="url(#filmgrain)" />
      </svg>
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {scratches.map((s, i) => (s.on ? <line key={i} x1={s.x} y1={0} x2={s.x + (rand(i + frame) - 0.5) * 30} y2={1080} stroke="#2a1f10" strokeOpacity={0.45} strokeWidth={1.5 + rand(i) * 2} /> : null))}
        {Array.from({ length: 6 }).map((_, i) => {
          const sd = frame * 17 + i * 5;
          if (rand(sd) < 0.5) return null;
          return <circle key={i} cx={rand(sd + 1) * 1920} cy={rand(sd + 2) * 1080} r={1.5 + rand(sd + 3) * 4} fill="#1a1208" opacity={0.6} />;
        })}
      </svg>
      <AbsoluteFill style={{ background: `rgba(255,240,200,${flick})`, mixBlendMode: "overlay" }} />
      <AbsoluteFill style={{ boxShadow: "inset 0 0 260px rgba(20,10,0,0.75)" }} />
    </AbsoluteFill>
  );
};
