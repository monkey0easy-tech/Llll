import React from "react";
import { AbsoluteFill } from "remotion";
import { SceneShell } from "./SceneShell";
import { SceneProps } from "./index";
import { useSectionLines } from "../lib/time";
import { Figure, mixLook, pose } from "../components/Figure";
import { adultFriends, adultSasha, FRIEND_IDS, kidSasha, studentSasha, teenSasha } from "../components/characters";
import { runPose } from "../components/poses";
import { arcCtrl, PlaneIcon, qAngle, qPoint, ROUTE, STOPS, StopId, WorldMapShapes } from "../components/WorldMap";
import { CitySymbol } from "../components/CitySymbols";
import { Polaroid } from "../components/Polaroid";
import { FriendNetwork } from "../components/FriendNetwork";
import { getPhotos } from "../lib/photos";
import { RUBIK } from "../lib/fonts";
import { clamp, eBack, eio, eo, ip, lerp, rand, sp } from "../lib/anim";

/** Scene 3, verse 2: growing up, business, plans, the route across the map, friendship lines. */
export const S3Verse2: React.FC<SceneProps> = (props) => (
  <SceneShell section="verse2" {...props}>
    <Verse2 />
  </SceneShell>
);

const BLUE = "#1E3A8A";
const ORANGE = "#F97316";
const GROUND = 900;

