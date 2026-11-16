import React from "react";
import { Img } from "remotion";
import { CAVEAT } from "../lib/fonts";
import { clamp, lerp, rand } from "../lib/anim";

const noiseUrl = (seed: number) =>
  `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='${seed}' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.25  0 0 0 0 0.2  0 0 0 0 0.12  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`,
  )}")`;
const NOISE = [1, 2, 3, 4].map(noiseUrl);

export type PolaroidProps = {
  src: string | null;
  x: number; // centre, px
  y: number;
  width: number;
  /** fixed seed -> deterministic tilt between -6 and +6 degrees and pan direction */
  seed: number;
  tilt?: number; // overrides seeded tilt
  /** 0..1 over the time the photo is on screen; drives the Ken Burns move */
  kb?: number;
  sepia?: boolean;
  frame?: number; // for animated grain
  scale?: number;
  opacity?: number;
  glow?: number; // 0..1 golden glow
  caption?: string;
  captionFont?: string;
  aspect?: number; // photo area height / width
  zIndex?: number;
};

export const seededTilt = (seed: number) => lerp(-6, 6, rand(seed * 7.13));

export const Polaroid: React.FC<PolaroidProps> = ({
  src,
  x,
  y,
  width,
  seed,
  tilt,
  kb = 0.5,
  sepia,
  frame = 0,
  scale = 1,
  opacity = 1,
  glow = 0,
  caption,
  captionFont,
  aspect = 0.86,
  zIndex,
}) => {
  const rot = tilt ?? seededTilt(seed);
  const pad = width * 0.055;
  const inner = width - pad * 2;
  const ih = inner * aspect;
  const bottom = caption ? width * 0.24 : width * 0.17;
  const h = pad + ih + bottom;
  const k = clamp(kb);
  const zoom = 1 + 0.08 * k;
  const pa = rand(seed * 3.7) * Math.PI * 2;
  const panX = Math.cos(pa) * 2.5 * k;
  const panY = Math.sin(pa) * 2.5 * k;
  return (
    <div
      style={{
        position: "absolute",
        left: x - width / 2,
        top: y - h / 2,
        width,
        height: h,
        background: "#fdfdf8",
        padding: pad,
        paddingBottom: bottom,
        boxSizing: "border-box",
        transform: `rotate(${rot}deg) scale(${scale})`,
        opacity,
        zIndex,
        boxShadow: `0 ${width * 0.03}px ${width * 0.08}px rgba(0,0,0,0.38)${glow > 0 ? `, 0 0 ${width * 0.25 * glow}px ${width * 0.06 * glow}px rgba(232,176,75,${0.85 * glow})` : ""}`,
        borderRadius: 3,
      }}
    >
      <div style={{ width: inner, height: ih, overflow: "hidden", position: "relative", background: "#d9d2c3" }}>
        {src ? (
          <Img
            src={src}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${zoom}) translate(${panX}%, ${panY}%)`,
              filter: sepia ? "sepia(0.85) contrast(1.05) brightness(0.97) saturate(0.9)" : "saturate(1.08) contrast(1.03)",
            }}
          />
        ) : (
          <Placeholder w={inner} h={ih} sepia={sepia} />
        )}
        {sepia && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: NOISE[Math.floor(frame / 2) % 4],
              mixBlendMode: "multiply",
              opacity: 0.3,
            }}
          />
        )}
        {sepia && <div style={{ position: "absolute", inset: 0, boxShadow: `inset 0 0 ${inner * 0.12}px rgba(60,40,10,0.3)` }} />}
      </div>
      {caption && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: bottom * 0.18,
            textAlign: "center",
            fontFamily: captionFont ?? CAVEAT,
            fontSize: bottom * 0.5,
            color: "#2b2b3a",
          }}
        >
          {caption}
        </div>
      )}
    </div>
  );
};

const Placeholder: React.FC<{ w: number; h: number; sepia?: boolean }> = ({ w, h, sepia }) => (
  <div
    style={{
      width: w,
      height: h,
      background: sepia ? "linear-gradient(135deg,#e7d8b8,#cdb88f)" : "linear-gradient(135deg,#e5e7eb,#cbd5e1)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: h * 0.05,
    }}
  >
    <svg width={w * 0.3} height={w * 0.22} viewBox="0 0 60 44">
      <rect x="2" y="9" width="56" height="33" rx="6" fill="none" stroke="#6b6355" strokeWidth="3" />
      <path d="M18 9 l5 -6 h14 l5 6" fill="none" stroke="#6b6355" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="30" cy="25" r="10" fill="none" stroke="#6b6355" strokeWidth="3" />
    </svg>
    <div style={{ fontFamily: CAVEAT, fontSize: Math.max(14, w * 0.11), color: "#5b5346", fontWeight: 700 }}>фото скоро будет</div>
  </div>
);
