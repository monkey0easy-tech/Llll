import React, { createContext, useContext } from "react";
import { staticFile, useCurrentFrame } from "remotion";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { FALLBACK_BPM, FPS } from "../timings";

type BeatFn = (globalFrame: number) => number;
const BeatCtx = createContext<BeatFn>(() => 0);
const OffsetCtx = createContext(0);

const AudioBeat: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioData = useAudioData(staticFile("song.mp3"));
  const fn: BeatFn = (frame) => {
    if (!audioData) return 0;
    let acc = 0;
    // a short look-back makes the pulse decay smoothly instead of flickering
    for (let k = 0; k < 3; k++) {
      const f = Math.max(0, frame - k);
      const v = visualizeAudio({ fps: FPS, frame: f, audioData, numberOfSamples: 32, optimizeFor: "speed" });
      const bass = (v[0] + v[1] + v[2]) / 3;
      acc = Math.max(acc, bass * (1 - k * 0.25));
    }
    return Math.min(1, acc * 2.2);
  };
  return <BeatCtx.Provider value={fn}>{children}</BeatCtx.Provider>;
};

const FakeBeat: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const period = (60 / FALLBACK_BPM) * FPS;
  const fn: BeatFn = (frame) => {
    const ph = (frame % period) / period;
    return Math.exp(-ph * 6);
  };
  return <BeatCtx.Provider value={fn}>{children}</BeatCtx.Provider>;
};

export const BeatProvider: React.FC<{ hasAudio: boolean; children: React.ReactNode }> = ({ hasAudio, children }) =>
  hasAudio ? <AudioBeat>{children}</AudioBeat> : <FakeBeat>{children}</FakeBeat>;

/** Sets the global frame offset of a scene so that useBeat() reads the right part of the song. */
export const BeatOffset: React.FC<{ offset: number; children: React.ReactNode }> = ({ offset, children }) => (
  <OffsetCtx.Provider value={offset}>{children}</OffsetCtx.Provider>
);

/** 0..1 bass amplitude at the current frame */
export const useBeat = () => {
  const fn = useContext(BeatCtx);
  const off = useContext(OffsetCtx);
  const frame = useCurrentFrame();
  return fn(frame + off);
};
