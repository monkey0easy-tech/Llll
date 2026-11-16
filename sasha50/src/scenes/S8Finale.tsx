import React from "react";
import { AbsoluteFill } from "remotion";
import { SceneShell } from "./SceneShell";
import { SceneProps } from "./index";
import { useSectionLines } from "../lib/time";
import { Figure, pose } from "../components/Figure";
import { adultFriends, adultSasha, FRIEND_IDS, kidSasha } from "../components/characters";
import { runPose, wavePose } from "../components/poses";
import { CitySymbol } from "../components/CitySymbols";
import { ROUTE } from "../components/WorldMap";
import { FriendNetwork } from "../components/FriendNetwork";
import { RUBIK } from "../lib/fonts";
import { clamp, eio, eo, ip, lerp, rand, sp } from "../lib/anim";

/** Scene 8, finale: cake, the jet, skywriting, cities, friendship lines, the summit, shooting stars. */
export const S8Finale: React.FC<SceneProps> = (props) => (
  <SceneShell section="finale" {...props}>
    <Finale />
  </SceneShell>
);

const SVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
    {children}
  </svg>
);

const Sky: React.FC<{ frame: number; children?: React.ReactNode }> = ({ frame, children }) => (
  <AbsoluteFill style={{ background: "linear-gradient(#060a1e 0%, #0B1026 45%, #2a2f6b 85%, #5b3f7a 100%)" }}>
    <SVG>
      {Array.from({ length: 140 }).map((_, i) => (
        <circle key={i} cx={rand(i + 3) * 1920} cy={rand(i + 77) * 900} r={0.8 + rand(i) * 1.8} fill="#fff" opacity={0.3 + 0.6 * Math.abs(Math.sin(frame * 0.05 + i))} />
      ))}
      {children}
    </SVG>
  </AbsoluteFill>
);

