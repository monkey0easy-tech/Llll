import React from "react";
import { SectionId } from "../timings";
import { S0Intro } from "./S0Intro";
import { S1Verse1 } from "./S1Verse1";
import { S2Chorus1 } from "./S2Chorus1";
import { S3Verse2 } from "./S3Verse2";
import { S4Chorus2 } from "./S4Chorus2";
import { S5Verse3 } from "./S5Verse3";
import { S6Verse4 } from "./S6Verse4";
import { S7Chorus3 } from "./S7Chorus3";
import { S8Finale } from "./S8Finale";
import { TransitionKind } from "../components/Transition";

export type SceneProps = { standalone?: boolean; hasAudio?: boolean };

export const SCENES: { id: string; section: SectionId; component: React.FC<SceneProps>; into: TransitionKind }[] = [
  { id: "S0-Intro", section: "intro", component: S0Intro, into: "flip" },
  { id: "S1-Verse1", section: "verse1", component: S1Verse1, into: "flip" },
  { id: "S2-Chorus1", section: "chorus1", component: S2Chorus1, into: "flip" },
  { id: "S3-Verse2", section: "verse2", component: S3Verse2, into: "flip" },
  { id: "S4-Chorus2", section: "chorus2", component: S4Chorus2, into: "map" },
  { id: "S5-Verse3", section: "verse3", component: S5Verse3, into: "map" },
  { id: "S6-Verse4", section: "verse4", component: S6Verse4, into: "flash" },
  { id: "S7-Chorus3", section: "chorus3", component: S7Chorus3, into: "flash" },
  { id: "S8-Finale", section: "finale", component: S8Finale, into: "flash" },
];
