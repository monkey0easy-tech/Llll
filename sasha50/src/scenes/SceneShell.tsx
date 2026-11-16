import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { BeatOffset } from "../lib/beat";
import { getSection, useTimings } from "../lib/time";
import { FPS, SectionId } from "../timings";
import { KaraokeSubtitles } from "../components/KaraokeSubtitles";

/**
 * Wraps one scene: karaoke for its section, beat offset, and (when previewed
 * on its own) the matching slice of the song.
 */
export const SceneShell: React.FC<{ section: SectionId; standalone?: boolean; hasAudio?: boolean; subtitles?: boolean; children: React.ReactNode }> = ({
  section,
  standalone,
  hasAudio,
  subtitles = true,
  children,
}) => {
  const t = useTimings();
  const s = getSection(t, section);
  const offset = Math.round(s.start * FPS);
  return (
    <BeatOffset offset={offset}>
      <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
        {children}
        {subtitles && <KaraokeSubtitles section={section} />}
        {standalone && hasAudio && <Audio src={staticFile("song.mp3")} startFrom={offset} />}
      </AbsoluteFill>
    </BeatOffset>
  );
};
