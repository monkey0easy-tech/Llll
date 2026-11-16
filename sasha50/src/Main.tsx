import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { SCENES } from "./scenes";
import { S9Outro } from "./scenes/S9Outro";
import { getSection, useTimings } from "./lib/time";
import { FPS, TRANSITION } from "./timings";
import { TransitionOverlay } from "./components/Transition";

/** The whole video: all scenes back to back, transitions on the cuts, the song on top. */
export const Main: React.FC<{ hasAudio: boolean }> = ({ hasAudio }) => {
  const t = useTimings();
  const frame = useCurrentFrame();
  const songEnd = Math.round(t.songDuration * FPS);
  const tr = Math.round(TRANSITION * FPS);
  const cuts: { at: number; kind: (typeof SCENES)[number]["into"] }[] = [];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SCENES.map((sc, i) => {
        const s = getSection(t, sc.section);
        const from = Math.round(s.start * FPS);
        const to = i === SCENES.length - 1 ? songEnd : Math.round(getSection(t, SCENES[i + 1].section).start * FPS);
        if (i > 0) cuts.push({ at: from, kind: sc.into });
        const C = sc.component;
        return (
          <Sequence key={sc.id} from={from} durationInFrames={Math.max(1, to - from)} name={sc.id}>
            <C />
          </Sequence>
        );
      })}
      <Sequence from={songEnd} name="S9-Outro">
        <S9Outro />
      </Sequence>
      {[...cuts, { at: songEnd, kind: "flash" as const }].map((c, i) => (
        <TransitionOverlay key={i} kind={c.kind} p={(frame - (c.at - tr / 2)) / tr} />
      ))}
      {hasAudio && <Audio src={staticFile("song.mp3")} />}
    </AbsoluteFill>
  );
};
