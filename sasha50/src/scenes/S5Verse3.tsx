import React from "react";
import { AbsoluteFill } from "remotion";
import { SceneShell } from "./SceneShell";
import { SceneProps } from "./index";
import { useSectionLines } from "../lib/time";
import { Figure, pose } from "../components/Figure";
import { adultFriends, adultSasha, FRIEND_IDS, kidFriends, kidSasha, kidSashaUniform } from "../components/characters";
import { runPose } from "../components/poses";
import { NotebookPage, SketchFilter } from "../components/Notebook";
import { Courtyard } from "../components/Courtyard";
import { Heart } from "../components/Doodles";
import { Polaroid } from "../components/Polaroid";
import { LAND_PATHS } from "../components/WorldMap";
import { getPhotos } from "../lib/photos";
import { RUBIK } from "../lib/fonts";
import { clamp, eio, eo, ip, lerp, sp } from "../lib/anim";

/** Scene 5, verse 3: who he became. Ends with the treasure chest of friends (slowest moment). */
export const S5Verse3: React.FC<SceneProps> = (props) => (
  <SceneShell section="verse3" {...props}>
    <Verse3 />
  </SceneShell>
);

const GROUND = 900;
const SVG: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", ...style }}>
    {children}
  </svg>
);

const Verse3: React.FC = () => {
  const T = useSectionLines("verse3");
  const { frame } = T;
  const cut = (i: number) => T.start(i) - 6;
  const win = (a: number, b: number | null) => {
    const A = cut(a);
    const B = b === null ? Infinity : cut(b);
    if (frame < A - 2 || frame >= B + 10) return 0;
    return Math.min(ip(frame, [A - 2, A + 10], [0, 1]), b === null ? 1 : ip(frame, [B, B + 10], [1, 0]));
  };
  const parts: [number, number | null, React.FC][] = [
    [0, 1, SplitLook],
    [1, 2, Bench],
    [2, 4, GlobeToss],
    [4, 5, House],
    [5, 6, CircleDance],
    [6, null, Chest],
  ];
  return (
    <AbsoluteFill style={{ background: "#0B1026" }}>
      {parts.map(([a, b, C], i) => {
        const o = win(a, b);
        return o > 0 ? (
          <AbsoluteFill key={i} style={{ opacity: o }}>
            <C />
          </AbsoluteFill>
        ) : null;
      })}
    </AbsoluteFill>
  );
};

/** left: notebook kid, right: adult in colour */
const Split: React.FC<{ left: React.ReactNode; right: React.ReactNode }> = ({ left, right }) => {
  const { frame } = useSectionLines("verse3");
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, top: 0, width: 960, height: 1080, overflow: "hidden" }}>
        <NotebookPage>
          <svg viewBox="0 0 960 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
            <SketchFilter frame={frame} />
            {left}
          </svg>
        </NotebookPage>
      </div>
      <div style={{ position: "absolute", left: 960, top: 0, width: 960, height: 1080, overflow: "hidden", background: "radial-gradient(circle at 50% 60%, #2b4bb3, #1E3A8A 60%, #0B1026)" }} />
      <SVG>
        <path d={`M960,0 ${Array.from({ length: 12 }).map((_, i) => `L${960 + (i % 2 ? 10 : -10)},${(i + 1) * 90}`).join(" ")}`} stroke="#fff" strokeWidth={8} fill="none" />
        {right}
      </SVG>
    </AbsoluteFill>
  );
};

const SplitLook: React.FC = () => {
  const T = useSectionLines("verse3");
  const { frame } = T;
  const p = T.p(0);
  const turn = ip(p, [0.15, 0.35], [0, 1]);
  return (
    <Split
      left={<Figure look={kidSashaUniform} pose={pose({ look: turn, mouth: p > 0.6 ? "grin" : "o", eyes: p > 0.6 ? "squint" : "open", holdL: "pencil", armL: 25, elbowL: 40 })} x={480} y={GROUND} scale={1.25} filter="sketch" />}
      right={<Figure look={adultSasha} pose={pose({ look: -turn, mouth: p > 0.6 ? "grin" : "smile", eyes: p > 0.6 ? "squint" : "open", armR: p > 0.6 ? 35 : 12, elbowR: p > 0.6 ? 105 : 8, holdR: p > 0.6 ? "thumb" : "none" })} x={1360} y={GROUND + 40} scale={1.2} />}
    />
  );
};

