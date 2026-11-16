import React from "react";
import { AbsoluteFill } from "remotion";
import { SceneShell } from "./SceneShell";
import { SceneProps } from "./index";
import { useSectionLines } from "../lib/time";
import { Figure, headY, mixPose, pose } from "../components/Figure";
import { adultFriends, adultSasha, FRIEND_IDS, kidSasha } from "../components/characters";
import { runPose, starPose, wavePose } from "../components/poses";
import { DubaiNight } from "../components/DubaiNight";
import { PlaneIcon } from "../components/WorldMap";
import { SparkTrail } from "../components/Doodles";
import { Star } from "../components/Figure";
import { RUBIK } from "../lib/fonts";
import { clamp, eBack, eio, eo, ip, lerp, rand, sp } from "../lib/anim";

/** Scene 6, verse 4: Dubai tonight. */
export const S6Verse4: React.FC<SceneProps> = (props) => (
  <SceneShell section="verse4" {...props}>
    <Verse4 />
  </SceneShell>
);

const FLOOR = 1010;
const SVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
    {children}
  </svg>
);

const Promenade = () => (
  <g>
    <rect x={0} y={930} width={1920} height={150} fill="#1b1f3b" />
    <rect x={0} y={926} width={1920} height={8} fill="#E8B04B" opacity={0.6} />
    {Array.from({ length: 9 }).map((_, i) => (
      <g key={i}>
        <line x1={110 + i * 220} y1={930} x2={110 + i * 220} y2={800} stroke="#0a0f24" strokeWidth={6} />
        <circle cx={110 + i * 220} cy={796} r={10} fill="#FFE8A3" />
        <circle cx={110 + i * 220} cy={796} r={30} fill="#FFE8A3" opacity={0.2} />
      </g>
    ))}
  </g>
);

