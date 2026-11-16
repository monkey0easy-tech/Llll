import React from "react";
import { AbsoluteFill } from "remotion";
import { SceneShell } from "./SceneShell";
import { SceneProps } from "./index";
import { useSectionLines } from "../lib/time";
import { useBeat } from "../lib/beat";
import { Figure, mixLook, pose } from "../components/Figure";
import { adultSasha, kidSasha } from "../components/characters";
import { runPose } from "../components/poses";
import { DubaiNight } from "../components/DubaiNight";
import { Fireworks } from "../components/Doodles";
import { Confetti } from "../components/Confetti";
import { ChorusTitle } from "../components/ChorusTitle";
import { Polaroid } from "../components/Polaroid";
import { getPhotos, Photo } from "../lib/photos";
import { RUBIK } from "../lib/fonts";
import { clamp, eio, eo, ip, lerp, rand, sp } from "../lib/anim";

/** Scene 7, final chorus: fireworks, the "ТИПАЖ ГОДА" cover, photo mosaic that becomes a heart. */
export const S7Chorus3: React.FC<SceneProps> = (props) => (
  <SceneShell section="chorus3" {...props}>
    <Chorus3 />
  </SceneShell>
);

const FLOOR = 1000;

const Chorus3: React.FC = () => {
  const T = useSectionLines("chorus3");
  const { frame, total } = T;
  const beat = useBeat();
  const bursts: [number, number, number, number][] = [];
  for (let i = 0; i < Math.floor(total / 9); i++) bursts.push([i * 9 + 4, 150 + rand(i * 5) * 1620, 120 + rand(i * 9) * 420, i]);
  const mosaicAt = T.start(3) - 6;
  return (
    <AbsoluteFill>
      <DubaiNight frame={frame} dim={frame > mosaicAt ? 0.35 : 0} />
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <Fireworks frame={frame} bursts={bursts} />
      </svg>
      {frame < mosaicAt + 10 && (
        <AbsoluteFill style={{ opacity: ip(frame, [mosaicAt, mosaicAt + 10], [1, 0]) }}>
          <Typazh />
        </AbsoluteFill>
      )}
      {frame >= mosaicAt && <Mosaic />}
      <Confetti frame={frame} at={T.start(0) - 6} mode="burst" count={180} seed={9} pulse={beat} y={460} />
      <Confetti frame={frame} at={0} mode="rain" count={90} seed={10} pulse={beat} />
      <ChorusTitle frame={frame} at={T.start(0) - 6} dock={T.start(0) + T.L[0].dur * 0.5} leave={T.start(1) + 4} pulse={beat} />
      <ChorusTitle frame={frame} at={T.start(3) - 4} dock={T.start(3) + T.L[3].dur * 0.6} leave={T.start(6) - 4} pulse={beat} />
    </AbsoluteFill>
  );
};

const Typazh: React.FC = () => {
  const T = useSectionLines("chorus3");
  const { frame } = T;
  const beat = useBeat();
  const a = T.start(1);
  const walk = ip(frame, [a - 6, T.start(2)], [0, 1], eio);
  const morphAt = T.start(2);
  const morph = ip(frame, [morphAt, morphAt + 8], [0, 1]);
  const look = mixLook(kidSasha, adultSasha, morph);
  const cover = ip(frame, [morphAt + 12, morphAt + 26], [0, 1], eo);
  const collar = ip(frame, [morphAt + 10, morphAt + 22], [0, 1]) * ip(frame, [morphAt + 40, morphAt + 50], [1, 0]);
  const scale = lerp(0.6, 1.15, walk);
  const x = 960;
  const y = lerp(950, FLOOR, walk);
  let P = frame < morphAt ? runPose(frame, 0.3, { armL: 18, armR: 18 }) : pose({ eyes: "squint", mouth: "grin" });
  if (frame < a - 6) P = pose({ mouth: "grin", eyes: "open" });
  if (collar > 0) P = pose({ armL: lerp(15, 40, collar), armR: lerp(15, 40, collar), elbowL: lerp(10, 140, collar), elbowR: lerp(10, 140, collar), eyes: "squint", mouth: "smile", headTilt: 6 * collar });
  else if (frame > morphAt + 50) P = pose({ armR: 35, elbowR: 105, holdR: "thumb", eyes: "squint", mouth: "grin", bounce: -beat * 12 });
  const flash = ip(frame, [morphAt - 2, morphAt + 2, morphAt + 10], [0, 1, 0]);
  const showKid = frame >= a - 20;
  return (
    <AbsoluteFill>
      {cover > 0 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              width: 760,
              height: 980,
              marginTop: 30,
              background: "linear-gradient(160deg, #2EC4B6 0%, #1E3A8A 70%)",
              border: "14px solid #fff",
              boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
              transform: `scale(${0.8 + 0.2 * cover}) rotate(${(1 - cover) * -8}deg)`,
              opacity: cover,
              position: "relative",
            }}
          >
            <div style={{ position: "absolute", top: 20, left: 0, right: 0, textAlign: "center", fontFamily: RUBIK, fontWeight: 900, fontSize: 92, whiteSpace: "nowrap", color: "#E8B04B", letterSpacing: 1, textShadow: "0 6px 0 #7c2d12", lineHeight: 1 }}>
              ТИПАЖ ГОДА
            </div>
            <div
              style={{
                position: "absolute",
                right: 30,
                top: 170,
                width: 150,
                height: 150,
                borderRadius: 75,
                background: "#FF6B6B",
                color: "#fff",
                fontFamily: RUBIK,
                fontWeight: 900,
                fontSize: 76,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `rotate(12deg) scale(${1 + beat * 0.08})`,
                boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
              }}
            >
              50
            </div>
          </div>
        </AbsoluteFill>
      )}
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {cover < 1 && (
          <g opacity={1 - cover}>
            <rect x={0} y={900} width={1920} height={180} fill="#1b1f3b" />
            <rect x={0} y={896} width={1920} height={6} fill="#E8B04B" opacity={0.6} />
          </g>
        )}
        {showKid && <Figure look={look} pose={P} x={x} y={y} scale={scale} />}
        {flash > 0 && <circle cx={x} cy={y - 330 * scale} r={420} fill="#FFF7D6" opacity={flash * 0.9} />}
      </svg>
    </AbsoluteFill>
  );
};