const Bench: React.FC = () => {
  const T = useSectionLines("verse3");
  const { frame } = T;
  const p = T.p(1);
  const shrug = ip(p, [0.15, 0.3], [0, 1]) * ip(p, [0.85, 1], [1, 0.4]);
  const bubble = sp(frame, T.start(1) + 10, { damping: 10 });
  const seat = GROUND - 120;
  return (
    <NotebookPage>
      <SVG>
        <SketchFilter frame={frame} />
        <g filter="url(#sketch)">
          <Courtyard frame={frame} ground={GROUND} bench />
        </g>
        {FRIEND_IDS.map((id, i) => {
          const L = kidFriends[id];
          const s = 0.95;
          return (
            <Figure
              key={id}
              look={L}
              pose={pose({ shrug, armL: 25 + shrug * 15, armR: 25 + shrug * 15, elbowL: -shrug * 75, elbowR: -shrug * 75, mouth: "flat", eyes: "open", look: Math.sin(frame * 0.05 + i) * 0.8, legL: 4, legR: 4 })}
              x={760 + i * 135}
              y={seat + L.legLen * s * 0.8}
              scale={s}
              filter="sketch"
            />
          );
        })}
        <g transform={`translate(970,${seat - 420}) scale(${bubble})`}>
          <circle cx={-170} cy={260} r={16} fill="#fff" stroke="#3a3a4a" strokeWidth={4} />
          <circle cx={-130} cy={200} r={26} fill="#fff" stroke="#3a3a4a" strokeWidth={4} />
          <path d="M-210,40 q-40,-110 80,-120 q60,-90 170,-20 q120,-30 140,80 q80,60 -20,120 q-40,70 -170,40 q-150,50 -200,-100 Z" fill="#fff" stroke="#3a3a4a" strokeWidth={5} />
          <text x={-20} y={60} textAnchor="middle" fontFamily={RUBIK} fontWeight={900} fontSize={190} fill="#DC2626">
            ?
          </text>
        </g>
      </SVG>
    </NotebookPage>
  );
};

/** A small spinning globe: map shapes scrolled inside a circle. */
const Globe: React.FC<{ x: number; y: number; r: number; spin: number }> = ({ x, y, r, spin }) => {
  const id = `globe${Math.round(r)}`;
  const off = (spin % 1000) * -1;
  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <clipPath id={id}>
          <circle r={r} />
        </clipPath>
        <radialGradient id={id + "g"} cx="0.35" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#000" stopOpacity="0.35" />
        </radialGradient>
      </defs>
      <circle r={r} fill="#2563EB" />
      <g clipPath={`url(#${id})`}>
        <g transform={`translate(${-r * 1.6 + off * (r / 250)},${-r * 1.1}) scale(${r / 250})`}>
          {[0, 1000].map((dx) => (
            <g key={dx} transform={`translate(${dx},0)`}>
              {LAND_PATHS.map((d, i) => (
                <path key={i} d={d} fill="#22C55E" />
              ))}
            </g>
          ))}
        </g>
      </g>
      <circle r={r} fill={`url(#${id}g)`} stroke="#0f1d4a" strokeWidth={5} />
    </g>
  );
};

