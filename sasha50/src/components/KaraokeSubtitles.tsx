import React from "react";
import { AbsoluteFill } from "remotion";
import { RUBIK } from "../lib/fonts";
import { ip } from "../lib/anim";
import { useSectionLines } from "../lib/time";
import { SectionId } from "../timings";

/**
 * Karaoke line at the bottom: white text on a dark translucent bar, filled
 * with gold from left to right while the line is sung.
 */
export const KaraokeSubtitles: React.FC<{ section: SectionId }> = ({ section }) => {
  const { L, frame } = useSectionLines(section);
  const cur = L.findIndex((l, i) => frame >= l.from - 8 && frame < (L[i + 1] ? Math.min(L[i + 1].from - 8, l.to + 18) : l.to + 18));
  if (cur < 0) return null;
  const l = L[cur];
  const appear = ip(frame, [l.from - 8, l.from + 2], [0, 1]);
  const leave = ip(frame, [l.to + 6, l.to + 18], [1, 0]);
  const nextStart = L[cur + 1] ? L[cur + 1].from - 8 : Infinity;
  const op = Math.min(appear, frame >= nextStart ? 0 : leave);
  const fill = ip(frame, [l.from, l.to], [0, 100]);
  const text = l.text;
  const base: React.CSSProperties = {
    fontFamily: RUBIK,
    fontWeight: 500,
    fontSize: 54,
    lineHeight: 1.1,
    whiteSpace: "nowrap",
    letterSpacing: 0.5,
  };
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 46, pointerEvents: "none" }}>
      <div
        style={{
          opacity: op,
          transform: `translateY(${(1 - appear) * 16}px)`,
          background: "rgba(8,10,24,0.62)",
          borderRadius: 18,
          padding: "16px 38px 20px",
          backdropFilter: "blur(2px)",
          position: "relative",
        }}
      >
        <div style={{ ...base, color: "#ffffff" }}>{text}</div>
        <div
          style={{
            ...base,
            color: "#E8B04B",
            position: "absolute",
            left: 38,
            top: 16,
            clipPath: `inset(-10px ${100 - fill}% -10px -10px)`,
            textShadow: "0 0 18px rgba(232,176,75,0.55)",
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