const Finale: React.FC = () => {
  const T = useSectionLines("finale");
  const { frame } = T;
  const cut = (i: number) => T.start(i) - 6;
  const win = (a: number, b: number | null) => {
    const A = cut(a);
    const B = b === null ? Infinity : cut(b);
    if (frame < A - 2 || frame >= B + 10) return 0;
    return Math.min(a === 0 ? 1 : ip(frame, [A - 2, A + 10], [0, 1]), b === null ? 1 : ip(frame, [B, B + 10], [1, 0]));
  };
  const parts: [number, number | null, React.FC][] = [
    [0, 2, Cake],
    [2, 4, JetBoarding],
    [4, 6, Cruise],
    [6, null, Summit],
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

// lines 0-1: a big cake with 50 candles, friends blow them out together
const Cake: React.FC = () => {
  const T = useSectionLines("finale");
  const { frame } = T;
  const blowAt = T.start(1) + T.L[1].dur * 0.35;
  const blowing = frame > blowAt - 10 && frame < blowAt + 30;
  const candles: React.ReactNode[] = [];
  for (let i = 0; i < 50; i++) {
    const tier = i < 30 ? 0 : 1;
    const k = tier === 0 ? i : i - 30;
    const n = tier === 0 ? 30 : 20;
    const w = tier === 0 ? 700 : 480;
    const row = k % 2;
    const x = 960 - w / 2 + 20 + ((k / n) * (w - 40)) + (row ? 10 : 0);
    const y = tier === 0 ? 640 - row * 14 : 450 - row * 12;
    const out = frame > blowAt + Math.abs(x - 960) * 0.04 + rand(i) * 8;
    const fl = 1 + Math.sin(frame * 0.6 + i) * 0.15;
    candles.push(
      <g key={i}>
        <rect x={x - 5} y={y - 50} width={10} height={50} fill={["#2EC4B6", "#FF6B6B", "#E8B04B", "#fff"][i % 4]} stroke="#3b2314" strokeWidth={1.5} />
        {!out ? (
          <g>
            <circle cx={x} cy={y - 62} r={16} fill="#FFE8A3" opacity={0.35} />
            <path d={`M${x},${y - 50} q-8,-10 0,-${24 * fl} q8,14 0,${24 * fl}`} fill="#FBBF24" />
          </g>
        ) : (
          frame < blowAt + 60 && <circle cx={x + (frame - blowAt) * 0.3} cy={y - 60 - (frame - blowAt) * 1.2} r={6 + (frame - blowAt) * 0.2} fill="#cbd5e1" opacity={clamp(1 - (frame - blowAt) / 60) * 0.6} />
        )}
      </g>,
    );
  }
  const dark = ip(frame, [blowAt, blowAt + 30], [0, 0.35]);
  const pos = [150, 340, 1580, 1770];
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 55%, #4a2d18 0%, #1a1020 70%)" }}>
      <SVG>
        <circle cx={960} cy={520} r={620} fill="#FFD58A" opacity={0.18 - dark * 0.3} />
        {/* table */}
        <rect x={0} y={860} width={1920} height={220} fill="#5b3a1e" />
        <rect x={0} y={850} width={1920} height={14} fill="#7c4f28" />
        {/* cake */}
        <ellipse cx={960} cy={860} rx={460} ry={34} fill="#e5e7eb" />
        <rect x={600} y={640} width={720} height={220} rx={18} fill="#FBCFE8" stroke="#3b2314" strokeWidth={5} />
        <path d="M600,680 q30,40 60,0 q30,40 60,0 q30,40 60,0 q30,40 60,0 q30,40 60,0 q30,40 60,0 q30,40 60,0 q30,40 60,0 q30,40 60,0 q30,40 60,0 q30,40 60,0 q30,40 60,0" fill="none" stroke="#fff" strokeWidth={14} strokeLinecap="round" />
        <rect x={720} y={450} width={480} height={190} rx={16} fill="#A7F3D0" stroke="#3b2314" strokeWidth={5} />
        <path d="M720,490 q30,34 60,0 q30,34 60,0 q30,34 60,0 q30,34 60,0 q30,34 60,0 q30,34 60,0 q30,34 60,0 q30,34 60,0" fill="none" stroke="#fff" strokeWidth={12} strokeLinecap="round" />
        <text x={960} y={800} textAnchor="middle" fontFamily={RUBIK} fontWeight={900} fontSize={120} fill="#E8B04B" stroke="#7c2d12" strokeWidth={5}>
          50
        </text>
        {candles}
        <rect width={1920} height={1080} fill="#000" opacity={dark} />
        {FRIEND_IDS.map((id, i) => {
          const s = sp(frame, T.start(0) + i * 5, { damping: 13 });
          return (
            <Figure
              key={id}
              look={adultFriends[id]}
              pose={blowing ? pose({ mouth: "o", eyes: "closed", look: i < 2 ? 1 : -1, tilt: i < 2 ? 8 : -8 }) : frame > blowAt + 30 ? wavePose(frame + i * 4) : pose({ mouth: "grin", look: i < 2 ? 1 : -1 })}
              x={pos[i]}
              y={1060}
              scale={0.95 * s}
              flip={i >= 2}
            />
          );
        })}
        {blowing &&
          [0, 1, 2, 3].map((i) =>
            [0, 1, 2].map((k) => {
              const dx = i < 2 ? 1 : -1;
              const t = (frame - blowAt + 10 + k * 6) % 20;
              const sx = pos[i] + dx * 70 + dx * t * 14;
              return <path key={i + "-" + k} d={`M${sx},${560 + k * 18} q${dx * 20},-10 ${dx * 40},0`} fill="none" stroke="#e0f2fe" strokeWidth={5} strokeLinecap="round" opacity={0.7} />;
            }),
          )}
        <Figure look={adultSasha} pose={blowing ? pose({ mouth: "o", eyes: "closed" }) : pose({ eyes: "squint", mouth: "grin", armR: 35, elbowR: 105, holdR: "thumb" })} x={480} y={1060} scale={0.95} />
      </SVG>
    </AbsoluteFill>
  );
};

/** private jet, nose to the right, origin at its centre */
const Jet: React.FC<{ x: number; y: number; s?: number; rot?: number; faces?: number; waveFace?: boolean; frame: number }> = ({ x, y, s = 1, rot = 0, faces = 0, waveFace, frame }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <path d="M-420,-30 L-500,-170 L-440,-170 L-330,-40 Z" fill="#cbd5e1" stroke="#1f2937" strokeWidth={5} strokeLinejoin="round" />
    <path d="M-440,-10 C-440,-60 -300,-70 200,-70 C330,-70 430,-40 450,0 C430,40 330,60 200,60 L-380,60 C-430,60 -440,30 -440,-10 Z" fill="#F8FAFC" stroke="#1f2937" strokeWidth={6} />
    <path d="M-440,10 L450,10" stroke="#E8B04B" strokeWidth={10} />
    <path d="M340,-50 C380,-48 420,-30 434,-12 L360,-12 Z" fill="#1E3A8A" />
    <path d="M-60,30 L-200,140 L-130,140 L60,30 Z" fill="#cbd5e1" stroke="#1f2937" strokeWidth={5} strokeLinejoin="round" />
    <ellipse cx={-330} cy={-62} rx={70} ry={22} fill="#94a3b8" stroke="#1f2937" strokeWidth={4} />
    {Array.from({ length: 7 }).map((_, i) => {
      const wx = -250 + i * 80;
      const occupied = i < faces;
      return (
        <g key={i}>
          <rect x={wx - 24} y={-46} width={48} height={40} rx={18} fill={occupied ? "#FDE68A" : "#1E3A8A"} stroke="#1f2937" strokeWidth={3} />
          {occupied && (
            <g>
              <circle cx={wx} cy={-24} r={13} fill="#F2C9A0" />
              <path d={`M${wx - 13},-28 a13,13 0 0 1 26,0 Z`} fill={["#8B5E34", "#6B3F1D", "#E4572E", "#9CA3AF", "#2B2118", "#8B5E34", "#6B3F1D"][i]} />
              <path d={`M${wx - 6},-20 q6,6 12,0`} fill="none" stroke="#232333" strokeWidth={2} />
            </g>
          )}
        </g>
      );
    })}
    {waveFace && (
      <g transform="translate(330,-30)">
        <circle r={16} fill="#F2C9A0" stroke="#232333" strokeWidth={2} />
        <path d="M-16,-4 a16,16 0 0 1 32,0 Z" fill="#E4572E" />
        <g transform={`translate(26,-6) rotate(${Math.sin(frame * 0.5) * 25})`}>
          <circle r={8} fill="#F2C9A0" stroke="#232333" strokeWidth={2} />
        </g>
      </g>
    )}
  </g>
);

// lines 2-3: boarding, one friend does not fit, takeoff and skywriting
const SKY_TEXT = "С ДНЁМ РОЖДЕНИЯ, САША!";
const JetBoarding: React.FC = () => {
  const T = useSectionLines("finale");
  const { frame } = T;
  const a = T.start(2);
  const t0 = T.start(3);
  const dur3 = T.L[3].dur;
  const takeoff = ip(frame, [t0, t0 + dur3 * 0.6], [0, 1], (x) => x * x);
  const jx = lerp(820, 2400, takeoff);
  const jy = lerp(760, 100, takeoff);
  const rot = -18 * clamp(takeoff * 4);
  const boardDur = T.L[2].dur;
  const people = [...FRIEND_IDS, "hero" as const];
  const boarded = people.filter((_, i) => frame > a + (i + 1) * (boardDur / 6) + 20).length;
  // skywriting runs through line 4 as well, so it lives in the next part too
  return (
    <Sky frame={frame}>
      <rect x={0} y={880} width={1920} height={200} fill="#1f2937" />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={i * 170 - ((frame * (takeoff > 0 ? 30 : 0)) % 170)} y={970} width={90} height={10} fill="#E8B04B" />
      ))}
      <Jet x={jx} y={jy} rot={rot} frame={frame} faces={Math.min(4, boarded)} waveFace={boarded >= 5} />
      {takeoff === 0 && (
        <g>
          <path d="M970,840 L1060,890 L1150,890 L1060,840 Z" fill="#94a3b8" stroke="#1f2937" strokeWidth={4} />
          <rect x={930} y={720} width={70} height={110} rx={10} fill="#1E3A8A" stroke="#1f2937" strokeWidth={4} />
        </g>
      )}
      {takeoff === 0 &&
        people.map((id, i) => {
          const at = a + i * (boardDur / 6);
          const walk = ip(frame, [at - 20, at + 20], [0, 1]);
          if (walk >= 1) return null;
          const x = lerp(1700 + i * 60, 1010, walk);
          const y = lerp(1000, 860, walk);
          const look = id === "hero" ? adultSasha : adultFriends[id];
          return <Figure key={id} look={look} pose={runPose(frame + i * 4, 0.4, { holdR: "suitcase", armR: 8, elbowR: 0 })} x={x} y={y} scale={0.55 * (1 - walk * 0.4)} flip />;
        })}
      {/* the one who didn't fit: stuck in the door with a suitcase, then waves */}
      {takeoff === 0 && frame > a + boardDur * 0.85 && (
        <Figure look={adultFriends.chubby} pose={wavePose(frame, { mouth: "open", eyes: "wide" })} x={965} y={890} scale={0.45} />
      )}
      {takeoff > 0 && <SkyWriting frame={frame} start={t0 + 6} />}
    </Sky>
  );
};

