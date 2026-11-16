import React from "react";
import { AbsoluteFill } from "remotion";
import { CAVEAT } from "../lib/fonts";
import { clamp } from "../lib/anim";
import { RedPencilSvg } from "./Figure";

/** Cream graph-paper notebook page with blue grid and a red margin. */
export const NotebookPage: React.FC<{ sepia?: number; children?: React.ReactNode; grid?: number; style?: React.CSSProperties }> = ({ sepia = 0.25, children, grid = 40, style }) => (
  <AbsoluteFill
    style={{
      background: "#FBF5E6",
      backgroundImage: `linear-gradient(rgba(70,120,200,0.28) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(70,120,200,0.28) 1.5px, transparent 1.5px)`,
      backgroundSize: `${grid}px ${grid}px`,
      backgroundPosition: "-1px 18px",
      ...style,
    }}
  >
    <div style={{ position: "absolute", top: 0, bottom: 0, left: 150, width: 3, background: "rgba(220,38,38,0.55)" }} />
    {children}
    <div style={{ position: "absolute", inset: 0, background: `rgba(160,110,40,${0.12 * sepia * 4})`, mixBlendMode: "multiply", pointerEvents: "none" }} />
    <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 220px rgba(120,80,20,0.35)", pointerEvents: "none" }} />
  </AbsoluteFill>
);

/** SVG filter for the hand-drawn "line boil" wobble. Put once inside an <svg>. */
export const SketchFilter: React.FC<{ frame: number; id?: string; scale?: number }> = ({ frame, id = "sketch", scale = 3 }) => (
  <defs>
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={Math.floor(frame / 4) % 6} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={scale} xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
);

/**
 * Handwritten line that appears letter by letter, with the red pencil
 * following the writing. progress 0..1.
 */
export const Handwriting: React.FC<{
  text: string;
  x: number;
  y: number;
  size: number;
  progress: number;
  color?: string;
  pencil?: boolean;
  weight?: number;
  align?: "left" | "center";
}> = ({ text, x, y, size, progress, color = "#1f2a5a", pencil = true, weight = 700, align = "center" }) => {
  const p = clamp(progress);
  const estW = text.length * size * 0.42;
  const left = align === "center" ? x - estW / 2 : x;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left,
          top: y - size * 0.7,
          width: estW + size,
          fontFamily: CAVEAT,
          fontWeight: weight,
          fontSize: size,
          color,
          whiteSpace: "nowrap",
          clipPath: `inset(-20% ${100 - p * 100}% -40% -5%)`,
        }}
      >
        {text}
      </div>
      {pencil && p > 0 && p < 1 && (
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }} viewBox="0 0 1920 1080">
          <RedPencilSvg x={left + (estW + size) * p - 85} y={y - 147 + Math.sin(p * 60) * 6} len={170} angle={-30} />
        </svg>
      )}
    </>
  );
};