const GlobeToss: React.FC = () => {
  const T = useSectionLines("verse3");
  const { frame } = T;
  const a = T.start(2);
  const throwAt = a + T.L[2].dur * 0.35;
  const catchAt = a + T.L[2].dur * 0.95;
  const t = ip(frame, [throwAt, catchAt], [0, 1]);
  const flying = frame >= throwAt && frame < catchAt;
  const caught = frame >= catchAt;
  const kidHand = { x: 560, y: GROUND - 520 };
  const adultHand = { x: 1300, y: GROUND - 560 };
  let gx = kidHand.x + 30;
  let gy = kidHand.y - 40;
  if (flying) {
    gx = lerp(kidHand.x, adultHand.x, t);
    gy = lerp(kidHand.y, adultHand.y, t) - Math.sin(t * Math.PI) * 320;
  }
  const raise = ip(frame, [T.start(3), T.start(3) + 20], [0, 1], eio);
  if (caught) {
    gx = adultHand.x;
    gy = adultHand.y - raise * 160;
  }
  const windup = frame < throwAt ? ip(frame, [a, throwAt], [0, 1]) : 0;
  return (
    <Split
      left={
        <Figure
          look={kidSasha}
          pose={frame < throwAt ? pose({ armR: lerp(60, 175, windup), elbowR: 20, armL: 30, mouth: "grin", eyes: "squint" }) : pose({ armR: 120, elbowR: 0, armL: 40, mouth: "laugh", look: 1 })}
          x={480}
          y={GROUND}
          scale={1.2}
          filter="sketch"
        />
      }
      right={
        <g>
          <Figure
            look={adultSasha}
            pose={caught ? pose({ armL: lerp(130, 165, raise), armR: lerp(130, 165, raise), elbowL: 20, elbowR: 20, eyes: "squint", mouth: "grin", bounce: -raise * 20 }) : pose({ armL: 110, armR: 110, elbowL: 30, elbowR: 30, eyes: "wide", mouth: "o", look: -1 })}
            x={1320}
            y={GROUND + 40}
            scale={1.15}
          />
          <Globe x={gx} y={gy} r={caught ? 95 + raise * 30 : 75} spin={frame * 6} />
          {caught &&
            Array.from({ length: 10 }).map((_, i) => {
              const ang = (i / 10) * Math.PI * 2 + frame * 0.02;
              const rr = 170 + Math.sin(frame * 0.2 + i) * 10;
              return <line key={i} x1={gx + Math.cos(ang) * (rr - 30)} y1={gy + Math.sin(ang) * (rr - 30)} x2={gx + Math.cos(ang) * rr} y2={gy + Math.sin(ang) * rr} stroke="#E8B04B" strokeWidth={8} strokeLinecap="round" opacity={raise} />;
            })}
        </g>
      }
    />
  );
};

const House: React.FC = () => {
  const T = useSectionLines("verse3");
  const { frame } = T;
  const fam = getPhotos("family", 4, 4);
  const a = T.start(4);
  const wins = [
    { x: 800, y: 470 },
    { x: 1120, y: 470 },
    { x: 800, y: 690 },
    { x: 1120, y: 690 },
  ];
  const glow = 0.7 + 0.3 * Math.sin(frame * 0.15);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#0B1026, #1E3A8A 70%, #23285a)" }}>
      <SVG>
        <defs>
          <radialGradient id="warm" cx="0.5" cy="0.5" r="0.6">
            <stop offset="0" stopColor="#FFD58A" />
            <stop offset="1" stopColor="#E8B04B" />
          </radialGradient>
        </defs>
        {Array.from({ length: 50 }).map((_, i) => (
          <circle key={i} cx={(i * 397) % 1920} cy={(i * 173) % 420} r={2} fill="#fff" opacity={0.3 + 0.5 * Math.abs(Math.sin(frame * 0.05 + i))} />
        ))}
        <rect x={0} y={GROUND} width={1920} height={180} fill="#14532d" />
        <circle cx={960} cy={600} r={560} fill="#E8B04B" opacity={0.12 * glow} />
        <rect x={640} y={360} width={640} height={540} fill="#FDE7C7" stroke="#3b2314" strokeWidth={8} />
        <path d="M590,380 L960,120 L1330,380 Z" fill="#B91C1C" stroke="#3b2314" strokeWidth={8} strokeLinejoin="round" />
        <rect x={1120} y={170} width={60} height={130} fill="#7c2d12" stroke="#3b2314" strokeWidth={6} />
        {Array.from({ length: 4 }).map((_, i) => {
          const t = frame - i * 8;
          return <circle key={i} cx={1150 + Math.sin(t * 0.08) * 15} cy={150 - ((t * 1.6) % 140)} r={16 + ((t * 0.2) % 14)} fill="#cbd5e1" opacity={0.4 * (1 - ((t * 1.6) % 140) / 140)} />;
        })}
        <rect x={905} y={760} width={110} height={140} fill="#7c2d12" stroke="#3b2314" strokeWidth={6} />
        <Heart x={960} y={250} s={70} fill="#FF6B6B" stroke="#fff" sw={5} scale={1 + Math.sin(frame * 0.25) * 0.08} />
        {wins.map((w, i) => (
          <g key={i}>
            <rect x={w.x - 120} y={w.y - 90} width={240} height={180} fill="url(#warm)" stroke="#3b2314" strokeWidth={8} />
            <rect x={w.x - 140} y={w.y - 115} width={280} height={230} fill="#E8B04B" opacity={0.18 * glow} />
          </g>
        ))}
      </SVG>
      {fam.map((ph, i) => {
        const at = a + 8 + i * (T.L[4].dur / 5);
        if (frame < at) return null;
        const s = sp(frame, at, { damping: 13 });
        return (
          <div key={ph.key} style={{ position: "absolute", left: wins[i].x - 112, top: wins[i].y - 82, width: 224, height: 164, overflow: "hidden", opacity: s, transform: `scale(${0.6 + 0.4 * s})` }}>
            <Polaroid src={ph.src} x={112} y={98} width={260} seed={i + 81} tilt={0} frame={frame} kb={ip(frame, [at, T.start(5)], [0, 1])} aspect={0.75} />
          </div>
        );
      })}
      <SVG>
        {wins.map((w, i) => (
          <g key={i} stroke="#3b2314" strokeWidth={8}>
            <line x1={w.x} y1={w.y - 90} x2={w.x} y2={w.y + 90} />
            <line x1={w.x - 120} y1={w.y} x2={w.x + 120} y2={w.y} />
          </g>
        ))}
      </SVG>
    </AbsoluteFill>
  );
};