const Verse4: React.FC = () => {
  const T = useSectionLines("verse4");
  const { frame } = T;
  const cut = (i: number) => T.start(i) - 6;
  const win = (a: number, b: number | null) => {
    const A = cut(a);
    const B = b === null ? Infinity : cut(b);
    if (frame < A - 2 || frame >= B + 8) return 0;
    return Math.min(ip(frame, [A - 2, A + 8], [0, 1]), b === null ? 1 : ip(frame, [B, B + 8], [1, 0]));
  };
  const parts: [number, number | null, React.FC][] = [
    [0, 4, Gathering],
    [4, 5, Fifty],
    [5, 6, Cartwheel],
    [6, 7, Shadow],
    [7, null, Glasses],
  ];
  return (
    <AbsoluteFill style={{ background: "#0B1026" }}>
      <DubaiNight frame={frame} />
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

// lines 0-3: Sasha on the waterfront, friends arrive by plane, everyone around him, camera pulls back
const Gathering: React.FC = () => {
  const T = useSectionLines("verse4");
  const { frame } = T;
  const arriveA = T.start(1);
  const spots = [480, 720, 1200, 1440];
  const edges = [
    { x: -200, y: 300 },
    { x: 700, y: -200 },
    { x: 2100, y: 200 },
    { x: 1500, y: -220 },
  ];
  const pull = ip(frame, [T.start(2), T.end(3)], [1.25, 1.0], eio);
  const gather = ip(frame, [T.start(2), T.start(2) + 30], [0, 1], eio);
  return (
    <SVG>
      <g transform={`translate(960,${FLOOR}) scale(${pull}) translate(-960,${-FLOOR})`}>
        <Promenade />
        {FRIEND_IDS.map((id, i) => {
          const at = arriveA + i * (T.L[1].dur / 5);
          const land = ip(frame, [at, at + 28], [0, 1], eio);
          const out = { x: spots[i], y: FLOOR - 300 };
          const px = lerp(edges[i].x, out.x - 60, land);
          const py = lerp(edges[i].y, out.y - 20, land);
          const ang = (Math.atan2(out.y - 20 - edges[i].y, out.x - 60 - edges[i].x) * 180) / Math.PI;
          const leave = ip(frame, [at + 34, at + 48], [0, 1], eio);
          const step = sp(frame, at + 26, { damping: 12 });
          const drop = ip(frame, [at + 24, at + 36], [-260, 0], eo);
          const targetX = lerp(spots[i], 960 + (i < 2 ? -1 : 1) * (i % 2 === 0 ? 330 : 190), gather);
          return (
            <g key={id}>
              {frame >= at && leave < 1 && (
                <g opacity={1 - leave}>
                  <PlaneIcon x={px + leave * 300} y={py - leave * 300} angle={land < 1 ? ang : -30} s={5} color={["#F97316", "#2EC4B6", "#FF6B6B", "#E8B04B"][i]} />
                </g>
              )}
              {step > 0 && (
                <Figure look={adultFriends[id]} pose={gather > 0 ? wavePose(frame + i * 5, { eyes: "squint" }) : pose({ mouth: "grin", look: i < 2 ? 1 : -1 })} x={targetX} y={FLOOR + drop} scale={0.9 * Math.max(0.3, step)} flip={i >= 2} />
              )}
            </g>
          );
        })}
        <Figure
          look={adultSasha}
          pose={frame < T.start(1) ? pose({ holdR: "phone", armR: 30, elbowR: 120, look: 0.5 }) : pose({ armL: 140 * gather + 15, armR: 140 * gather + 15, elbowL: 10, elbowR: 10, eyes: "squint", mouth: "grin", look: Math.sin(frame * 0.05) })}
          x={960}
          y={FLOOR}
          scale={1}
        />
      </g>
    </SVG>
  );
};

const bulbsText = (txt: string, x: number, y: number, size: number, frame: number, seed: number) => (
  <g>
    <text x={x} y={y} textAnchor="middle" fontFamily={RUBIK} fontWeight={900} fontSize={size} fill="#E8B04B" opacity={0.25} stroke="#E8B04B" strokeWidth={30} strokeLinejoin="round">
      {txt}
    </text>
    <text x={x} y={y} textAnchor="middle" fontFamily={RUBIK} fontWeight={900} fontSize={size} fill="#2a1d08" stroke="#E8B04B" strokeWidth={8} strokeLinejoin="round">
      {txt}
    </text>
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontFamily={RUBIK}
      fontWeight={900}
      fontSize={size}
      fill="none"
      stroke="#FFF7D6"
      strokeWidth={16}
      strokeLinecap="round"
      strokeDasharray="0.1 34"
      strokeDashoffset={-frame * 2 + seed}
    >
      {txt}
    </text>
  </g>
);

// line 4: the "5" rolls away and comes back
const Fifty: React.FC = () => {
  const T = useSectionLines("verse4");
  const { frame } = T;
  const a = T.start(4);
  const d = T.L[4].dur;
  const flick = a + d * 0.25;
  const back = a + d * 0.6;
  const away = ip(frame, [flick, flick + d * 0.18], [0, 1], (x) => x * x);
  const ret = ip(frame, [back, back + d * 0.25], [0, 1], eo);
  const off = -away * 1200 * (1 - ret);
  const rot = -(away - ret) * 540;
  const fiveX = 760 + off;
  const wink = frame > back + d * 0.25 && frame < back + d * 0.25 + 14;
  const showEye = ret > 0.95;
  const sashaPose = frame < flick - 6 ? pose({ armR: 70, elbowR: 30, look: -1, mouth: "smile" }) : frame < flick + 4 ? pose({ armR: 95, elbowR: -10, look: -1, mouth: "o" }) : pose({ look: off > 200 ? 1 : -1, eyes: ret > 0.9 ? "squint" : "wide", mouth: ret > 0.9 ? "grin" : "o", armL: 20, armR: 20, shrug: away > 0.5 && ret < 0.5 ? 1 : 0 });
  return (
    <SVG>
      <Promenade />
      <g transform={`translate(${fiveX},560) rotate(${rot})`}>{bulbsText("5", 0, 190, 560, frame, 0)}</g>
      {showEye && (
        <g transform={`translate(${fiveX + 60},430)`}>
          {wink ? <path d="M-30,0 Q0,-24 30,0" fill="none" stroke="#FFF7D6" strokeWidth={10} strokeLinecap="round" /> : <ellipse rx={24} ry={30} fill="#FFF7D6" />}
          {!wink && <circle cx={6} cy={4} r={12} fill="#2a1d08" />}
        </g>
      )}
      {bulbsText("0", 1180, 750, 560, frame, 17)}
      <Figure look={adultSasha} pose={sashaPose} x={1000} y={FLOOR} scale={0.8} flip />
    </SVG>
  );
};

// line 5: the same cartwheel as the kid in Scene 1, same spark trail
const Cartwheel: React.FC = () => {
  const T = useSectionLines("verse4");
  const { frame } = T;
  const c0 = T.start(5);
  const cDur = T.L[5].dur;
  const hop = ip(frame, [c0 - 4, c0 + cDur * 0.15], [0, 1], eio);
  const cw = ip(frame, [c0 + cDur * 0.15, c0 + cDur], [0, 1]);
  const cartX = (f: number) => lerp(lerp(960, 300, ip(f, [c0 - 4, c0 + cDur * 0.15], [0, 1], eio)), 1650, ip(f, [c0 + cDur * 0.15, c0 + cDur], [0, 1]));
  return (
    <SVG>
      <Promenade />
      <SparkTrail frame={frame} from={c0 + cDur * 0.15} to={c0 + cDur + 30} pos={(f) => ({ x: cartX(f), y: FLOOR - 260 })} />
      <Figure look={adultSasha} pose={mixPose(pose({ armL: 100, armR: 100 }), starPose, hop)} x={cartX(frame)} y={FLOOR - Math.sin(hop * Math.PI) * 50} rotate={cw * 720} />
    </SVG>
  );
};

// line 6: his shadow on the wall is the skinny kid
const Shadow: React.FC = () => {
  const T = useSectionLines("verse4");
  const { frame } = T;
  const p = T.p(6);
  const reveal = ip(p, [0.1, 0.45], [0, 1], eio);
  const sway = Math.sin(frame * 0.12) * 6;
  return (
    <SVG>
      <defs>
        <radialGradient id="spot" cx="0.5" cy="0.55" r="0.55">
          <stop offset="0" stopColor="#F5D9A6" />
          <stop offset="0.7" stopColor="#B98A4A" />
          <stop offset="1" stopColor="#3b2a14" />
        </radialGradient>
        <filter id="shBlur">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <rect x={0} y={0} width={1920} height={930} fill="url(#spot)" />
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={i} x1={0} y1={i * 80 + 20} x2={1920} y2={i * 80 + 20} stroke="#7a5a2e" strokeOpacity={0.25} strokeWidth={3} />
      ))}
      <rect x={0} y={930} width={1920} height={150} fill="#2b2014" />
      {/* shadows: adult shadow fades into the kid's */}
      <g filter="url(#shBlur)" opacity={0.85}>
        <Figure look={adultSasha} pose={pose({ armR: 35 + sway, elbowR: 105, holdR: "thumb" })} x={1260} y={900} scale={1.25} silhouette="#1a120a" opacity={1 - reveal} />
        <Figure look={kidSasha} pose={pose({ armR: 35 + sway, elbowR: 105, holdR: "thumb", bounce: -Math.abs(Math.sin(frame * 0.2)) * 10 * reveal })} x={1260} y={900} scale={1.45} silhouette="#1a120a" opacity={reveal} />
      </g>
      <Figure look={adultSasha} pose={pose({ armR: 35 + sway, elbowR: 105, holdR: "thumb", eyes: "squint", mouth: "grin", look: 1, headTilt: reveal * 8 })} x={760} y={FLOOR} scale={1.1} />
    </SVG>
  );
};