const SkyWriting: React.FC<{ frame: number; start: number }> = ({ frame, start }) => {
  const T = useSectionLines("finale");
  const p = ip(frame, [start, T.start(4) + 20], [0, 1]);
  const drift = (frame - start) * 0.15;
  return (
    <g>
      <defs>
        <filter id="smoke" x="-10%" y="-30%" width="120%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves={2} seed={3} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={10} />
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
        <clipPath id="skyclip">
          <rect x={0} y={0} width={180 + p * 1600} height={1080} />
        </clipPath>
      </defs>
      <g clipPath="url(#skyclip)" filter="url(#smoke)" opacity={0.92}>
        <text x={960} y={260 - drift} textAnchor="middle" fontFamily={RUBIK} fontWeight={800} fontSize={110} fill="#f8fafc" letterSpacing={4}>
          {SKY_TEXT}
        </text>
      </g>
    </g>
  );
};

// lines 4-5: cities scroll by below, friendship lines connect everyone again
const Cruise: React.FC = () => {
  const T = useSectionLines("finale");
  const { frame } = T;
  const net = ip(frame, [T.start(5) - 4, T.start(5) + T.L[5].dur * 0.7], [0, 1]);
  const scroll = (frame - T.start(4)) * 7;
  const nodes = [
    { x: 260, y: 200 },
    { x: 560, y: 560 },
    { x: 1380, y: 560 },
    { x: 1680, y: 220 },
    { x: 960, y: 140 },
  ];
  return (
    <Sky frame={frame}>
      <SkyWriting frame={frame} start={T.start(3) + 6} />
      {/* clouds */}
      {Array.from({ length: 6 }).map((_, i) => {
        const x = ((i * 420 - frame * 4) % 2400 + 2400) % 2400 - 240;
        return <ellipse key={i} cx={x} cy={420 + (i % 3) * 80} rx={140} ry={34} fill="#fff" opacity={0.08} />;
      })}
      <rect x={0} y={840} width={1920} height={240} fill="#1b1f3b" />
      {[...ROUTE, ...ROUTE, ...ROUTE].map((id, i) => {
        const x = 2100 + i * 520 - scroll;
        if (x < -300 || x > 2300) return null;
        return <CitySymbol key={i} id={id} x={x} y={840} s={1.7} frame={frame} />;
      })}
      <Jet x={960 + Math.sin(frame * 0.05) * 30} y={600 + Math.sin(frame * 0.08) * 14} s={0.8} frame={frame} faces={7} />
      {net > 0 && <FriendNetwork hub={{ x: 960, y: 590 }} nodes={nodes} progress={net} frame={frame} mesh={ip(net, [0.6, 1], [0, 1])} />}
      {net > 0 &&
        nodes.map((n, i) => (
          <Figure key={i} look={i === 4 ? kidSasha : adultFriends[FRIEND_IDS[i]]} pose={wavePose(frame + i * 6)} x={n.x} y={n.y + 50} scale={0.3 * sp(frame, T.start(5) + i * 4)} />
        ))}
    </Sky>
  );
};

