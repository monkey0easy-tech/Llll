import React, { useId } from "react";
import { clamp, lerp } from "../lib/anim";

/**
 * One parametric cartoon rig for every character (kid Sasha, adult Sasha,
 * friends as kids and grown-ups). Renders an SVG <g>, origin = point between
 * the feet on the ground, y grows downward like normal SVG.
 */

export type HairStyle =
  | "messy"
  | "short"
  | "bowl"
  | "pigtails"
  | "curly"
  | "side"
  | "balding"
  | "bun"
  | "teen";
export type TopKind = "tank" | "tee" | "blazer" | "uniform" | "dress" | "sweater" | "polo" | "hoodie";
export type BottomKind = "shorts" | "pants" | "none";

export type Look = {
  headR: number;
  earR: number;
  neckLen: number;
  torsoLen: number;
  torsoTopW: number;
  torsoBotW: number;
  legLen: number;
  armLen: number;
  limbW: number;
  belly: number; // 0..1 roundness
  skin: string;
  hair: string;
  hairStyle: HairStyle;
  top: TopKind;
  topColor: string;
  stripe?: string;
  bottom: BottomKind;
  bottomColor: string;
  shoes: string;
  glasses?: boolean;
  freckles?: boolean;
  stubble?: boolean;
  beard?: string;
  starPin?: boolean;
  pocketPencil?: boolean;
  bows?: string;
};

export type Eyes = "open" | "squint" | "winkL" | "winkR" | "closed" | "wide";
export type Mouth = "grin" | "smile" | "open" | "o" | "flat" | "laugh";
export type Hold = "none" | "thumb" | "suitcase" | "phone" | "pencil" | "photo" | "wave";

export type Pose = {
  armL: number; // degrees from hanging down, positive = away from body / up
  armR: number;
  elbowL: number;
  elbowR: number;
  legL: number;
  legR: number;
  kneeL: number;
  kneeR: number;
  tilt: number; // upper body lean, degrees
  headTilt: number;
  bounce: number; // vertical offset (px, negative = up)
  look: number; // pupils -1..1
  eyes: Eyes;
  mouth: Mouth;
  holdL: Hold;
  holdR: Hold;
  shrug: number; // 0..1 shoulders up
};

export const basePose: Pose = {
  armL: 12,
  armR: 12,
  elbowL: 8,
  elbowR: 8,
  legL: 6,
  legR: 6,
  kneeL: 0,
  kneeR: 0,
  tilt: 0,
  headTilt: 0,
  bounce: 0,
  look: 0,
  eyes: "open",
  mouth: "grin",
  holdL: "none",
  holdR: "none",
  shrug: 0,
};

export const pose = (p: Partial<Pose>): Pose => ({ ...basePose, ...p });

const NUM_POSE: (keyof Pose)[] = [
  "armL",
  "armR",
  "elbowL",
  "elbowR",
  "legL",
  "legR",
  "kneeL",
  "kneeR",
  "tilt",
  "headTilt",
  "bounce",
  "look",
  "shrug",
];

/** blend two poses, discrete fields switch at t = 0.5 */
export const mixPose = (a: Pose, b: Pose, t: number): Pose => {
  const tt = clamp(t);
  const out = { ...(tt < 0.5 ? a : b) } as Pose;
  for (const k of NUM_POSE) (out as any)[k] = lerp(a[k] as number, b[k] as number, tt);
  return out;
};

const NUM_LOOK: (keyof Look)[] = [
  "headR",
  "earR",
  "neckLen",
  "torsoLen",
  "torsoTopW",
  "torsoBotW",
  "legLen",
  "armLen",
  "limbW",
  "belly",
];
export const mixLook = (a: Look, b: Look, t: number): Look => {
  const tt = clamp(t);
  const out = { ...(tt < 0.5 ? a : b) } as Look;
  for (const k of NUM_LOOK) (out as any)[k] = lerp(a[k] as number, b[k] as number, tt);
  return out;
};

export const figureHeight = (l: Look) => l.legLen + l.torsoLen + l.neckLen + l.headR * 1.9;
/** y (negative) of the head centre, useful for placing props above heads */
export const headY = (l: Look) => -(l.legLen + l.torsoLen + l.neckLen + l.headR * 0.85);

