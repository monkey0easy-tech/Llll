import React from "react";
import { CalculateMetadataFunction, Composition, staticFile } from "remotion";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { Main } from "./Main";
import { Lab } from "./Lab";
import { SCENES } from "./scenes";
import { S9Outro } from "./scenes/S9Outro";
import { BeatProvider } from "./lib/beat";
import { getSection, resolveTimings, TimingProvider } from "./lib/time";
import { hasSong } from "./lib/photos";
import { ESTIMATED_SONG_LENGTH, FPS, HEIGHT, OUTRO_TAIL, SectionId, WIDTH } from "./timings";
import "./lib/fonts";

type Props = { songDuration: number; hasAudio: boolean };

const detectSong = async (): Promise<Props> => {
  if (!hasSong) return { songDuration: ESTIMATED_SONG_LENGTH, hasAudio: false };
  try {
    const d = await getAudioDurationInSeconds(staticFile("song.mp3"));
    return { songDuration: d, hasAudio: true };
  } catch (e) {
    console.warn("Could not read song.mp3, using the estimated length", e);
    return { songDuration: ESTIMATED_SONG_LENGTH, hasAudio: false };
  }
};

const mainMeta: CalculateMetadataFunction<Props> = async () => {
  const p = await detectSong();
  return { durationInFrames: Math.ceil((p.songDuration + OUTRO_TAIL) * FPS), props: p };
};

const sceneMeta =
  (section: SectionId, last: boolean): CalculateMetadataFunction<Props> =>
  async () => {
    const p = await detectSong();
    const t = resolveTimings(p.songDuration);
    const s = getSection(t, section);
    const end = last ? p.songDuration : s.end;
    return { durationInFrames: Math.max(1, Math.round((end - s.start) * FPS)), props: p };
  };

const withProviders = (C: React.FC<any>, extra: Record<string, unknown> = {}) => {
  const Wrapped: React.FC<Props> = (p) => (
    <TimingProvider songDuration={p.songDuration}>
      <BeatProvider hasAudio={p.hasAudio}>
        <C {...p} {...extra} />
      </BeatProvider>
    </TimingProvider>
  );
  return Wrapped;
};

const MainC = withProviders(Main);
const SCENE_COMPONENTS = SCENES.map((s) => ({ ...s, C: withProviders(s.component, { standalone: true }) }));
const OutroC = withProviders(S9Outro);
const defaults: Props = { songDuration: ESTIMATED_SONG_LENGTH, hasAudio: false };

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Sasha50" component={MainC} durationInFrames={(ESTIMATED_SONG_LENGTH + OUTRO_TAIL) * FPS} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={defaults} calculateMetadata={mainMeta} />
    {SCENE_COMPONENTS.map((s, i) => (
      <Composition
        key={s.id}
        id={s.id}
        component={s.C}
        durationInFrames={300}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={defaults}
        calculateMetadata={sceneMeta(s.section, i === SCENE_COMPONENTS.length - 1)}
      />
    ))}
    <Composition id="S9-Outro" component={OutroC} durationInFrames={OUTRO_TAIL * FPS} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={defaults} />
    <Composition id="Lab-Characters" component={Lab} durationInFrames={30} fps={FPS} width={WIDTH} height={HEIGHT} />
  </>
);
