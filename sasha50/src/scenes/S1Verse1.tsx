import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { SceneShell } from "./SceneShell";
import { SceneProps } from "./index";
import { useSectionLines } from "../lib/time";
import { NotebookPage, SketchFilter } from "../components/Notebook";
import { Figure, mixPose, pose, RedPencilSvg } from "../components/Figure";
import { FRIEND_IDS, kidFriends, kidSasha } from "../components/characters";
import { hugPose, runPose, starPose, talk } from "../components/poses";
import { PopDoodles, SparkTrail } from "../components/Doodles";
import { Courtyard } from "../components/Courtyard";
import { Polaroid } from "../components/Polaroid";
import { getPhotos } from "../lib/photos";
import { clamp, eBack, eio, eo, fadeWin, ip, lerp, sp } from "../lib/anim";

/** Scene 1, verse 1: the boy is drawn, measured against a pencil, cartwheels, the courtyard, the hug. */
export const S1Verse1: React.FC<SceneProps> = (props) => (
  <SceneShell section="verse1" {...props}>
    <Verse1 />
  </SceneShell>
);

const GROUND = 900;
const SVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
    {children}
  </svg>
);

const Verse1: React.FC = () => {
  const T = useSectionLines("verse1");
  const { frame } = T;
  const shotB = T.start(4) - 6;
  const shotC = T.start(6) - 6;
  return (
    <NotebookPage>
      {frame < shotB + 8 && (
        <AbsoluteFill style={{ opacity: ip(frame, [shotB - 2, shotB + 8], [1, 0]) }}>
          <ShotDraw />
        </AbsoluteFill>
      )}
      {frame >= shotB - 2 && frame < shotC + 8 && (
        <AbsoluteFill style={{ opacity: Math.min(ip(frame, [shotB - 2, shotB + 8], [0, 1]), ip(frame, [shotC - 2, shotC + 8], [1, 0])) }}>
          <ShotCourtyard />
        </AbsoluteFill>
      )}
      {frame >= shotC - 2 && (
        <AbsoluteFill style={{ opacity: ip(frame, [shotC - 2, shotC + 8], [0, 1]) }}>
          <ShotHug />
        </AbsoluteFill>
      )}
    </NotebookPage>
  );
};