/** heart curve point, t in [0, 2pi) */
const heartPt = (t: number) => ({
  x: 16 * Math.pow(Math.sin(t), 3),
  y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)),
});

const Mosaic: React.FC = () => {
  const T = useSectionLines("chorus3");
  const { frame, total } = T;
  const beat = useBeat();
  const all: Photo[] = [...getPhotos("child"), ...getPhotos("youth"), ...getPhotos("travel"), ...getPhotos("family"), ...getPhotos("friends")];
  const N = Math.min(40, Math.max(24, all.length));
  const tiles: Photo[] = Array.from({ length: N }).map((_, i) => (all.length ? all[i % all.length] : { src: null, group: "friends", key: "ph" + i }));
  const cols = N <= 24 ? 6 : 8;
  const rows = Math.ceil(N / cols);
  const tw = 1700 / cols;
  const th = 900 / rows;
  const a = T.start(3) - 6;
  const toHeart = ip(frame, [T.start(6) - 4, T.start(6) + 24], [0, 1], eio);
  // heart: outline points + inner fill points
  const outline = Math.ceil(N * 0.6);
  const heartPos = (i: number) => {
    if (i < outline) {
      const p = heartPt((i / outline) * Math.PI * 2);
      return { x: 960 + p.x * 26, y: 500 + p.y * 26 };
    }
    const k = i - outline;
    const inner = N - outline;
    const p = heartPt((k / inner) * Math.PI * 2);
    const s = 0.5 + (k % 2) * 0.15;
    return { x: 960 + p.x * 26 * s, y: 470 + p.y * 26 * s };
  };
  const step = Math.floor(frame / 5);
  return (
    <AbsoluteFill>
      {tiles.map((ph, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const gx = 110 + tw * (c + 0.5);
        const gy = 100 + th * (r + 0.5);
        const h = heartPos(i);
        const appear = sp(frame, a + (i % 12) * 2, { damping: 14 });
        const x = lerp(gx, h.x, toHeart);
        const y = lerp(gy, h.y, toHeart);
        const w = lerp(tw * 0.86, 120, toHeart);
        const lit = (i * 7 + step) % 5 === 0;
        const flashK = toHeart > 0.5 ? 0.3 + beat * 0.7 : lit ? 0.5 + beat * 0.5 : beat * 0.25;
        return (
          <Polaroid
            key={i}
            src={ph.src}
            x={x}
            y={y}
            width={w}
            seed={i + 200}
            tilt={lerp(rand(i) * 8 - 4, 0, toHeart)}
            sepia={ph.group === "child"}
            frame={frame}
            kb={ip(frame, [a, total], [0, 1])}
            scale={appear * (1 + (lit ? beat * 0.08 : 0))}
            glow={flashK}
            aspect={0.72}
          />
        );
      })}
    </AbsoluteFill>
  );
};