// lines 6-7: mountains, kid + adult plant the 50 flag, shooting stars
const Summit: React.FC = () => {
  const T = useSectionLines("finale");
  const { frame, total } = T;
  const a = T.start(6);
  const plant = ip(frame, [a + 20, a + 50], [0, 1], eo);
  const jetX = lerp(-500, 2400, ip(frame, [a - 6, a + T.L[6].dur], [0, 1]));
  const flagWave = Math.sin(frame * 0.2) * 6;
  const peak = { x: 960, y: 520 };
  const stars: React.ReactNode[] = [];
  for (let i = 0; i < 14; i++) {
    const at = T.start(7) - 10 + i * 6;
    const t = frame - at;
    if (t < 0 || t > 26) continue;
    const sx = 300 + rand(i * 4) * 1400;
    const sy = 60 + rand(i * 6) * 200;
    const len = 220;
    const k = t / 26;
    const x = sx + k * 500;
    const y = sy + k * 220;
    stars.push(
      <g key={i} opacity={1 - k}>
        <line x1={x - len * 0.9} y1={y - len * 0.4} x2={x} y2={y} stroke="url(#starTail)" strokeWidth={8} strokeLinecap="round" />
        <circle cx={x} cy={y} r={10} fill="#fff" />
        <circle cx={x} cy={y} r={26} fill="#FDE68A" opacity={0.3} />
      </g>,
    );
  }
  return (
    <Sky frame={frame}>
      <defs>
        <linearGradient id="starTail" x1="0" y1="0" x2="1" y2="0.45">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#FDE68A" stopOpacity="1" />
        </linearGradient>
      </defs>
      {stars}
      <path d="M-100,1080 L300,640 L520,820 L760,600 L960,520 L1180,640 L1400,560 L1700,780 L2020,620 L2020,1080 Z" fill="#26305e" />
      <path d="M760,600 L960,520 L1180,640 L1080,620 L960,560 L860,610 Z" fill="#f8fafc" opacity={0.9} />
      <path d="M-100,1080 L200,820 L480,960 L800,860 L1200,980 L1600,840 L2020,960 L2020,1080 Z" fill="#141a3d" />
      <Jet x={jetX} y={260} s={0.45} rot={-4} frame={frame} faces={7} />
      {/* flag */}
      <g transform={`translate(${peak.x - 10},${peak.y}) scale(1.4,${1.4 * plant})`}>
        <line x1={0} y1={0} x2={0} y2={-260} stroke="#e5e7eb" strokeWidth={8} strokeLinecap="round" />
        <path d={`M4,-256 Q90,${-266 + flagWave} 170,-246 L170,-150 Q90,${-160 - flagWave} 4,-150 Z`} fill="#DC2626" stroke="#7f1d1d" strokeWidth={4} />
        <text x={88} y={-176} textAnchor="middle" fontFamily={RUBIK} fontWeight={900} fontSize={68} fill="#E8B04B">
          50
        </text>
      </g>
      <Figure look={kidSasha} pose={pose({ armR: 120, elbowR: 0, eyes: "squint", mouth: "grin", look: 1 })} x={peak.x - 170} y={peak.y + 40} scale={0.75} />
      <Figure look={adultSasha} pose={pose({ armL: 120, elbowL: 0, eyes: "squint", mouth: "grin", look: -1, holdR: "thumb", armR: 35, elbowR: 105 })} x={peak.x + 300} y={peak.y + 90} scale={0.75} />
    </Sky>
  );
};