// ---------- lines 0-3: drawing, pencil, wink, cartwheel ----------
const ShotDraw: React.FC = () => {
  const T = useSectionLines("verse1");
  const { frame } = T;
  const S = 1.25;
  const L = kidSasha;
  // line 0: pencil draws the boy
  const draw = ip(frame, [T.start(0) - 10, T.start(0) + T.L[0].dur * 0.9], [0, 1]);
  const k = (draw * 9) / 0.85;
  const part = Math.min(8, Math.floor(k));
  const fr = clamp(k - part);
  const cx = 960;
  const hy = -(L.legLen + L.torsoLen + L.neckLen + L.headR * 0.82);
  const tipLocal = (() => {
    const a = fr * Math.PI * 2;
    switch (part) {
      case 0:
        return { x: Math.sin(a) * L.headR, y: hy - Math.cos(a) * L.headR };
      case 1:
        return { x: (fr < 0.5 ? -1 : 1) * L.headR, y: hy + 6 };
      case 2:
        return { x: lerp(-L.headR, L.headR, fr), y: hy - L.headR * (0.6 + Math.sin(fr * 20) * 0.3) };
      case 3:
        return { x: Math.sin(a) * 22, y: lerp(-278, -160, fr) };
      case 4:
        return { x: lerp(-20, -50, fr), y: lerp(-270, -130, fr) };
      case 5:
        return { x: lerp(20, 50, fr), y: lerp(-270, -130, fr) };
      case 6:
        return { x: lerp(-10, -25, fr), y: lerp(-160, 0, fr) };
      case 7:
        return { x: lerp(10, 25, fr), y: lerp(-160, 0, fr) };
      default:
        return { x: Math.sin(a) * 20, y: hy + Math.cos(a) * 15 };
    }
  })();
  const tip = { x: cx + tipLocal.x * S, y: GROUND + tipLocal.y * S };
  const drawing = draw > 0 && draw < 1;
  const pencilAway = ip(frame, [T.start(0) + T.L[0].dur * 0.9, T.start(1)], [0, 1], eio);

  // line 1: giant pencil to measure
  const p1 = T.p(1);
  const gpIn = sp(frame, T.start(1), { damping: 14 });
  const gpOut = ip(frame, [T.start(2), T.start(2) + 14], [0, 1], eio);
  const gpX = lerp(2100, 1180, gpIn) + gpOut * 900;
  const figH = (L.legLen + L.torsoLen + L.neckLen + L.headR * 1.9) * S;
  const compare = ip(p1, [0.35, 0.55], [0, 1]);
  const shrug = ip(p1, [0.7, 0.8], [0, 1]) * ip(frame, [T.start(2) - 4, T.start(2) + 6], [1, 0]);

  // line 2: wink
  const wink = frame >= T.start(2) && frame < T.start(3);
  // line 3: cartwheel across the page
  const c0 = T.start(3);
  const cDur = T.L[3].dur;
  const hop = ip(frame, [c0, c0 + cDur * 0.15], [0, 1], eio);
  const cw = ip(frame, [c0 + cDur * 0.15, c0 + cDur], [0, 1], (x) => x);
  const cartX = (f: number) => {
    const h = ip(f, [c0, c0 + cDur * 0.15], [0, 1], eio);
    const w = ip(f, [c0 + cDur * 0.15, c0 + cDur], [0, 1]);
    return lerp(lerp(960, 380, h), 1700, w);
  };
  const inCart = frame >= c0;
  const x = inCart ? cartX(frame) : 960;
  const rot = inCart ? cw * 720 : 0;
  let P = pose({ eyes: "open", mouth: "grin", look: 0 });
  if (frame >= T.start(1)) P = pose({ look: ip(p1, [0.1, 0.25], [0, 1]), eyes: compare > 0.5 ? "wide" : "open", mouth: shrug > 0.3 ? "smile" : "o" });
  if (shrug > 0) P = mixPose(P, pose({ armL: 35, armR: 35, elbowL: -70, elbowR: -70, shrug: 1, mouth: "smile", headTilt: -8, look: 0 }), shrug);
  if (wink) {
    const wf = frame - T.start(2);
    P = pose({ eyes: wf > 6 && wf < 40 ? "winkL" : "open", armR: 35, elbowR: 105, holdR: "thumb", mouth: "grin", headTilt: 6 });
  }
  if (inCart) P = mixPose(pose({ armL: 100, armR: 100 }), starPose, hop);

  return (
    <SVG>
      <SketchFilter frame={frame} />
      {/* measuring pencil */}
      {frame >= T.start(1) - 2 && gpOut < 1 && (
        <g>
          <RedPencilSvg x={gpX} y={GROUND - figH} len={figH} angle={0} width={84} />
          {compare > 0 && (
            <g opacity={compare} stroke="#1f2a5a" strokeWidth={4} fill="none" strokeLinecap="round">
              <line x1={cx + 70} y1={GROUND - figH + 20} x2={gpX - 50} y2={GROUND - figH + 20} strokeDasharray="12 10" />
              {/* width arrows: boy vs pencil */}
              <path d={`M${cx - 28},${GROUND - 260} L${cx + 28},${GROUND - 260} M${cx - 28},${GROUND - 270} L${cx - 28},${GROUND - 250} M${cx + 28},${GROUND - 270} L${cx + 28},${GROUND - 250}`} stroke="#DC2626" />
              <path d={`M${gpX - 50},${GROUND - 260} L${gpX + 50},${GROUND - 260} M${gpX - 50},${GROUND - 270} L${gpX - 50},${GROUND - 250} M${gpX + 50},${GROUND - 270} L${gpX + 50},${GROUND - 250}`} stroke="#DC2626" />
            </g>
          )}
        </g>
      )}
      {inCart && <SparkTrail frame={frame} from={c0 + cDur * 0.15} to={c0 + cDur + 30} pos={(f) => ({ x: cartX(f), y: GROUND - 230 * S })} />}
      <Figure look={L} pose={P} x={x} y={GROUND - (inCart ? Math.sin(hop * Math.PI) * 60 : 0)} scale={S} draw={draw < 1 ? draw : undefined} rotate={rot} filter="sketch" />
      {wink && <PopDoodles frame={frame} at={T.start(2) + 6} cx={960} cy={GROUND - 420} r={250} count={10} />}
      {/* drawing pencil */}
      {(drawing || (pencilAway > 0 && pencilAway < 1)) && (
        <RedPencilSvg x={tip.x - 85 + pencilAway * 900} y={tip.y - 147 - pencilAway * 400} len={170} angle={-30} />
      )}
    </SVG>
  );
};