// line 7: sunglasses on, camera flashes
const Glasses: React.FC = () => {
  const T = useSectionLines("verse4");
  const { frame } = T;
  const a = T.start(7);
  const drop = ip(frame, [a, a + 14], [0, 1], eBack);
  const S = 1.3;
  const L = adultSasha;
  const hx = 960;
  const hy = FLOOR + headY(L) * S - 0;
  const gy = lerp(hy - 500, hy - L.headR * S * 0.02, drop);
  const flashes = Array.from({ length: 14 }).map((_, i) => {
    const at = a + 10 + i * 5;
    const t = frame - at;
    if (t < 0 || t > 8) return null;
    const x = rand(i * 7) * 1920;
    const y = 150 + rand(i * 3) * 750;
    const k = 1 - t / 8;
    return (
      <g key={i}>
        <circle cx={x} cy={y} r={160 * k} fill="#fff" opacity={0.25 * k} />
        <Star x={x} y={y} r={90 * k} fill="#fff" rot={i * 20} />
      </g>
    );
  });
  const flashAll = flashes.filter(Boolean).length > 0 ? 0.12 : 0;
  return (
    <SVG>
      <Promenade />
            <Figure look={L} pose={pose({ armL: 30, elbowL: 40, armR: drop > 0.9 ? 35 : 120, elbowR: drop > 0.9 ? 105 : 40, holdR: drop > 0.9 ? "thumb" : "none", mouth: "grin", eyes: "open" })} x={hx} y={FLOOR} scale={S} />
      <g transform={`translate(${hx},${gy})`}>
        <rect x={-75} y={-22} width={68} height={42} rx={14} fill="#0b0b12" stroke="#E8B04B" strokeWidth={4} />
        <rect x={7} y={-22} width={68} height={42} rx={14} fill="#0b0b12" stroke="#E8B04B" strokeWidth={4} />
        <line x1={-7} y1={-10} x2={7} y2={-10} stroke="#E8B04B" strokeWidth={5} />
        <path d="M-60,-12 l20,0" stroke="#fff" strokeWidth={4} opacity={0.6} />
      </g>
      {flashes}
      <rect width={1920} height={1080} fill="#fff" opacity={flashAll} />
    </SVG>
  );
};