const INK = "#232333";
const rad = (d: number) => (d * Math.PI) / 180;
type Pt = { x: number; y: number };
const dir = (deg: number, side: number): Pt => ({ x: side * Math.sin(rad(deg)), y: Math.cos(rad(deg)) });
const add = (a: Pt, b: Pt, k = 1): Pt => ({ x: a.x + b.x * k, y: a.y + b.y * k });
const ptsPath = (...p: Pt[]) => p.map((q, i) => `${i ? "L" : "M"}${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(" ");
const along = (a: Pt, b: Pt, t: number): Pt => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });

export type FigureProps = {
  look: Look;
  pose?: Pose;
  x?: number;
  y?: number;
  scale?: number;
  flip?: boolean;
  rotate?: number; // around the body centre
  /** stroke-by-stroke drawing, 0..1 (undefined = fully drawn) */
  draw?: number;
  /** render as single-colour silhouette */
  silhouette?: string;
  opacity?: number;
  /** id of an SVG filter to apply (e.g. hand-drawn wobble) */
  filter?: string;
  children?: React.ReactNode;
};

export const Figure: React.FC<FigureProps> = ({
  look: L,
  pose: P = basePose,
  x = 0,
  y = 0,
  scale = 1,
  flip,
  rotate = 0,
  draw,
  silhouette,
  opacity = 1,
  filter,
  children,
}) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const sil = silhouette;
  const col = (c: string) => (sil ? sil : c);
  const ink = sil ? sil : INK;
  const sw = sil ? 0 : Math.max(2.5, L.limbW * 0.28);

  // part-by-part drawing
  const N = 9;
  const D = (i: number) => {
    if (draw === undefined) return {};
    const p = clamp(draw * N - i * 0.85, 0, 1);
    return {
      pathLength: 1,
      strokeDasharray: "1 1",
      strokeDashoffset: 1 - p,
      fillOpacity: clamp((p - 0.75) / 0.25),
      opacity: p > 0 ? 1 : 0,
    };
  };
  const Dl = (i: number) => {
    // limbs are pure strokes, no fill fading
    if (draw === undefined) return {};
    const p = clamp(draw * N - i * 0.85, 0, 1);
    return { pathLength: 1, strokeDasharray: "1 1", strokeDashoffset: 1 - p, opacity: p > 0 ? 1 : 0 };
  };
  const faceP = draw === undefined ? 1 : clamp(draw * N - 8 * 0.85, 0, 1);

  const hipY = -L.legLen + P.bounce;
  const shY = hipY - L.torsoLen;
  const neckTop = shY - L.neckLen;
  const hy = neckTop - L.headR * 0.82;
  const R = L.headR;
  const tw = L.torsoTopW;
  const bw = L.torsoBotW;

  // ---------- limbs ----------
  const shrugUp = P.shrug * L.limbW * 2.2;
  const shoulder = (side: number): Pt => ({ x: side * (tw / 2 - L.limbW * 0.35), y: shY + L.limbW * 0.6 - shrugUp });
  const arm = (side: number) => {
    const a = side < 0 ? P.armL : P.armR;
    const b = side < 0 ? P.elbowL : P.elbowR;
    const s = shoulder(side);
    const e = add(s, dir(a, side), L.armLen * 0.5);
    const h = add(e, dir(a + b, side), L.armLen * 0.5);
    return { s, e, h };
  };
  const leg = (side: number) => {
    const a = side < 0 ? P.legL : P.legR;
    const k = side < 0 ? P.kneeL : P.kneeR;
    const hp: Pt = { x: side * bw * 0.26, y: hipY - L.limbW * 0.3 };
    const kn = add(hp, dir(a, side), L.legLen * 0.5);
    const ft = add(kn, dir(a - k, side), L.legLen * 0.5 - L.limbW * 0.3);
    return { hp, kn, ft };
  };

  const sleeveFull = ["blazer", "uniform", "sweater", "hoodie"].includes(L.top);
  const sleeveShort = ["tee", "polo", "dress"].includes(L.top);
  const legFull = L.bottom === "pants";
  const legShort = L.bottom === "shorts";

  const handR = L.limbW * 0.75 + 4;

  const renderHand = (side: number, h: Pt, e: Pt, hold: Hold, idx: number) => {
    const out: React.ReactNode[] = [];
    if (hold === "thumb") {
      // fist with thumb pointing straight up (world up)
      const r = handR * 1.25;
      out.push(
        <g key="t" {...Dl(idx)}>
          <rect x={h.x - r} y={h.y - r * 0.9} width={r * 2} height={r * 1.8} rx={r * 0.7} fill={col(L.skin)} stroke={ink} strokeWidth={sw} />
          <path
            d={`M${h.x - side * r * 0.2},${h.y - r * 0.6} L${h.x - side * r * 0.25},${h.y - r * 2.1}`}
            stroke={ink}
            strokeWidth={r * 0.75 + sw * 2}
            strokeLinecap="round"
          />
          <path
            d={`M${h.x - side * r * 0.2},${h.y - r * 0.6} L${h.x - side * r * 0.25},${h.y - r * 2.1}`}
            stroke={col(L.skin)}
            strokeWidth={r * 0.75}
            strokeLinecap="round"
          />
        </g>,
      );
      return out;
    }
    if (hold === "wave") {
      const r = handR * 1.15;
      out.push(
        <g key="w">
          {[-1, -0.35, 0.3, 0.95].map((k, i) => (
            <line key={i} x1={h.x + k * r * 0.5} y1={h.y} x2={h.x + k * r * 0.95} y2={h.y - r * 1.6} stroke={ink} strokeWidth={r * 0.42 + sw * 2} strokeLinecap="round" />
          ))}
          {[-1, -0.35, 0.3, 0.95].map((k, i) => (
            <line key={"s" + i} x1={h.x + k * r * 0.5} y1={h.y} x2={h.x + k * r * 0.95} y2={h.y - r * 1.6} stroke={col(L.skin)} strokeWidth={r * 0.42} strokeLinecap="round" />
          ))}
          <circle cx={h.x} cy={h.y} r={r * 0.9} fill={col(L.skin)} stroke={ink} strokeWidth={sw} />
        </g>,
      );
      return out;
    }
    if (hold === "suitcase") {
      const w = L.limbW * 2.2 + 70;
      const hh = w * 0.72;
      out.push(
        <g key="s">
          <path d={`M${h.x - w * 0.18},${h.y + 4} v-10 h${w * 0.36} v10`} fill="none" stroke={col("#3b2a1a")} strokeWidth={6} />
          <rect x={h.x - w / 2} y={h.y + 4} width={w} height={hh} rx={10} fill={col("#C2410C")} stroke={ink} strokeWidth={sw} />
          <rect x={h.x - w / 2 + 8} y={h.y + 4 + hh * 0.45} width={w - 16} height={7} fill={col("#9A3412")} />
        </g>,
      );
    }
    if (hold === "phone") {
      out.push(
        <g key="p">
          <rect x={h.x - 13} y={h.y - 34} width={26} height={46} rx={5} fill={col("#111827")} stroke={ink} strokeWidth={2} />
          {!sil && <rect x={h.x - 9} y={h.y - 29} width={18} height={34} rx={2} fill="#7dd3fc" />}
        </g>,
      );
    }
    if (hold === "pencil") {
      out.push(<RedPencilSvg key="pc" x={h.x} y={h.y} len={L.limbW * 5 + 70} angle={-25 * side} sil={sil} />);
    }
    if (hold === "photo") {
      const w = 170;
      out.push(
        <g key="ph" transform={`translate(${h.x},${h.y - 70}) rotate(${-6 * side})`}>
          <rect x={-w / 2} y={-w * 0.65} width={w} height={w * 1.18} fill={col("#fff")} stroke="#bbb" strokeWidth={2} />
          <rect x={-w / 2 + 9} y={-w * 0.65 + 9} width={w - 18} height={w - 26} fill={col("#d8c29d")} />
          {!sil && <MiniKid x={0} y={w * 0.2} s={0.3} />}
        </g>,
      );
    }
    out.push(<circle key="h" cx={h.x} cy={h.y} r={handR} fill={col(L.skin)} stroke={ink} strokeWidth={sw} {...D(idx)} />);
    return out;
  };

  const renderArm = (side: number, idx: number) => {
    const { s, e, h } = arm(side);
    const hold = side < 0 ? P.holdL : P.holdR;
    const handEnd = along(e, h, 0.88);
    const sleeveCol = col(L.top === "dress" ? L.topColor : L.topColor);
    return (
      <g key={"arm" + side}>
        <path d={ptsPath(s, e, handEnd)} fill="none" stroke={ink} strokeWidth={L.limbW + sw * 2} strokeLinecap="round" strokeLinejoin="round" {...Dl(idx)} />
        <path d={ptsPath(s, e, handEnd)} fill="none" stroke={col(L.skin)} strokeWidth={L.limbW} strokeLinecap="round" strokeLinejoin="round" {...Dl(idx)} />
        {sleeveFull && (
          <path d={ptsPath(s, e, along(e, h, 0.78))} fill="none" stroke={sleeveCol} strokeWidth={L.limbW + 6} strokeLinecap="round" strokeLinejoin="round" {...Dl(idx)} />
        )}
        {sleeveFull && L.top === "blazer" && !sil && (
          <path d={ptsPath(along(e, h, 0.72), along(e, h, 0.8))} stroke="#fff" strokeWidth={L.limbW + 4} strokeLinecap="butt" />
        )}
        {sleeveShort && (
          <path d={ptsPath(s, along(s, e, 0.5))} fill="none" stroke={sleeveCol} strokeWidth={L.limbW + 10} strokeLinecap="round" {...Dl(idx)} />
        )}
        {renderHand(side, h, e, hold, idx)}
      </g>
    );
  };

  const renderLeg = (side: number, idx: number) => {
    const { hp, kn, ft } = leg(side);
    const shoeW = L.limbW * 1.6 + 12;
    return (
      <g key={"leg" + side}>
        <path d={ptsPath(hp, kn, ft)} fill="none" stroke={ink} strokeWidth={L.limbW + sw * 2} strokeLinecap="round" strokeLinejoin="round" {...Dl(idx)} />
        <path d={ptsPath(hp, kn, ft)} fill="none" stroke={col(L.skin)} strokeWidth={L.limbW} strokeLinecap="round" strokeLinejoin="round" {...Dl(idx)} />
        {legFull && (
          <path d={ptsPath(hp, kn, along(kn, ft, 0.92))} fill="none" stroke={col(L.bottomColor)} strokeWidth={L.limbW + 8} strokeLinecap="round" strokeLinejoin="round" {...Dl(idx)} />
        )}
        {legShort && (
          <path d={ptsPath(hp, along(hp, kn, 0.55))} fill="none" stroke={col(L.bottomColor)} strokeWidth={L.limbW + 16} strokeLinecap="butt" {...Dl(idx)} />
        )}
        <ellipse
          cx={ft.x + side * shoeW * 0.25}
          cy={ft.y + L.limbW * 0.2}
          rx={shoeW * 0.62}
          ry={L.limbW * 0.55 + 5}
          fill={col(L.shoes)}
          stroke={ink}
          strokeWidth={sw}
          {...D(idx)}
        />
      </g>
    );
  };

  // ---------- torso ----------
  const bellyBulge = L.belly * bw * 0.35;
  const torsoPath = `M${-tw / 2},${shY - shrugUp * 0.4}
    Q0,${shY - 6 - shrugUp * 0.4} ${tw / 2},${shY - shrugUp * 0.4}
    Q${tw / 2 + bellyBulge},${(shY + hipY) / 2} ${bw / 2},${hipY + 4}
    Q0,${hipY + 10} ${-bw / 2},${hipY + 4}
    Q${-tw / 2 - bellyBulge},${(shY + hipY) / 2} ${-tw / 2},${shY - shrugUp * 0.4} Z`;
  const dressPath = `M${-tw / 2},${shY} Q0,${shY - 6} ${tw / 2},${shY} L${tw / 2 + 4},${(shY + hipY) / 2}
    L${bw * 1.25},${hipY + L.legLen * 0.38} Q0,${hipY + L.legLen * 0.44} ${-bw * 1.25},${hipY + L.legLen * 0.38}
    L${-tw / 2 - 4},${(shY + hipY) / 2} Z`;

  const clipId = `torso${uid}`;
  const renderTorso = () => (
    <g {...D(3)}>
      <defs>
        <clipPath id={clipId}>
          <path d={L.top === "dress" ? dressPath : torsoPath} />
        </clipPath>
      </defs>
      {/* bottoms waistband / shorts top */}
      {L.bottom !== "none" && (
        <path
          d={`M${-bw / 2 - 2},${hipY - 8} L${bw / 2 + 2},${hipY - 8} L${bw / 2 + 4},${hipY + L.limbW * 1.3} L${-bw / 2 - 4},${hipY + L.limbW * 1.3} Z`}
          fill={col(L.bottomColor)}
          stroke={ink}
          strokeWidth={sw}
          strokeLinejoin="round"
          {...D(3)}
        />
      )}
      <path d={L.top === "dress" ? dressPath : torsoPath} fill={col(L.topColor)} stroke={ink} strokeWidth={sw} strokeLinejoin="round" {...D(3)} />
      {!sil && (
        <g clipPath={`url(#${clipId})`} opacity={draw === undefined ? 1 : clamp(draw * N - 3 * 0.85 - 0.6)}>
          {L.stripe &&
            Array.from({ length: 12 }).map((_, i) => (
              <rect key={i} x={-tw} y={shY + 6 + i * (L.torsoLen / 7)} width={tw * 2} height={L.torsoLen / 14} fill={L.stripe} />
            ))}
          {L.top === "tank" && (
            <>
              <path d={`M${-tw * 0.18},${shY - 10} Q0,${shY + tw * 0.32} ${tw * 0.18},${shY - 10}`} fill={L.skin} stroke={INK} strokeWidth={sw * 0.8} />
            </>
          )}
          {L.top === "blazer" && (
            <>
              {/* shirt V */}
              <path d={`M${-tw * 0.22},${shY - 4} L0,${shY + L.torsoLen * 0.55} L${tw * 0.22},${shY - 4} Z`} fill="#fff" />
              <path d={`M${-tw * 0.1},${shY - 2} L0,${shY + 16} L${tw * 0.1},${shY - 2} Z`} fill={L.skin} />
              {/* open collar points */}
              <path d={`M${-tw * 0.2},${shY - 6} L${-tw * 0.05},${shY + 22} L${-tw * 0.26},${shY + 12} Z`} fill="#f1f5f9" stroke={INK} strokeWidth={1.5} />
              <path d={`M${tw * 0.2},${shY - 6} L${tw * 0.05},${shY + 22} L${tw * 0.26},${shY + 12} Z`} fill="#f1f5f9" stroke={INK} strokeWidth={1.5} />
              {/* lapels */}
              <path d={`M${-tw * 0.24},${shY - 4} L${-tw * 0.36},${shY + L.torsoLen * 0.25} L${-tw * 0.18},${shY + L.torsoLen * 0.3} L0,${shY + L.torsoLen * 0.58}`} fill="none" stroke="#0f1d4a" strokeWidth={4} />
              <path d={`M${tw * 0.24},${shY - 4} L${tw * 0.36},${shY + L.torsoLen * 0.25} L${tw * 0.18},${shY + L.torsoLen * 0.3} L0,${shY + L.torsoLen * 0.58}`} fill="none" stroke="#0f1d4a" strokeWidth={4} />
              <line x1={0} y1={shY + L.torsoLen * 0.58} x2={0} y2={hipY + 6} stroke="#0f1d4a" strokeWidth={3} />
              <circle cx={-6} cy={shY + L.torsoLen * 0.7} r={4} fill="#0f1d4a" />
              {/* breast pocket */}
              <rect x={tw * 0.12} y={shY + L.torsoLen * 0.3} width={tw * 0.26} height={6} fill="#0f1d4a" />
            </>
          )}
          {L.top === "uniform" && (
            <>
              <path d={`M${-tw * 0.3},${shY - 4} L0,${shY + 18} L${tw * 0.3},${shY - 4} L${tw * 0.1},${shY + 14} L0,${shY + 26} L${-tw * 0.1},${shY + 14} Z`} fill="#fff" stroke={INK} strokeWidth={1.5} />
              <line x1={0} y1={shY + 26} x2={0} y2={hipY + 4} stroke="#0b1430" strokeWidth={3} />
              {[0.35, 0.55, 0.75].map((k) => (
                <circle key={k} cx={-5} cy={shY + L.torsoLen * k} r={3} fill="#d4af37" />
              ))}
            </>
          )}
          {(L.top === "polo" || L.top === "tee") && (
            <path d={`M${-tw * 0.2},${shY - 4} L0,${shY + 18} L${tw * 0.2},${shY - 4}`} fill={L.skin} stroke={INK} strokeWidth={1.5} />
          )}
          {L.top === "sweater" && (
            <path d={`M${-tw * 0.22},${shY - 3} Q0,${shY + 20} ${tw * 0.22},${shY - 3}`} fill="#fff" stroke={INK} strokeWidth={1.5} />
          )}
          {L.top === "hoodie" && (
            <>
              <path d={`M${-tw * 0.3},${shY - 2} Q0,${shY + 30} ${tw * 0.3},${shY - 2}`} fill="none" stroke={INK} strokeWidth={2} />
              <line x1={-6} y1={shY + 14} x2={-8} y2={shY + 46} stroke="#fff" strokeWidth={3} />
              <line x1={6} y1={shY + 14} x2={8} y2={shY + 46} stroke="#fff" strokeWidth={3} />
            </>
          )}
        </g>
      )}
      {L.starPin && !sil && <Star x={tw * 0.24} y={shY + L.torsoLen * 0.28} r={7} fill="#E11D2E" />}
    </g>
  );

  // pocket pencil sits in front of the torso
  const pocketPencil =
    L.pocketPencil && !sil ? (
      <g>
        <RedPencilSvg x={tw * 0.25} y={shY + L.torsoLen * 0.3 + 4} len={L.limbW * 3.2 + 40} angle={8} tipUp />
        <rect x={tw * 0.12} y={shY + L.torsoLen * 0.3} width={tw * 0.26} height={7} fill={L.topColor} />
      </g>
    ) : null;

  // ---------- head ----------
  const renderHead = () => {
    const eyeX = R * 0.36;
    const eyeY = -R * 0.02;
    const ew = R * 0.17;
    const look = P.look * ew * 0.45;
    const eye = (side: number) => {
      const mode = P.eyes;
      const cx = side * eyeX;
      const isWink = (mode === "winkL" && side < 0) || (mode === "winkR" && side > 0);
      if (mode === "squint" || isWink) {
        return (
          <g key={side}>
            <path d={`M${cx - ew},${eyeY + ew * 0.3} Q${cx},${eyeY - ew * 1.1} ${cx + ew},${eyeY + ew * 0.3}`} fill="none" stroke={INK} strokeWidth={R * 0.06} strokeLinecap="round" />
            {/* signature crow's feet */}
            <path d={`M${cx + side * ew * 1.25},${eyeY - ew * 0.2} l${side * ew * 0.45},${-ew * 0.25} M${cx + side * ew * 1.3},${eyeY + ew * 0.25} l${side * ew * 0.45},${ew * 0.1}`} stroke={INK} strokeWidth={R * 0.03} strokeLinecap="round" />
          </g>
        );
      }
      if (mode === "closed") {
        return <path key={side} d={`M${cx - ew},${eyeY} Q${cx},${eyeY + ew} ${cx + ew},${eyeY}`} fill="none" stroke={INK} strokeWidth={R * 0.055} strokeLinecap="round" />;
      }
      const big = mode === "wide" ? 1.25 : 1;
      return (
        <g key={side}>
          <ellipse cx={cx} cy={eyeY} rx={ew * big} ry={ew * 1.15 * big} fill="#fff" stroke={INK} strokeWidth={R * 0.035} />
          <circle cx={cx + look} cy={eyeY + ew * 0.15} r={ew * 0.55} fill={INK} />
          <circle cx={cx + look + ew * 0.2} cy={eyeY - ew * 0.12} r={ew * 0.18} fill="#fff" />
        </g>
      );
    };
    const brow = (side: number) => {
      const up = P.eyes === "wide" ? -R * 0.08 : P.shrug * -R * 0.1;
      const cx = side * eyeX;
      const tiltMischief = side < 0 ? -R * 0.04 : R * 0.03;
      return (
        <path
          key={"b" + side}
          d={`M${cx - ew * 1.1},${eyeY - ew * 2 + up + tiltMischief} Q${cx},${eyeY - ew * 2.7 + up} ${cx + ew * 1.1},${eyeY - ew * 2 + up - tiltMischief}`}
          fill="none"
          stroke={col(L.hairStyle === "balding" ? "#6b5b4b" : L.hair)}
          strokeWidth={R * 0.07}
          strokeLinecap="round"
        />
      );
    };
    const my = R * 0.38;
    const mouth = () => {
      const m = P.mouth;
      if (m === "grin" || m === "laugh") {
        const w = m === "laugh" ? R * 0.58 : R * 0.62;
        const d = m === "laugh" ? R * 0.5 : R * 0.36;
        return (
          <g>
            <path d={`M${-w},${my - R * 0.06} Q0,${my + d * 1.5} ${w},${my - R * 0.06} Q0,${my + R * 0.06} ${-w},${my - R * 0.06} Z`} fill="#7f1d1d" stroke={INK} strokeWidth={R * 0.035} strokeLinejoin="round" />
            <path d={`M${-w * 0.8},${my - R * 0.02} Q0,${my + R * 0.1} ${w * 0.8},${my - R * 0.02} L${w * 0.7},${my + R * 0.08} Q0,${my + R * 0.18} ${-w * 0.7},${my + R * 0.08} Z`} fill="#fff" />
            {m === "laugh" && <ellipse cx={0} cy={my + d * 0.85} rx={w * 0.35} ry={d * 0.22} fill="#f87171" />}
          </g>
        );
      }
      if (m === "smile") return <path d={`M${-R * 0.35},${my} Q0,${my + R * 0.28} ${R * 0.35},${my}`} fill="none" stroke={INK} strokeWidth={R * 0.055} strokeLinecap="round" />;
      if (m === "open") return <ellipse cx={0} cy={my + R * 0.06} rx={R * 0.2} ry={R * 0.17} fill="#7f1d1d" stroke={INK} strokeWidth={R * 0.035} />;
      if (m === "o") return <circle cx={0} cy={my + R * 0.05} r={R * 0.09} fill="#7f1d1d" stroke={INK} strokeWidth={R * 0.03} />;
      return <line x1={-R * 0.22} y1={my + R * 0.05} x2={R * 0.22} y2={my + R * 0.05} stroke={INK} strokeWidth={R * 0.05} strokeLinecap="round" />;
    };
    const faceClip = `face${uid}`;
    return (
      <g transform={`translate(0,${hy}) rotate(${P.headTilt}, 0, ${R * 0.8})`}>
        {renderHairBack()}
        {/* ears */}
        {[-1, 1].map((s) => (
          <g key={"e" + s} {...D(1)}>
            <circle cx={s * R * 0.98} cy={R * 0.08} r={L.earR} fill={col(L.skin)} stroke={ink} strokeWidth={sw} {...D(1)} />
            {!sil && <path d={`M${s * R * 0.98},${R * 0.08 - L.earR * 0.45} q${s * L.earR * 0.5},${L.earR * 0.45} 0,${L.earR * 0.9}`} fill="none" stroke={INK} strokeWidth={sw * 0.6} opacity={faceP} />}
          </g>
        ))}
        <defs>
          <clipPath id={faceClip}>
            <circle cx={0} cy={0} r={R} />
          </clipPath>
        </defs>
        <circle cx={0} cy={0} r={R} fill={col(L.skin)} stroke={ink} strokeWidth={sw} {...D(0)} />
        {!sil && L.stubble && (
          <g clipPath={`url(#${faceClip})`} opacity={faceP}>
            <path d={`M${-R},${R * 0.12} Q${-R * 0.55},${R * 0.2} ${-R * 0.42},${R * 0.24} Q0,${R * 0.12} ${R * 0.42},${R * 0.24} Q${R * 0.55},${R * 0.2} ${R},${R * 0.12} L${R},${R} L${-R},${R} Z`} fill="#3f3a40" opacity={0.2} />
          </g>
        )}
        {!sil && L.beard && (
          <path
            d={`M${-R * 0.95},${R * 0.1} Q${-R * 0.9},${R * 1.15} 0,${R * 1.2} Q${R * 0.9},${R * 1.15} ${R * 0.95},${R * 0.1} Q${R * 0.6},${R * 0.75} ${R * 0.3},${R * 0.62} Q0,${R * 0.5} ${-R * 0.3},${R * 0.62} Q${-R * 0.6},${R * 0.75} ${-R * 0.95},${R * 0.1} Z`}
            fill={L.beard}
            stroke={INK}
            strokeWidth={sw * 0.8}
            opacity={faceP}
          />
        )}
        {renderHairFront()}
        {!sil && (
          <g opacity={faceP}>
            {L.freckles &&
              [-1, 1].map((s) =>
                [0, 1, 2, 3].map((k) => <circle key={s + "f" + k} cx={s * (R * 0.42 + (k % 2) * R * 0.12)} cy={R * 0.2 + Math.floor(k / 2) * R * 0.1} r={R * 0.025} fill="#b45309" />),
              )}
            <circle cx={-R * 0.58} cy={R * 0.26} r={R * 0.13} fill="#fb7185" opacity={0.35} />
            <circle cx={R * 0.58} cy={R * 0.26} r={R * 0.13} fill="#fb7185" opacity={0.35} />
            {eye(-1)}
            {eye(1)}
            {brow(-1)}
            {brow(1)}
            <path d={`M${-R * 0.04},${R * 0.1} Q${R * 0.12},${R * 0.2} ${-R * 0.02},${R * 0.26}`} fill="none" stroke={INK} strokeWidth={R * 0.035} strokeLinecap="round" />
            {mouth()}
            {L.glasses && (
              <g fill="none" stroke={INK} strokeWidth={R * 0.05}>
                <circle cx={-eyeX} cy={eyeY} r={ew * 1.8} fill="rgba(255,255,255,0.15)" />
                <circle cx={eyeX} cy={eyeY} r={ew * 1.8} fill="rgba(255,255,255,0.15)" />
                <path d={`M${-eyeX + ew * 1.8},${eyeY} Q0,${eyeY - ew * 0.6} ${eyeX - ew * 1.8},${eyeY}`} />
              </g>
            )}
          </g>
        )}
      </g>
    );
  };

  const hairProps = { fill: col(L.hair), stroke: ink, strokeWidth: sw, strokeLinejoin: "round" as const, ...D(2) };
  const renderHairBack = () => {
    if (L.hairStyle === "pigtails") {
      return (
        <g>
          {[-1, 1].map((s) => (
            <g key={s}>
              <ellipse cx={s * R * 1.12} cy={R * 0.25} rx={R * 0.3} ry={R * 0.42} {...hairProps} />
            </g>
          ))}
        </g>
      );
    }
    if (L.hairStyle === "bun") return <circle cx={0} cy={-R * 1.02} r={R * 0.38} {...hairProps} />;
    if (L.hairStyle === "curly")
      return (
        <g>
          {Array.from({ length: 9 }).map((_, i) => {
            const a = Math.PI * (1 + i / 8);
            return <circle key={i} cx={Math.cos(a) * R * 0.98} cy={Math.sin(a) * R * 0.9 - R * 0.05} r={R * 0.3} {...hairProps} />;
          })}
        </g>
      );
    return null;
  };
  const renderHairFront = () => {
    const s = L.hairStyle;
    if (s === "messy")
      return (
        <path
          {...hairProps}
          d={`M${-R * 0.98},${-R * 0.02} A${R * 1.02},${R * 1.02} 0 0 1 ${R * 0.98},${-R * 0.02}
            L${R * 0.8},${-R * 0.32} L${R * 0.55},${-R * 0.18} L${R * 0.38},${-R * 0.45} L${R * 0.1},${-R * 0.28} L${-R * 0.12},${-R * 0.5}
            L${-R * 0.35},${-R * 0.26} L${-R * 0.58},${-R * 0.46} L${-R * 0.78},${-R * 0.22} Z
            M${-R * 0.45},${-R * 0.85} L${-R * 0.55},${-R * 1.22} L${-R * 0.2},${-R * 0.96} Z
            M${-R * 0.1},${-R * 0.98} L${R * 0.08},${-R * 1.32} L${R * 0.28},${-R * 0.96} Z
            M${R * 0.35},${-R * 0.9} L${R * 0.72},${-R * 1.12} L${R * 0.65},${-R * 0.72} Z`}
        />
      );
    if (s === "short" || s === "teen")
      return (
        <path
          {...hairProps}
          d={`M${-R * 0.97},${-R * 0.05} A${R * 1.03},${R * 1.03} 0 0 1 ${R * 0.97},${-R * 0.05}
            Q${R * 0.92},${-R * 0.28} ${R * 0.55},${-R * 0.34} Q${R * 0.2},${-R * 0.44} ${-R * 0.1},${-R * 0.36}
            Q${-R * 0.25},${-R * 0.5} ${-R * 0.45},${-R * 0.34} Q${-R * 0.88},${-R * 0.3} ${-R * 0.97},${-R * 0.05} Z
            ${s === "teen" ? `M${-R * 0.2},${-R * 0.95} L${-R * 0.05},${-R * 1.22} L${R * 0.15},${-R * 0.95} Z` : `M${R * 0.05},${-R * 0.98} Q${R * 0.3},${-R * 1.18} ${R * 0.45},${-R * 0.92} Z`}`}
        />
      );
    if (s === "bowl")
      return <path {...hairProps} d={`M${-R * 1.04},${R * 0.05} A${R * 1.06},${R * 1.06} 0 0 1 ${R * 1.04},${R * 0.05} L${R * 0.96},${-R * 0.3} Q0,${-R * 0.42} ${-R * 0.96},${-R * 0.3} Z`} />;
    if (s === "pigtails" || s === "bun") {
      const bow = L.bows ?? "#fff";
      return (
        <g>
          <path {...hairProps} d={`M${-R},${R * 0.05} A${R * 1.03},${R * 1.03} 0 0 1 ${R},${R * 0.05} Q${R * 0.8},${-R * 0.45} ${R * 0.1},${-R * 0.55} Q${-R * 0.6},${-R * 0.5} ${-R},${R * 0.05} Z`} />
          {s === "pigtails" &&
            [-1, 1].map((sd) => (
              <g key={sd} transform={`translate(${sd * R * 1.0},${-R * 0.62}) rotate(${sd * 20}) scale(1.45)`} {...D(2)}>
                <path d={`M0,0 C${-R * 0.6},${-R * 0.55} ${-R * 0.75},${R * 0.45} 0,0 Z`} fill={col(bow)} stroke={ink} strokeWidth={sw} />
                <path d={`M0,0 C${R * 0.6},${-R * 0.55} ${R * 0.75},${R * 0.45} 0,0 Z`} fill={col(bow)} stroke={ink} strokeWidth={sw} />
                <circle r={R * 0.1} fill={col(bow)} stroke={ink} strokeWidth={sw} />
              </g>
            ))}
          {s === "bun" && (
            <g transform={`translate(${R * 0.32},${-R * 1.2}) rotate(25) scale(0.55)`}>
              <path d={`M0,0 C${-R * 0.6},${-R * 0.55} ${-R * 0.75},${R * 0.45} 0,0 Z`} fill={col(bow)} stroke={ink} strokeWidth={sw} />
              <path d={`M0,0 C${R * 0.6},${-R * 0.55} ${R * 0.75},${R * 0.45} 0,0 Z`} fill={col(bow)} stroke={ink} strokeWidth={sw} />
            </g>
          )}
        </g>
      );
    }
    if (s === "curly")
      return <path {...hairProps} d={`M${-R * 0.95},${-R * 0.05} A${R},${R} 0 0 1 ${R * 0.95},${-R * 0.05} Q${R * 0.6},${-R * 0.5} 0,${-R * 0.4} Q${-R * 0.6},${-R * 0.5} ${-R * 0.95},${-R * 0.05} Z`} />;
    if (s === "side")
      return (
        <path
          {...hairProps}
          d={`M${-R * 0.98},${R * 0.05} A${R * 1.03},${R * 1.03} 0 0 1 ${R * 0.98},${-R * 0.05} Q${R * 0.7},${-R * 0.55} ${-R * 0.25},${-R * 0.55} Q${-R * 0.7},${-R * 0.45} ${-R * 0.98},${R * 0.05} Z M${-R * 0.35},${-R * 0.95} L${-R * 0.25},${-R * 0.55}`}
        />
      );
    if (s === "balding")
      return (
        <g>
          {[-1, 1].map((sd) => (
            <path key={sd} {...hairProps} d={`M${sd * R * 0.98},${R * 0.25} Q${sd * R * 1.05},${-R * 0.35} ${sd * R * 0.62},${-R * 0.72} Q${sd * R * 0.75},${-R * 0.2} ${sd * R * 0.8},${R * 0.3} Z`} />
          ))}
        </g>
      );
    return null;
  };

  const torsoMid = (shY + hipY) / 2;
  return (
    <g
      transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale}) rotate(${rotate}, 0, ${torsoMid})`}
      opacity={opacity}
      filter={filter ? `url(#${filter})` : undefined}
    >
      {renderLeg(-1, 6)}
      {renderLeg(1, 7)}
      <g transform={`rotate(${P.tilt}, 0, ${hipY})`}>
        {/* neck */}
        <path d={`M0,${shY + 6} L0,${neckTop - 4}`} stroke={ink} strokeWidth={L.limbW * 0.95 + sw * 2} strokeLinecap="round" {...Dl(3)} />
        <path d={`M0,${shY + 6} L0,${neckTop - 4}`} stroke={col(L.skin)} strokeWidth={L.limbW * 0.95} strokeLinecap="round" {...Dl(3)} />
        {renderTorso()}
        {pocketPencil}
        {renderArm(-1, 4)}
        {renderArm(1, 5)}
        {renderHead()}
        {children}
      </g>
    </g>
  );
};