// ---------- lines 4-5: courtyard, story, friends fall laughing ----------
const ShotCourtyard: React.FC = () => {
  const T = useSectionLines("verse1");
  const { frame } = T;
  const a = T.start(4);
  const b = T.start(5);
  const fall = (i: number) => sp(frame, b + 8 + i * 5, { damping: 9, stiffness: 90 });
  const spots = [560, 760, 1160, 1360];
  const starts = [-300, -200, 2120, 2220];
  const S = 1.0;
  return (
    <SVG>
      <SketchFilter frame={frame} />
      <g filter="url(#sketch)">
        <Courtyard frame={frame} ground={GROUND} />
      </g>
      {FRIEND_IDS.map((id, i) => {
        const arrive = ip(frame, [a - 6 + i * 4, a + 30 + i * 4], [0, 1], eo);
        const x = lerp(starts[i], spots[i], arrive);
        const running = arrive < 1;
        const side = i < 2 ? -1 : 1;
        const fl = fall(i);
        const laughing = frame > b;
        let P = running ? runPose(frame + i * 5) : pose({ mouth: laughing ? "laugh" : "grin", eyes: laughing ? "closed" : "open", look: i < 2 ? 1 : -1 });
        if (laughing) P = mixPose(P, pose({ mouth: "laugh", eyes: "closed", armL: 50, armR: 50, elbowL: 120, elbowR: 120, legL: 40 + Math.sin(frame * 0.6 + i) * 20, legR: 60 - Math.sin(frame * 0.6 + i) * 20, kneeL: 30, kneeR: 40 }), fl);
        const look = kidFriends[id];
        return (
          <Figure
            key={id}
            look={look}
            pose={P}
            x={x - side * fl * 40}
            y={GROUND + 5 - fl * 40}
            scale={S}
            flip={i >= 2}
            rotate={side * fl * 82}
            filter="sketch"
          />
        );
      })}
      <Figure
        look={kidSasha}
        x={960}
        y={GROUND + 5}
        scale={1.05}
        filter="sketch"
        pose={
          frame < b + 6
            ? pose({ mouth: talk(frame), armL: 60 + Math.sin(frame * 0.3) * 30, elbowL: 60, armR: 90 + Math.cos(frame * 0.25) * 35, elbowR: 40, bounce: -Math.abs(Math.sin(frame * 0.2)) * 8, headTilt: Math.sin(frame * 0.1) * 6 })
            : pose({ mouth: "grin", eyes: "squint", armR: 35, elbowR: 105, holdR: "thumb", armL: 20, holdL: "pencil", elbowL: 30 })
        }
      />
    </SVG>
  );
};

// ---------- lines 6-7: hug, frame becomes a polaroid, photos fly in ----------
const ShotHug: React.FC = () => {
  const T = useSectionLines("verse1");
  const { frame } = T;
  const c = T.start(7);
  const d = T.L[7].dur;
  const shrink = ip(frame, [c, c + d * 0.3], [0, 1], eio);
  const toPhoto = ip(frame, [c + d * 0.3, c + d * 0.45], [0, 1]);
  const photos = getPhotos("child", 4);
  const order = ["chubby", "bows", "kid", "redhead", "glasses"] as const;
  const xs = [620, 800, 960, 1120, 1300];
  const scale = lerp(1, 0.46, shrink);
  const rot = lerp(0, -3, shrink);
  const group = (
    <SVG>
      <SketchFilter frame={frame} />
      <g filter="url(#sketch)">
        <Courtyard frame={frame} ground={GROUND} />
      </g>
      {order.map((id, i) => {
        const P = hugPose(frame, i * 0.4);
        return id === "kid" ? (
          <Figure key={id} look={kidSasha} pose={{ ...P, eyes: "squint" }} x={xs[i]} y={GROUND + 5} scale={1.05} filter="sketch" />
        ) : (
          <Figure key={id} look={kidFriends[id]} pose={P} x={xs[i]} y={GROUND + 5} scale={1.05} filter="sketch" flip={i > 2} />
        );
      })}
    </SVG>
  );
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) rotate(${rot}deg)`,
          boxShadow: shrink > 0 ? `0 0 0 ${shrink * 60}px #fdfdf8, 0 ${shrink * 70}px ${shrink * 120}px ${shrink * 70}px rgba(0,0,0,0.35)` : undefined,
          overflow: "hidden",
          opacity: 1 - toPhoto,
        }}
      >
        <NotebookPage>{group}</NotebookPage>
      </AbsoluteFill>
      {toPhoto > 0 && (
        <Polaroid src={photos[0].src} x={960} y={560} width={1920 * 0.46 + 120 - 0} aspect={0.5625} seed={1} tilt={-3} sepia frame={frame} kb={ip(frame, [c, T.total], [0, 1])} opacity={toPhoto} />
      )}
      {photos.slice(1).map((ph, i) => {
        const at = c + d * 0.5 + i * 7;
        if (frame < at) return null;
        const n = photos.length - 1;
        const s = sp(frame, at, { damping: 13 });
        const ang = (i / Math.max(1, n)) * Math.PI * 2 - Math.PI / 2;
        const tx = 960 + Math.cos(ang) * 700;
        const ty = 540 + Math.sin(ang) * 380;
        const fromX = tx + Math.cos(ang) * 900;
        const fromY = ty + Math.sin(ang) * 700;
        return <Polaroid key={ph.key} src={ph.src} x={lerp(fromX, tx, s)} y={lerp(fromY, ty, s)} width={330} seed={i + 11} sepia frame={frame} kb={ip(frame, [at, T.total], [0, 1])} scale={0.6 + 0.4 * s} />;
      })}
    </AbsoluteFill>
  );
};
