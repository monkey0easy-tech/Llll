import { Mouth, pose, Pose } from "./Figure";

/** running cycle */
export const runPose = (f: number, speed = 0.45, extra: Partial<Pose> = {}): Pose => {
  const s = Math.sin(f * speed);
  return pose({
    legL: 8 + s * 32,
    legR: 8 - s * 32,
    kneeL: Math.max(0, -s) * 50,
    kneeR: Math.max(0, s) * 50,
    armL: 20 - s * 35,
    armR: 20 + s * 35,
    elbowL: 50,
    elbowR: 50,
    bounce: -Math.abs(Math.cos(f * speed)) * 14,
    mouth: "grin",
    ...extra,
  });
};

/** talking mouth */
export const talk = (f: number, rate = 4): Mouth => (Math.floor(f / rate) % 3 === 0 ? "grin" : Math.floor(f / rate) % 3 === 1 ? "open" : "smile");

/** star shape for cartwheels */
export const starPose = pose({ armL: 150, armR: 150, elbowL: 0, elbowR: 0, legL: 32, legR: 32, eyes: "squint", mouth: "grin" });

/** signature thumbs-up with the signature squint */
export const thumbsPose = (extra: Partial<Pose> = {}) =>
  pose({ armR: 35, elbowR: 105, holdR: "thumb", eyes: "squint", mouth: "grin", ...extra });

export const wavePose = (f: number, extra: Partial<Pose> = {}) =>
  pose({ armR: 150 + Math.sin(f * 0.35) * 18, elbowR: 15, holdR: "wave", mouth: "grin", ...extra });

/** arms round the neighbours' shoulders */
export const hugPose = (f: number, phase = 0) =>
  pose({ armL: 100, armR: 100, elbowL: 25, elbowR: 25, headTilt: Math.sin(f * 0.12 + phase) * 6, tilt: Math.sin(f * 0.12 + phase) * 3, mouth: "grin", eyes: "squint" });
