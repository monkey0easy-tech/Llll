import React from "react";
import { SceneShell } from "./SceneShell";
import { SceneProps } from "./index";
import { ChorusBody } from "./ChorusScene";

/** Chorus (adult version). Structure lives in ChorusScene.tsx. */
export const S4Chorus2: React.FC<SceneProps> = (props) => (
  <SceneShell section="chorus2" {...props}>
    <ChorusBody section="chorus2" variant="adult" />
  </SceneShell>
);
