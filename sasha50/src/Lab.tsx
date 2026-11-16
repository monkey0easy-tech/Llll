import React from "react";
import { AbsoluteFill } from "remotion";
import { Figure, pose } from "./components/Figure";
import { adultFriends, adultSasha, kidFriends, kidSasha, kidSashaUniform, FRIEND_IDS } from "./components/characters";

/** Character sheet, handy for checking the cast in Studio */
export const Lab: React.FC = () => (
  <AbsoluteFill style={{ background: "#f5efe0" }}>
    <svg viewBox="0 0 1920 1080" width="100%" height="100%">
      <Figure look={kidSasha} x={150} y={500} pose={pose({ holdR: "thumb", armR: 40, elbowR: 100, eyes: "squint" })} />
      <Figure look={kidSashaUniform} x={350} y={500} pose={pose({ holdL: "pencil", armL: 30, elbowL: 60, eyes: "winkL" })} />
      {FRIEND_IDS.map((id, i) => (
        <Figure key={id} look={kidFriends[id]} x={560 + i * 190} y={500} pose={pose({ mouth: "laugh" })} />
      ))}
      <Figure look={kidSasha} x={1450} y={500} draw={0.55} />
      <Figure look={adultSasha} x={180} y={1050} pose={pose({ holdR: "thumb", armR: 40, elbowR: 100, eyes: "squint", holdL: "suitcase" })} />
      <Figure look={adultSasha} x={450} y={1050} pose={pose({ holdR: "phone", armR: 30, elbowR: 120 })} />
      {FRIEND_IDS.map((id, i) => (
        <Figure key={id} look={adultFriends[id]} x={720 + i * 230} y={1050} pose={pose({ holdR: "wave", armR: 150, elbowR: 10 })} />
      ))}
      <Figure look={kidSasha} x={1750} y={1050} silhouette="#111" pose={pose({ armL: 160, armR: 160, legL: 30, legR: 30 })} />
    </svg>
  </AbsoluteFill>
);