const Verse2: React.FC = () => {
  const T = useSectionLines("verse2");
  const { frame } = T;
  const mapAt = T.start(4) - 8;
  return (
    <AbsoluteFill style={{ background: BLUE }}>
      {frame < mapAt + 10 && (
        <AbsoluteFill style={{ opacity: ip(frame, [mapAt, mapAt + 10], [1, 0]) }}>
          <Career />
        </AbsoluteFill>
      )}
      {frame >= mapAt && (
        <AbsoluteFill style={{ opacity: ip(frame, [mapAt, mapAt + 10], [0, 1]) }}>
          <MapRoute />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ---------------- lines 0-3 ----------------
const Career: React.FC = () => {
  const T = useSectionLines("verse2");
  const { frame } = T;
  const shot = (a: number, b: number) => frame >= T.start(a) - 6 && frame < T.start(b) - 6;
  const grid = (
    <g opacity={0.18}>
      {Array.from({ length: 49 }).map((_, i) => (
        <line key={i} x1={i * 40} y1={0} x2={i * 40} y2={1080} stroke="#fff" strokeWidth={1} />
      ))}
      {Array.from({ length: 28 }).map((_, i) => (
        <line key={"h" + i} x1={0} y1={i * 40} x2={1920} y2={i * 40} stroke="#fff" strokeWidth={1} />
      ))}
    </g>
  );

  // line 0: calendar pages fly up while the boy grows up walking
  const g = T.p(0);
  const stage = g * 3;
  const look =
    stage < 1 ? mixLook(kidSasha, teenSasha, eio(clamp(stage))) : stage < 2 ? mixLook(teenSasha, studentSasha, eio(clamp(stage - 1))) : mixLook(studentSasha, adultSasha, eio(clamp(stage - 2)));
  const colorIn = ip(g, [0.85, 1], [0, 1]);
  const pages: React.ReactNode[] = [];
  for (let i = 0; i < 14; i++) {
    const at = T.start(0) + i * (T.L[0].dur / 14);
    const t = frame - at;
    if (t < 0 || t > 40) continue;
    pages.push(
      <g key={i} transform={`translate(${300 + t * 6 + rand(i) * 60},${380 - t * 18}) rotate(${t * (rand(i + 2) * 8 - 4)})`} opacity={clamp(1 - t / 40)}>
        <rect x={-90} y={-110} width={180} height={200} fill="#fff" stroke="#cbd5e1" strokeWidth={2} />
        <rect x={-90} y={-110} width={180} height={44} fill={ORANGE} />
        <text x={0} y={50} textAnchor="middle" fontFamily={RUBIK} fontWeight={900} fontSize={96} fill={BLUE}>
          {((i * 7) % 28) + 1}
        </text>
      </g>,
    );
  }
  const calTop = ((T.start(0) + T.L[0].dur) - frame) > 0 ? ((frame - T.start(0)) / (T.L[0].dur / 14)) | 0 : 13;

  // line 1: bars, Sasha climbs them
  const bars = [180, 300, 430, 580];
  const barX = (i: number) => 760 + i * 200;
  const barsIn = (i: number) => ip(frame, [T.start(1) - 4 + i * 6, T.start(1) + 18 + i * 6], [0, 1], eBack);
  const climb = ip(frame, [T.start(1) + 20, T.start(1) + T.L[1].dur], [0, 4]);
  const step = Math.min(3, Math.floor(climb));
  const fr = climb - step;
  const cx = climb <= 0 ? 600 : lerp(step === 0 ? 600 : barX(step - 1), barX(step), clamp(fr * 1.4));
  const prevH = step === 0 ? 0 : bars[step - 1];
  const hop = Math.sin(clamp(fr * 1.4) * Math.PI) * 70;
  const cy = GROUND - lerp(prevH, bars[step], clamp(fr * 1.4)) - hop;

  // lines 2-3: blueprint unrolls, checks appear
  const unroll = ip(frame, [T.start(2) - 4, T.start(2) + 24], [0, 1], eio);
  const checks = [0, 1, 2, 3].map((i) => sp(frame, T.start(3) + i * (T.L[3].dur / 5), { damping: 9 }));

  return (
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      {grid}
      {shot(0, 1) && (
        <g>
          {/* tear-off calendar */}
          <g transform="translate(300,380)">
            <rect x={-100} y={-125} width={200} height={225} fill="#fff" stroke="#cbd5e1" strokeWidth={3} />
            <rect x={-100} y={-125} width={200} height={48} fill={ORANGE} />
            <circle cx={-50} cy={-125} r={8} fill="#334155" />
            <circle cx={50} cy={-125} r={8} fill="#334155" />
            <text x={0} y={55} textAnchor="middle" fontFamily={RUBIK} fontWeight={900} fontSize={104} fill={BLUE}>
              {(((calTop + 1) * 7) % 28) + 1}
            </text>
          </g>
          {pages}
          <line x1={0} y1={GROUND + 2} x2={1920} y2={GROUND + 2} stroke="#fff" strokeOpacity={0.4} strokeWidth={4} />
          <Figure look={look} pose={runPose(frame, 0.32, { armL: 18, armR: 18 })} x={1060} y={GROUND} scale={1.15} silhouette="#F8FAFC" opacity={1 - colorIn} />
          {colorIn > 0 && <Figure look={adultSasha} pose={runPose(frame, 0.32)} x={1060} y={GROUND} scale={1.15} opacity={colorIn} />}
        </g>
      )}
      {shot(1, 2) && (
        <g>
          <line x1={0} y1={GROUND + 2} x2={1920} y2={GROUND + 2} stroke="#fff" strokeOpacity={0.5} strokeWidth={4} />
          {bars.map((h, i) => {
            const k = barsIn(i);
            return <rect key={i} x={barX(i) - 80} y={GROUND - h * k} width={160} height={h * k} fill={i % 2 ? "#fff" : ORANGE} stroke="#0f1d4a" strokeWidth={4} />;
          })}
          <path
            d={`M700,${GROUND - 120} L${barX(0)},${GROUND - 220} L${barX(1)},${GROUND - 340} L${barX(2)},${GROUND - 470} L${barX(3)},${GROUND - 640}`}
            fill="none"
            stroke="#FDE68A"
            strokeWidth={8}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - ip(frame, [T.start(1), T.start(1) + T.L[1].dur * 0.8], [0, 1])}
          />
          <Figure look={adultSasha} pose={fr > 0.7 || climb <= 0 ? pose({ armR: 150, elbowR: 10, holdR: "thumb", eyes: "squint" }) : runPose(frame, 0.5)} x={cx} y={cy} scale={0.8} />
        </g>
      )}
      {shot(2, 4) && (
        <g>
          {/* blueprint */}
          <g transform="translate(420,170)">
            <rect x={0} y={0} width={1100 * unroll} height={620} fill="#1d4ed8" stroke="#bfdbfe" strokeWidth={4} />
            <clipPath id="bpClip">
              <rect x={0} y={0} width={1100 * unroll} height={620} />
            </clipPath>
            <g clipPath="url(#bpClip)" stroke="#dbeafe" strokeWidth={3} fill="none">
              {Array.from({ length: 28 }).map((_, i) => (
                <line key={i} x1={i * 40} y1={0} x2={i * 40} y2={620} strokeOpacity={0.2} strokeWidth={1} />
              ))}
              {Array.from({ length: 16 }).map((_, i) => (
                <line key={"h" + i} x1={0} y1={i * 40} x2={1100} y2={i * 40} strokeOpacity={0.2} strokeWidth={1} />
              ))}
              {/* a tower, a plane, a route, a chart, all in white lines */}
              <path d="M120,560 L120,240 L200,180 L280,240 L280,560 Z M150,280 h100 M150,340 h100 M150,400 h100 M150,460 h100" />
              <path d="M380,520 Q520,300 700,360" strokeDasharray="14 12" />
              <path d="M700,360 l-30,-6 l10,-12 Z" fill="#dbeafe" />
              <path d="M780,540 L780,380 M840,540 L840,300 M900,540 L900,220 M960,540 L960,160" strokeWidth={22} strokeOpacity={0.7} />
              <circle cx={470} cy={170} r={70} />
              <path d="M400,170 h140 M470,100 v140 M420,120 Q470,170 420,220 M520,120 Q470,170 520,220" strokeWidth={2} />
            </g>
            {/* roll */}
            <rect x={1100 * unroll - 18} y={-14} width={36} height={648} rx={18} fill="#93c5fd" stroke="#0f1d4a" strokeWidth={4} />
            {checks.map((c, i) => {
              const pos = [
                [200, 140],
                [560, 300],
                [870, 110],
                [470, 470],
              ][i];
              return c > 0 ? (
                <g key={i} transform={`translate(${pos[0]},${pos[1]}) scale(${c})`}>
                  <circle r={52} fill={ORANGE} stroke="#fff" strokeWidth={6} />
                  <path d="M-24,2 L-6,22 L28,-20" fill="none" stroke="#fff" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
                </g>
              ) : null;
            })}
          </g>
          <Figure look={adultSasha} pose={pose({ armL: 105, elbowL: 5, mouth: frame > T.start(3) ? "grin" : "smile", eyes: frame > T.start(3) + 30 ? "squint" : "open", look: -1, holdR: frame > T.start(3) + 30 ? "thumb" : "none", armR: frame > T.start(3) + 30 ? 35 : 12, elbowR: frame > T.start(3) + 30 ? 105 : 8 })} x={1660} y={GROUND + 60} scale={1.1} />
        </g>
      )}
    </svg>
  );
};

// ---------------- lines 4-7: the map ----------------
const VB = { x: 430, y: 40, w: 460, h: 258.75 };
const toScreen = (p: { x: number; y: number }) => ({ x: ((p.x - VB.x) * 1920) / VB.w, y: ((p.y - VB.y) * 1080) / VB.h });

const MapRoute: React.FC = () => {
  const T = useSectionLines("verse2");
  const { frame } = T;
  // flight schedule: europe->russia during line 4, russia->singapore->dubai during line 5
  const a4 = T.start(4);
  const e4 = T.start(5);
  const e5 = T.start(6) - 6;
  const legs: { from: StopId; to: StopId; a: number; b: number }[] = [
    { from: "europe", to: "russia", a: a4 + (e4 - a4) * 0.3, b: e4 - 6 },
    { from: "russia", to: "singapore", a: e4, b: e4 + (e5 - e4) * 0.45 },
    { from: "singapore", to: "dubai", a: e4 + (e5 - e4) * 0.55, b: e5 },
  ];
  const arrival: Record<StopId, number> = { europe: a4, russia: legs[0].b, singapore: legs[1].b, dubai: legs[2].b };
  const scr = (id: StopId) => toScreen(STOPS[id]);
  let plane = { x: scr("europe").x, y: scr("europe").y, ang: 0 };
  for (const l of legs) {
    const A = scr(l.from), B = scr(l.to), C = arcCtrl(A, B);
    if (frame >= l.a) {
      const t = ip(frame, [l.a, l.b], [0, 1], eio);
      const p = qPoint(A, C, B, t);
      plane = { x: p.x, y: p.y, ang: qAngle(A, C, B, Math.min(0.99, Math.max(0.01, t))) };
    }
  }
  const travel = getPhotos("travel", 4, 6);
  const netStart = T.start(6);
  const net = ip(frame, [netStart, T.start(7) + 10], [0, 1]);
  const mesh = ip(frame, [T.start(7), T.end(7)], [0, 1]);
  const friendsNodes = [
    { x: 160, y: 200 },
    { x: 520, y: 140 },
    { x: 1150, y: 170 },
    { x: 1500, y: 360 },
    { x: 1760, y: 600 },
    { x: 560, y: 720 },
    { x: 1200, y: 840 },
    { x: 260, y: 520 },
  ];
  const fade6 = ip(frame, [netStart - 6, netStart + 10], [0, 1]);
  return (
    <AbsoluteFill>
      <svg viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <WorldMapShapes />
      </svg>
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {legs.map((l, i) => {
          const A = scr(l.from), B = scr(l.to), C = arcCtrl(A, B);
          const t = ip(frame, [l.a, l.b], [0, 1], eio);
          return (
            <g key={i}>
              <path d={`M${A.x},${A.y} Q${C.x},${C.y} ${B.x},${B.y}`} fill="none" stroke={ORANGE} strokeOpacity={0.35} strokeWidth={5} strokeDasharray="4 16" strokeLinecap="round" />
              <path d={`M${A.x},${A.y} Q${C.x},${C.y} ${B.x},${B.y}`} fill="none" stroke={ORANGE} strokeWidth={7} strokeDasharray="4 16" strokeLinecap="round" pathLength={1000} style={{ strokeDasharray: `${t * 1000} 1000` }} opacity={0} />
              {/* drawn part: dotted, clipped by progress */}
              {Array.from({ length: 40 }).map((_, k) => {
                const tt = k / 40;
                if (tt > t) return null;
                const p = qPoint(A, C, B, tt);
                return <circle key={k} cx={p.x} cy={p.y} r={5} fill={ORANGE} />;
              })}
            </g>
          );
        })}
        {ROUTE.map((id) => {
          const p = scr(id);
          const at = arrival[id];
          const pop = sp(frame, at, { damping: 10 });
          const symOp = ip(frame, [at, at + 6, at + 36, at + 46], [0, 1, 1, 0]);
          return (
            <g key={id}>
              <circle cx={p.x} cy={p.y} r={14 * pop} fill="#fff" stroke={ORANGE} strokeWidth={6} />
              {symOp > 0 && <CitySymbol id={id} x={p.x} y={p.y - 120} s={pop * 1.2} opacity={symOp} frame={frame} />}
            </g>
          );
        })}
        {frame < netStart + 10 && <PlaneIcon x={plane.x} y={plane.y} angle={plane.ang} s={3.2} />}

        {/* suitcase with stickers */}
        <g transform={`translate(250,${860 + (1 - fade6) * 0})`} opacity={1 - fade6 * 0.85}>
          <path d="M-50,-120 v-30 h100 v30" fill="none" stroke="#3b2a1a" strokeWidth={12} />
          <rect x={-170} y={-120} width={340} height={230} rx={22} fill="#C2410C" stroke="#1f2937" strokeWidth={6} />
          <rect x={-170} y={-20} width={340} height={14} fill="#9A3412" />
          {ROUTE.map((id, i) => {
            const at = arrival[id] + 4;
            if (frame < at) return null;
            const slap = ip(frame, [at, at + 6], [2.2, 1], eo);
            const pos = [
              [-90, -70, -12],
              [70, -75, 8],
              [-80, 50, 6],
              [80, 50, -10],
            ][i];
            return (
              <g key={id} transform={`translate(${pos[0]},${pos[1]}) rotate(${pos[2]}) scale(${slap})`}>
                <rect x={-78} y={-26} width={156} height={52} rx={10} fill={["#FDE68A", "#ffffff", "#A7F3D0", "#FBCFE8"][i]} stroke="#1f2937" strokeWidth={3} />
                <text x={0} y={10} textAnchor="middle" fontFamily={RUBIK} fontWeight={800} fontSize={id === "singapore" ? 24 : 28} fill="#1f2937">
                  {STOPS[id].label}
                </text>
              </g>
            );
          })}
        </g>

        {/* friendship network */}
        {fade6 > 0 && (
          <g opacity={fade6}>
            <rect width={1920} height={1080} fill="#0b1026" opacity={0.35} />
            {ROUTE.map((id, i) => (
              <FriendNetwork key={id} hub={scr(id)} nodes={friendsNodes.filter((_, k) => (k + i) % 2 === 0)} progress={clamp(net * 1.3 - i * 0.1)} frame={frame} mesh={i === 0 ? mesh : 0} />
            ))}
            {friendsNodes.map((p, i) => (
              <Figure key={i} look={adultFriends[FRIEND_IDS[i % 4]]} pose={pose({ holdR: "wave", armR: 150 + Math.sin(frame * 0.3 + i) * 15, elbowR: 10 })} x={p.x} y={p.y + 30} scale={0.22 * sp(frame, netStart + i * 3)} />
            ))}
            {ROUTE.map((id, i) => {
              const p = scr(id);
              return <Figure key={id} look={adultSasha} pose={pose({ holdR: "phone", armR: 30, elbowR: 120, eyes: "squint" })} x={p.x} y={p.y + 50} scale={0.3 * sp(frame, netStart - 6 + i * 3)} />;
            })}
          </g>
        )}
      </svg>
      {/* travel photos slide in on the right */}
      {travel.map((ph, i) => {
        const at = a4 + i * ((e5 - a4) / travel.length);
        if (frame < at) return null;
        const s = ip(frame, [at, at + 14], [0, 1], eo);
        const out = ip(frame, [netStart - 8, netStart + 4], [0, 1], eio);
        return (
          <Polaroid
            key={ph.key}
            src={ph.src}
            x={lerp(2300, 1640 - (i % 2) * 80, s) + out * 600}
            y={200 + (i % 3) * 230}
            width={300}
            seed={i + 61}
            frame={frame}
            kb={ip(frame, [at, netStart], [0, 1])}
          />
        );
      })}
    </AbsoluteFill>
  );
};
