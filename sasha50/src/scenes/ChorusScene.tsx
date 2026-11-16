import React from "react";
import { AbsoluteFill } from "remotion";
import { useSectionLines } from "../lib/time";
import { useBeat } from "../lib/beat";
import { Figure, Look, mixPose, pose, Pose } from "../components/Figure";
import { adultFriends, adultSasha, FRIEND_IDS, kidFriends, kidSasha } from "../components/characters";
import { wavePose } from "../components/poses";
import { ChorusTitle } from "../components/ChorusTitle";
import { Confetti } from "../components/Confetti";
import { Heart } from "../components/Doodles";
import { Polaroid } from "../components/Polaroid";
import { getPhotos, Photo } from "../lib/photos";
import { WorldMapShapes, STOPS, ROUTE, arcCtrl } from "../components/WorldMap";
import { CAVEAT, RUBIK } from "../lib/fonts";
import { clamp, eBack, eio, eo, ip, lerp, rand, sp } from "../lib/anim";
import { SectionId } from "../timings";

/**
 * Shared chorus (Scenes 2 and 4). Same structure, different material:
 * "kid" = festive sunburst, kid Sasha, childhood photos;
 * "adult" = map background, adult Sasha, youth + travel photos.
 */
export const ChorusBody: React.FC<{ section: SectionId; variant: "kid" | "adult" }> = ({ section, variant }) => {
  const T = useSectionLines(section);
  const { frame } = T;
  const beat = useBeat();
  const kid = variant === "kid";
  const hero: Look = kid ? kidSasha : adultSasha;
  const S = kid ? 1.15 : 1.05;
  const GROUND = 930;
  const shot = (i: number) => frame >= T.start(i) - 4 && (i + 1 >= T.L.length || frame < T.start(i + 1) - 4);
  const photos: Photo[] = kid ? getPhotos("child", 6) : [...getPhotos("youth", 3), ...getPhotos("travel", 3)];

  // ----- hero pose per line -----
  const f0 = T.start(0);
  const bowAt = f0 + T.L[0].dur * 0.55;
  const bow = ip(frame, [bowAt, bowAt + 10], [0, 1], eio) * ip(frame, [T.start(1) - 8, T.start(1)], [1, 0]);
  let P: Pose = pose({ armL: 25 + beat * 10, armR: 25 + beat * 10, elbowL: 30, elbowR: 30, bounce: -beat * 16, mouth: "grin" });
  if (bow > 0) P = mixPose(P, pose({ tilt: -22, headTilt: -18, armR: 70, elbowR: 70, armL: 120, elbowL: 10, eyes: "closed", mouth: "smile" }), bow);
  if (shot(1)) {
    const p = T.p(1);
    if (kid) {
      const fl = ip(p, [0, 0.15], [0, 1], eio);
      const shake = Math.sin(frame * 1.4) * 4 * fl;
      P = mixPose(P, pose({ armL: 92, armR: 92, elbowL: 95 + shake, elbowR: 95 - shake, mouth: "flat", eyes: "squint", bounce: 0, shrug: 0.3 }), fl);
    } else {
      const pull = ip(p, [0.05, 0.3], [0, 1], eio);
      P = mixPose(P, pose({ armR: lerp(20, 55, pull), elbowR: lerp(40, 75, pull), holdR: pull > 0.4 ? "photo" : "none", mouth: "grin", eyes: "squint", look: 1 }), pull);
    }
  }
  if (shot(2)) P = pose({ armR: 35, elbowR: 105, holdR: "thumb", eyes: "squint", mouth: "grin", armL: 20, bounce: -beat * 10, headTilt: 5 });
  if (shot(3)) {
    const j = Math.abs(Math.sin((frame - T.start(3)) * 0.18));
    P = pose({ armR: 35, elbowR: 105, holdR: "thumb", armL: 150, elbowL: 10, eyes: "squint", mouth: "grin", bounce: -j * 60, legL: 15, legR: 15 });
  }
  const heroX = 960;
  const showHero = !shot(4) && !shot(5);

  // hat flying off during the bow
  const hatT = frame - bowAt;
  const headTop = -(hero.legLen + hero.torsoLen + hero.neckLen + hero.headR * 1.75) * S;
  const hatX = heroX + (hatT > 0 ? hatT * 6 : 0) - (bow > 0 ? 30 : 0);
  const hatY = GROUND + headTop + P.bounce + (hatT > 0 ? -hatT * 22 + hatT * hatT * 0.45 : 0);
  const showHat = frame < T.start(1);

  // ----- background -----
  const bg = kid ? (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 55%, #FFD166 0%, #FF6B6B 55%, #c2185b 100%)" }}>
      <svg viewBox="0 0 1920 1080" style={{ width: "100%", height: "100%" }}>
        <g transform={`translate(960,560) rotate(${frame * 0.4})`}>
          {Array.from({ length: 18 }).map((_, i) => (
            <path key={i} d="M0,0 L-90,-1400 L90,-1400 Z" fill={i % 2 ? "#ffffff" : "#2EC4B6"} opacity={0.14} transform={`rotate(${i * 20})`} />
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  ) : (
    <AbsoluteFill style={{ background: "#1E3A8A" }}>
      <svg viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", opacity: 0.55 }}>
        <WorldMapShapes land="#3B5BBE" ocean="#1E3A8A" />
        {ROUTE.slice(0, -1).map((id, i) => {
          const a = STOPS[id];
          const b = STOPS[ROUTE[i + 1]];
          const c = arcCtrl(a, b);
          return <path key={id} d={`M${a.x},${a.y} Q${c.x},${c.y} ${b.x},${b.y}`} fill="none" stroke="#F97316" strokeWidth={2.5} strokeDasharray="6 6" strokeDashoffset={-frame * 0.6} />;
        })}
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 55%, rgba(46,196,182,0.35), rgba(11,16,38,0.4) 75%)" }} />
    </AbsoluteFill>
  );

  // ----- light-bulb mirror frame (line 2) -----
  const mirror = shot(2) ? ip(frame, [T.start(2) - 4, T.start(2) + 8], [0, 1], eo) : 0;
  const bulbs: React.ReactNode[] = [];
  if (mirror > 0) {
    const x0 = 640, x1 = 1280, y0 = 200, y1 = GROUND + 10;
    const per: [number, number][] = [];
    for (let i = 0; i <= 8; i++) per.push([lerp(x0, x1, i / 8), y0]);
    for (let i = 1; i <= 9; i++) per.push([x1, lerp(y0, y1, i / 9)]);
    for (let i = 1; i <= 9; i++) per.push([x0, lerp(y0, y1, i / 9)]);
    per.forEach(([x, y], i) => {
      const lit = frame - T.start(2) > i * 1.2;
      const tw = 0.7 + 0.3 * Math.sin(frame * 0.5 + i);
      bulbs.push(
        <g key={i}>
          {lit && <circle cx={x} cy={y} r={34} fill="#FFE8A3" opacity={0.35 * tw} />}
          <circle cx={x} cy={y} r={17} fill={lit ? "#FFF4C2" : "#8a7a5a"} stroke="#7c5a12" strokeWidth={3} />
        </g>,
      );
    });
  }

  // ----- heart (line 4) -----
  const heartIn = shot(4) ? sp(frame, T.start(4) - 4, { damping: 9 }) : 0;

  return (
    <AbsoluteFill>
      {bg}
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
        {mirror > 0 && (
          <g opacity={mirror}>
            <rect x={640} y={200} width={640} height={GROUND + 10 - 200} rx={16} fill="rgba(255,255,255,0.18)" stroke="#E8B04B" strokeWidth={14} />
            {bulbs}
          </g>
        )}
        {showHero && <Figure look={hero} pose={P} x={heroX} y={GROUND} scale={S} />}
        {showHero && showHat && (
          <g transform={`translate(${hatX},${hatY}) rotate(${hatT > 0 ? hatT * 14 : 0})`}>
            {kid ? (
              <g>
                <ellipse cx={0} cy={6} rx={78} ry={16} fill="#F8FAFC" stroke="#232333" strokeWidth={4} />
                <path d="M-48,8 Q-46,-46 0,-48 Q46,-46 48,8 Z" fill="#F8FAFC" stroke="#232333" strokeWidth={4} />
                <rect x={-48} y={-6} width={96} height={10} fill="#2563EB" />
              </g>
            ) : (
              <g>
                <ellipse cx={0} cy={6} rx={88} ry={18} fill="#1f2937" stroke="#0b0b12" strokeWidth={4} />
                <path d="M-52,8 Q-50,-60 0,-58 Q50,-60 52,8 Z" fill="#1f2937" stroke="#0b0b12" strokeWidth={4} />
                <rect x={-52} y={-10} width={104} height={12} fill="#E8B04B" />
              </g>
            )}
          </g>
        )}
        {heartIn > 0 && (
          <g>
            {Array.from({ length: 10 }).map((_, i) => {
              const t = frame - T.start(4) - i * 6;
              if (t < 0) return null;
              return <Heart key={i} x={200 + rand(i + 3) * 1520} y={1000 - t * 5} s={50 + rand(i) * 40} fill={i % 2 ? "#FF6B6B" : "#E8B04B"} stroke="none" opacity={clamp(1 - t / 120)} rot={Math.sin(t * 0.1 + i) * 15} />;
            })}
            <Heart x={960} y={560} s={520} fill="#FF6B6B" stroke="#fff" sw={14} scale={heartIn * (1 + beat * 0.12)} />
            <Heart x={960} y={560} s={360} fill="#ff8f8f" stroke="none" scale={heartIn * (1 + beat * 0.2)} opacity={0.6} />
          </g>
        )}
      </svg>

      {/* "пока что" label for the flex gag / childhood photo for the adult */}
      {shot(1) && kid && (
        <div
          style={{
            position: "absolute",
            left: 1130,
            top: 520,
            fontFamily: CAVEAT,
            fontWeight: 700,
            fontSize: 72,
            color: "#1f2a5a",
            background: "#FBF5E6",
            padding: "4px 26px",
            borderRadius: 12,
            transform: `rotate(-6deg) scale(${sp(frame, T.start(1) + T.L[1].dur * 0.35, { damping: 10 })})`,
            boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
          }}
        >
          пока что
          <svg width="120" height="60" style={{ position: "absolute", left: -110, top: 30 }}>
            <path d="M115,10 Q60,0 12,40 M12,40 l22,-2 M12,40 l4,-20" fill="none" stroke="#1f2a5a" strokeWidth={5} strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* line 5: collage + friends waving */}
      {shot(5) && <Collage section={section} photos={photos} kid={kid} />}

      <Confetti frame={frame} at={T.start(0) - 6} mode="burst" count={160} seed={kid ? 1 : 2} pulse={beat} y={500} />
      <Confetti frame={frame} at={0} mode="rain" count={70} seed={kid ? 5 : 6} pulse={beat} />
      <ChorusTitle frame={frame} at={T.start(0) - 6} dock={T.start(0) + T.L[0].dur * 0.5} leave={T.start(3) - 6} pulse={beat} />
      <ChorusTitle frame={frame} at={T.start(3) - 4} dock={T.start(3) + T.L[3].dur * 0.55} leave={T.start(5) - 4} pulse={beat} />
    </AbsoluteFill>
  );
};

const Collage: React.FC<{ section: SectionId; photos: Photo[]; kid: boolean }> = ({ section, photos, kid }) => {
  const T = useSectionLines(section);
  const { frame } = T;
  const a = T.start(5) - 4;
  const n = photos.length;
  const cols = Math.min(4, Math.ceil(n / 2));
  const rows = Math.ceil(n / cols);
  const friends = kid ? kidFriends : adultFriends;
  return (
    <AbsoluteFill>
      {photos.map((ph, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const inRow = Math.min(cols, n - r * cols);
        const x = 960 + (c - (inRow - 1) / 2) * 420;
        const y = 250 + r * 300 - (rows - 1) * 30;
        const s = sp(frame, a + i * 3, { damping: 12 });
        return <Polaroid key={ph.key} src={ph.src} x={x} y={y} width={330} seed={i + (kid ? 21 : 41)} sepia={ph.group === "child"} frame={frame} kb={ip(frame, [a, T.total], [0, 1])} scale={s} />;
      })}
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {[...FRIEND_IDS.slice(0, 2), "hero" as const, ...FRIEND_IDS.slice(2)].map((id, i) => {
          const x = 560 + i * 200;
          const up = ip(frame, [a + 4 + i * 3, a + 16 + i * 3], [300, 0], eBack);
          const look = id === "hero" ? (kid ? kidSasha : adultSasha) : friends[id];
          return <Figure key={id} look={look} pose={wavePose(frame + i * 7, { eyes: id === "hero" ? "squint" : "open" })} x={x} y={1000 + up} scale={kid ? 0.78 : 0.66} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