const CircleDance: React.FC = () => {
  const T = useSectionLines("verse3");
  const { frame } = T;
  const form = ip(frame, [T.start(5) - 6, T.start(5) + 20], [0, 1], eo);
  const cx = 960;
  const cy = 780;
  const ring = [...FRIEND_IDS, ...FRIEND_IDS].map((id, i) => ({ id, i, kid: i >= 4 }));
  const items = ring.map(({ id, i, kid }) => {
    const ang = (i / ring.length) * Math.PI * 2 + frame * 0.03;
    const r = lerp(1300, 520, form);
    const x = cx + Math.cos(ang) * r;
    const depth = Math.sin(ang);
    const y = cy + depth * 120 * form + (1 - form) * 0;
    return { id, i, kid, x, y, depth };
  });
  const back = items.filter((it) => it.depth < 0).sort((a, b) => a.depth - b.depth);
  const front = items.filter((it) => it.depth >= 0).sort((a, b) => a.depth - b.depth);
  const fig = (it: (typeof items)[number]) => (
    <Figure
      key={it.i}
      look={it.kid ? kidFriends[it.id] : adultFriends[it.id]}
      pose={pose({ ...runPose(frame + it.i * 4, 0.35), armL: 100, armR: 100, elbowL: 10, elbowR: 10, mouth: "grin", eyes: "squint" })}
      x={it.x}
      y={it.y}
      scale={(it.kid ? 0.85 : 0.7) * (0.85 + it.depth * 0.15)}
    />
  );
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 70%, #2EC4B6 0%, #1E3A8A 55%, #0B1026 100%)" }}>
      <SVG>
        <ellipse cx={cx} cy={cy + 10} rx={560} ry={140} fill="#E8B04B" opacity={0.18} />
        {back.map(fig)}
        <Figure look={adultSasha} pose={pose({ armL: 150, armR: 150, elbowL: 10, elbowR: 10, eyes: "squint", mouth: "grin", bounce: -Math.abs(Math.sin(frame * 0.2)) * 20 })} x={cx} y={cy} scale={1.0} />
        {front.map(fig)}
      </SVG>
    </AbsoluteFill>
  );
};

