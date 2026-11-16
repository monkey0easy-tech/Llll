import React from "react";
import { SceneShell } from "./SceneShell";
import { SceneProps } from "./index";
import { ChorusBody } from "./ChorusScene";

/** Chorus (kid version). Structure lives in ChorusScene.tsx. */
export const S2Chorus1: React.FC<SceneProps> = (props) => (
  <SceneShell section="chorus1" {...props}>
    <ChorusBody section="chorus1" variant="kid" />
  </SceneShell>
);
