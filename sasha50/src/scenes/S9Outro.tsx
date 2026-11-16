import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Polaroid } from "../components/Polaroid";
import { Handwriting } from "../components/Notebook";
import { finalGroupPhoto } from "../lib/photos";
import { ip } from "../lib/anim";
import { FPS, OUTRO_TAIL } from "../timings";

/** Last seconds after the music: final group photo, the red pencil signs the card, fade to black. */
export const S9Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const total = OUTRO_TAIL * FPS;
  const fadeIn = ip(frame, [0, 12], [0, 1]);
  const write = ip(frame, [16, total * 0.62], [0, 1]);
  const black = ip(frame, [total - 24, total - 2], [0, 1]);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #3b2a10, #0B1026 75%)" }}>
      <AbsoluteFill style={{ opacity: fadeIn }}>
        <Polaroid src={finalGroupPhoto()} x={960} y={450} width={1080} aspect={0.56} seed={500} tilt={-1.5} frame={frame} kb={frame / total} glow={0.35} />
        <Handwriting text="С любовью, твои друзья" x={960} y={985} size={96} progress={write} color="#FDE68A" />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#000", opacity: black }} />
    </AbsoluteFill>
  );
};
