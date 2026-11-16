import React from "react";
import { AbsoluteFill } from "remotion";
import { RUBIK } from "../lib/fonts";
import { clamp, ip, sp } from "../lib/anim";

/**
 * "САНЯ" and "САША" fly in from opposite sides, collide in the centre and
 * bounce on a spring. `dock` (frame) moves the pair up to the top as a header.
 */
export const ChorusTitle: React.FC<{ frame: number; at: number; dock?: number; leave?: number; pulse?: number; y?: number; color?: string; outline?: string }> = ({
  frame,
  at,
  dock,
  leave,
  pulse = 0,
  y = 470,
  color = "#E8B04B",
  outline = "#7c2d12",
}) => {
  const t = frame - at;
  if (t < 0) return null;
  const fly = ip(t, [0, 12], [0, 1], (x) => x * x);
  const bounce = sp(frame, at + 12, { damping: 7, stiffness: 160 });
  const squash = t >= 12 ? 1 - Math.sin(clamp((t - 12) / 10) * Math.PI) * 0.18 * (1 - clamp((t - 12) / 20)) : 1;
  const gap = 70;
  const dk = dock !== undefined ? sp(frame, dock, { damping: 16, stiffness: 90 }) : 0;
  const lv = leave !== undefined ? ip(frame, [leave, leave + 10], [1, 0]) : 1;
  const left = -1200 * (1 - fly) - (t >= 12 ? Math.sin(clamp((t - 12) / 12) * Math.PI) * 60 * (1 - clamp((t - 12) / 24)) : 0);
  const right = 1200 * (1 - fly) + (t >= 12 ? Math.sin(clamp((t - 12) / 12) * Math.PI) * 60 * (1 - clamp((t - 12) / 24)) : 0);
  const scale = (1 + pulse * 0.06) * (1 - dk * 0.55);
  const ty = y + (90 - y) * dk;
  const word = (w: string, dx: number, rot: number) => (
    <div
      style={{
        fontFamily: RUBIK,
        fontWeight: 900,
        fontSize: 210,
        color,
        WebkitTextStroke: `8px ${outline}`,
        paintOrder: "stroke fill",
        textShadow: `0 12px 0 ${outline}, 0 20px 40px rgba(0,0,0,0.35)`,
        transform: `translateX(${dx}px) rotate(${rot}deg) scaleX(${1 / squash}) scaleY(${squash})`,
        letterSpacing: 4,
        lineHeight: 1,
      }}
    >
      {w}
    </div>
  );
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: lv }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: ty - 115,
          display: "flex",
          justifyContent: "center",
          gap,
          transform: `scale(${scale})`,
          transformOrigin: `50% 115px`,
        }}
      >
        {word("САНЯ", left, -4)}
        {word("САША", right, 4)}
      </div>
    </AbsoluteFill>
  );
};