/** The emotional peak: slow, no bouncy springs. */
const Chest: React.FC = () => {
  const T = useSectionLines("verse3");
  const { frame, total } = T;
  const a = T.start(6);
  const rise = ip(frame, [a - 6, a + 40], [0, 1], eio);
  const open = ip(frame, [a + T.L[6].dur * 0.55, a + T.L[6].dur + 6], [0, 1], eio);
  const pics = getPhotos("friends", 5, 8);
  const b = T.start(7) - 10;
  const span = Math.max(30, total - b - 20);
  const glowAll = open;
  const chestX = 960;
  const chestY = 760 + (1 - rise) * 300;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 70%, #3b2a0c 0%, #0B1026 70%)" }}>
      <SVG>
        <defs>
          <radialGradient id="chestLight" cx="0.5" cy="1" r="0.9">
            <stop offset="0" stopColor="#FFE7A3" stopOpacity="0.9" />
            <stop offset="1" stopColor="#E8B04B" stopOpacity="0" />
          </radialGradient>
        </defs>
        {glowAll > 0 && <path d={`M${chestX - 230},${chestY - 120} L${chestX - 700},-50 L${chestX + 700},-50 L${chestX + 230},${chestY - 120} Z`} fill="url(#chestLight)" opacity={glowAll * 0.75} />}
        {/* body */}
        <g transform={`translate(${chestX},${chestY})`}>
          <ellipse cx={0} cy={140} rx={330} ry={30} fill="#000" opacity={0.35} />
          <rect x={-270} y={-120} width={540} height={260} rx={18} fill="#8B4513" stroke="#3b2314" strokeWidth={8} />
          {[-180, 0, 180].map((x) => (
            <rect key={x} x={x - 22} y={-120} width={44} height={260} fill="#E8B04B" stroke="#3b2314" strokeWidth={5} />
          ))}
          <rect x={-40} y={-80} width={80} height={90} rx={10} fill="#E8B04B" stroke="#3b2314" strokeWidth={5} />
          <circle cx={0} cy={-45} r={12} fill="#3b2314" />
          {/* lid rotates open around the back edge */}
          <g transform={`translate(0,-120) scale(1,${lerp(1, -0.55, open)})`}>
            <path d="M-275,0 L-275,-70 Q0,-190 275,-70 L275,0 Z" fill="#A0522D" stroke="#3b2314" strokeWidth={8} />
            {[-180, 0, 180].map((x) => (
              <path key={x} d={`M${x - 22},0 L${x - 22},${-105 - (x === 0 ? 25 : 0)} L${x + 22},${-105 - (x === 0 ? 25 : 0)} L${x + 22},0 Z`} fill="#E8B04B" stroke="#3b2314" strokeWidth={5} />
            ))}
          </g>
        </g>
        <Figure
          look={adultSasha}
          pose={pose({ armL: lerp(30, 70, open), armR: lerp(30, 70, open), elbowL: 40, elbowR: 40, look: open > 0.5 ? 0 : 1, eyes: open > 0.8 ? "squint" : "open", mouth: open > 0.5 ? "grin" : "smile" })}
          x={1720}
          y={1000}
          scale={1.05}
        />
      </SVG>
      {pics.map((ph, i) => {
        const at = b + (i * span) / pics.length;
        if (frame < at) return null;
        const t = ip(frame, [at, at + 45], [0, 1], eio);
        const n = pics.length;
        const ang = Math.PI * (0.95 - (0.9 * i) / Math.max(1, n - 1));
        const tx = 900 + Math.cos(ang) * 640;
        const ty = 560 - Math.sin(ang) * 380;
        const glow = ip(frame, [at + 30, at + 45, at + 70], [0, 1, 0.25]);
        return (
          <Polaroid
            key={ph.key}
            src={ph.src}
            x={lerp(960, tx, t)}
            y={lerp(chestY - 150, ty, t)}
            width={lerp(120, 300, t)}
            seed={i + 101}
            frame={frame}
            kb={ip(frame, [at, total], [0, 1])}
            glow={glow}
            opacity={clamp(t * 4)}
          />
        );
      })}
    </AbsoluteFill>
  );
};
