import React, { createContext, useContext, useMemo } from "react";
import { useCurrentFrame } from "remotion";
import {
  ESTIMATED_SONG_LENGTH,
  FPS,
  Line,
  lines as rawLines,
  SCALE_TO_SONG,
  Section,
  SectionId,
  sections as rawSections,
} from "../timings";

export type ResolvedLine = Required<Line> & { index: number };
export type Timings = { sections: Section[]; lines: ResolvedLine[]; songDuration: number };

/** Applies SCALE_TO_SONG and fills in missing line ends. */
export const resolveTimings = (songDuration: number): Timings => {
  const k = SCALE_TO_SONG ? songDuration / ESTIMATED_SONG_LENGTH : 1;
  const sections = rawSections.map((s) => ({ ...s, start: s.start * k, end: s.end * k }));
  const lines: ResolvedLine[] = [];
  for (const s of sections) {
    const own = rawLines.filter((l) => l.section === s.id);
    own.forEach((l, i) => {
      const next = own[i + 1];
      const start = l.start * k;
      const end = l.end !== undefined ? l.end * k : next ? next.start * k - 0.1 : s.end - 0.2;
      lines.push({ section: l.section, text: l.text, start, end, index: i });
    });
  }
  return { sections, lines, songDuration };
};

const Ctx = createContext<Timings>(resolveTimings(ESTIMATED_SONG_LENGTH));
export const TimingProvider: React.FC<{ songDuration: number; children: React.ReactNode }> = ({
  songDuration,
  children,
}) => {
  const value = useMemo(() => resolveTimings(songDuration), [songDuration]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
export const useTimings = () => useContext(Ctx);

export const getSection = (t: Timings, id: SectionId) => {
  const s = t.sections.find((x) => x.id === id);
  if (!s) throw new Error("Unknown section " + id);
  return s;
};

export type LocalLine = { from: number; to: number; dur: number; text: string };

/**
 * Lines of a section in frames relative to the section start, plus helpers.
 * `since(i)` frames since line i started, `p(i)` 0..1 progress through line i,
 * `between(a, b)` frames [start of a, end of b].
 */
export const useSectionLines = (id: SectionId) => {
  const t = useTimings();
  const s = getSection(t, id);
  const frame = useCurrentFrame();
  const L: LocalLine[] = t.lines
    .filter((l) => l.section === id)
    .map((l) => {
      const from = Math.round((l.start - s.start) * FPS);
      const to = Math.round((l.end - s.start) * FPS);
      return { from, to, dur: Math.max(1, to - from), text: l.text };
    });
  const total = Math.round((s.end - s.start) * FPS);
  const at = (i: number) => L[Math.min(i, L.length - 1)];
  return {
    L,
    total,
    frame,
    /** frames since start of line i (negative before) */
    since: (i: number) => frame - at(i).from,
    /** 0..1 progress through line i */
    p: (i: number) => Math.min(1, Math.max(0, (frame - at(i).from) / at(i).dur)),
    /** frame where line i starts (local) */
    start: (i: number) => at(i).from,
    end: (i: number) => (i >= L.length ? total : at(i).to),
    /** start of the next line, or section end */
    next: (i: number) => (i + 1 < L.length ? L[i + 1].from : total),
  };
};
