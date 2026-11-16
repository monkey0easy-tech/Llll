import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp } from "../lib/anim";
import { WorldMapShapes } from "./WorldMap";

export type TransitionKind = "flip" | "map" | "flash";

/**
 * Overlay that hides a hard cut. p goes 0..1 over the whole transition; the
 * cut underneath happens at p = 0.5 when the overlay covers the frame.
 */
export const TransitionOverlay: React.FC<{ kind: TransitionKind; p: number }> = ({ kind, p }) => {
  if (p <= 0 || p >= 1) return null;
  if (kind === "flash") {
    const a = p < 0.5 ? p / 0.5 : (1 - p) / 0.5;
    return (
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 45%, rgba(255,255,255,${a}) 0%, rgba(255,236,190,${a * 0.95}) ${20 + a * 50}%, rgba(232,176,75,${a * 0.8}) 100%)`,
        }}
      />
    );
  }
  if (kind === "flip") {
    // a notebook page turns over from right to left
    const ang = p < 0.5 ? -90 * (1 - p / 0.5) : 90 * ((p - 0.5) / 0.5);
    const cover = p < 0.5 ? clamp(p / 0.5) : 1 - clamp((p - 0.5) / 0.5);
    return (
      <AbsoluteFill style={{ perspective: 2400 }}>
        <AbsoluteFill style={{ background: `rgba(40,30,10,${cover * 0.35})` }} />
        <AbsoluteFill
          style={{
            transformOrigin: p < 0.5 ? "0% 50%" : "100% 50%",
            transform: p < 0.5 ? `rotateY(${ang}deg)` : `rotateY(${ang}deg)`,
            background: "#FBF5E6",
            backgroundImage:
              "linear-gradient(rgba(70,120,200,0.28) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(70,120,200,0.28) 1.5px, transparent 1.5px)",
            backgroundSize: "40px 40px",
            boxShadow: "0 0 80px rgba(0,0,0,0.45)",
          }}
        >
          <AbsoluteFill style={{ background: `linear-gradient(90deg, rgba(0,0,0,${0.25 * (1 - cover)}) 0%, transparent 40%)` }} />
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
  // map wipe: a diagonal band of map slides across
  const x = -2400 + p * 4800;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ position: "absolute", left: x, top: -400, width: 2600, height: 1900, transform: "rotate(14deg)", overflow: "hidden", boxShadow: "0 0 60px rgba(0,0,0,0.5)" }}>
        <svg viewBox="0 0 1000 500" width={2600 * 1.2} height={1300 * 1.2} style={{ position: "absolute", left: -200, top: 150, transform: "rotate(-14deg)" }}>
          <WorldMapShapes />
        </svg>
        <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: 26, background: "#F97316" }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 26, background: "#F97316" }} />
      </div>
    </AbsoluteFill>
  );
};
