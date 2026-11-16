import manifest from "../generated/manifest.json";
import { staticFile } from "remotion";

export type PhotoGroup = "child" | "youth" | "travel" | "family" | "friends";
export type Photo = { src: string | null; group: PhotoGroup; key: string };

type Manifest = { hasSong: boolean; photos: Record<PhotoGroup, string[]>; finalGroup: string | null };
const m = manifest as Manifest;

export const hasSong = m.hasSong;

/**
 * Photos of a group. If there are fewer than `min`, the list is padded with
 * placeholders (src = null), so every scene has something to show.
 */
export const getPhotos = (group: PhotoGroup, min = 0, max = 10): Photo[] => {
  const list: Photo[] = (m.photos[group] ?? []).slice(0, max).map((p, i) => ({
    src: staticFile(p),
    group,
    key: `${group}-${i}`,
  }));
  for (let i = list.length; i < min; i++) list.push({ src: null, group, key: `${group}-ph-${i}` });
  return list;
};

export const finalGroupPhoto = (): string | null => (m.finalGroup ? staticFile(m.finalGroup) : null);