export const Star: React.FC<{ x: number; y: number; r: number; fill: string; rot?: number; stroke?: string; sw?: number }> = ({
  x,
  y,
  r,
  fill,
  rot = 0,
  stroke,
  sw = 0,
}) => {
  const pts = Array.from({ length: 10 })
    .map((_, i) => {
      const a = (Math.PI / 5) * i - Math.PI / 2;
      const rr = i % 2 ? r * 0.45 : r;
      return `${(Math.cos(a) * rr).toFixed(2)},${(Math.sin(a) * rr).toFixed(2)}`;
    })
    .join(" ");
  return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" transform={`translate(${x},${y}) rotate(${rot})`} />;
};

/** The recurring red pencil, as SVG. (x,y) = the end that is held. */
export const RedPencilSvg: React.FC<{ x: number; y: number; len: number; angle?: number; tipUp?: boolean; sil?: string; width?: number }> = ({
  x,
  y,
  len,
  angle = 0,
  tipUp,
  sil,
  width,
}) => {
  const w = width ?? Math.max(8, len * 0.11);
  const c = (v: string) => sil ?? v;
  // pencil drawn pointing down from (0,0); tip at +len
  return (
    <g transform={`translate(${x},${y}) rotate(${angle + (tipUp ? 180 : 0)})`}>
      <rect x={-w / 2} y={-w * 0.6} width={w} height={w * 0.7} rx={w * 0.2} fill={c("#f9a8d4")} stroke={c(INK)} strokeWidth={1.5} />
      <rect x={-w / 2} y={0} width={w} height={w * 0.35} fill={c("#cbd5e1")} stroke={c(INK)} strokeWidth={1.5} />
      <rect x={-w / 2} y={w * 0.35} width={w} height={len * 0.72} fill={c("#DC2626")} stroke={c(INK)} strokeWidth={1.5} />
      <rect x={-w * 0.12} y={w * 0.35} width={w * 0.24} height={len * 0.72} fill={c("#ef4444")} />
      <path d={`M${-w / 2},${w * 0.35 + len * 0.72} L0,${len} L${w / 2},${w * 0.35 + len * 0.72} Z`} fill={c("#f5d0a9")} stroke={c(INK)} strokeWidth={1.5} strokeLinejoin="round" />
      <path d={`M${-w * 0.17},${len - len * 0.09} L0,${len} L${w * 0.17},${len - len * 0.09} Z`} fill={c("#DC2626")} />
    </g>
  );
};

/** tiny kid face used inside the "childhood photo" prop */
const MiniKid: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-25} y={-230} width={50} height={140} rx={18} fill="#e0e7ff" />
    <circle cx={0} cy={-300} r={68} fill="#f2c9a0" stroke={INK} strokeWidth={5} />
    <path d="M-66,-300 A70,70 0 0 1 66,-300 L40,-330 L10,-310 L-20,-335 L-50,-310 Z" fill="#2b2118" />
    <path d="M-40,-280 Q0,-240 40,-280" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />
  </g>
);
