import React from "react";
import { AbsoluteFill } from "remotion";
import { SceneShell } from "./SceneShell";
import { SceneProps } from "./index";
import { useSectionLines } from "../lib/time";
import { FilmLook } from "../components/FilmLook";
import { Handwriting, NotebookPage } from "../components/Notebook";
import { RedPencilSvg } from "../components/Figure";
import { RUBIK } from "../lib/fonts";
import { clamp, eio, ip } from "../lib/anim";

/** Scene 0: film leader countdown 3-2-1, then "История одного мальчика" on a notebook page. */
export const S0Intro: React.FC<SceneProps> = (props) => (
  <SceneShell section="intro" {...props}>
    <Intro />
  </SceneShell>
);

const Intro: React.FC = () => {
  const { frame, total } = useSectionLines("intro");
  const cd = Math.round(total * 0.5); // countdown part
  const step = cd / 3;
  const n = 3 - Math.min(2, Math.floor(frame / step));
  const local = (frame % step) / step;
  const pageIn = ip(frame, [cd - 6, cd + 8], [0, 1]);
  const writeA = cd + 10;
  const writeB = Math.round(total * 0.8);
  const ulA = writeB + 2;
  const ulB = total - 6;
  const ul = ip(frame, [ulA, ulB], [0, 1], eio);
  const textW = "История одного мальчика".length * 130 * 0.42;
  const ulPath = `M${960 - textW / 2},640 C${960 - textW / 4},655 ${960},628 ${960 + textW / 4},646 S${960 + textW / 2 + 20},634 ${960 + textW / 2 + 30},642`;
  // pencil tip follows the underline
  const ux = 960 - textW / 2 + (textW + 30) * ul;
  const uy = 640 + Math.sin(ul * Math.PI * 2) * 8;
  return (
    <AbsoluteFill style={{ background: "#1b140b" }}>
      {pageIn < 1 && (
        <AbsoluteFill style={{ background: "radial-gradient(circle, #6b5636 0%, #2a2012 75%)", opacity: 1 - pageIn }}>
          <svg viewBox="0 0 1920 1080" style={{ width: "100%", height: "100%" }}>
            <circle cx={960} cy={540} r={380} fill="none" stroke="#e9dcc0" strokeWidth={6} />
            <circle cx={960} cy={540} r={330} fill="none" stroke="#e9dcc0" strokeWidth={3} />
            <line x1={960} y1={0} x2={960} y2={1080} stroke="#e9dcc0" strokeWidth={3} />
            <line x1={0} y1={540} x2={1920} y2={540} stroke="#e9dcc0" strokeWidth={3} />
            {/* sweeping hand */}
            <path
              d={`M960,540 L960,160 A380,380 0 ${local > 0.5 ? 1 : 0} 1 ${960 + Math.sin(local * Math.PI * 2) * 380},${540 - Math.cos(local * Math.PI * 2) * 380} Z`}
              fill="#e9dcc0"
              opacity={0.28}
            />
            <text x={960} y={540} dy={0.33 * 400} textAnchor="middle" fontFamily={RUBIK} fontWeight={900} fontSize={400} fill="#f5ecd6">
              {n}
            </text>
          </svg>
        </AbsoluteFill>
      )}
      {pageIn > 0 && (
        <AbsoluteFill style={{ opacity: pageIn }}>
          <NotebookPage>
            <Handwriting text="История одного мальчика" x={960} y={580} size={130} progress={ip(frame, [writeA, writeB], [0, 1])} />
            <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              <path d={ulPath} fill="none" stroke="#DC2626" strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ul} />
              {frame >= ulA - 4 && <RedPencilSvg x={ux - 85} y={uy - 147} len={170} angle={-30} />}
            </svg>
          </NotebookPage>
        </AbsoluteFill>
      )}
      <FilmLook frame={frame} strength={1 - pageIn * 0.6} />
    </AbsoluteFill>
  );
};
