import { loadFont as loadRubik } from "@remotion/google-fonts/Rubik";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";

const rubik = loadRubik("normal", { weights: ["500", "700", "800", "900"], subsets: ["cyrillic", "latin"] });
const caveat = loadCaveat("normal", { weights: ["400", "700"], subsets: ["cyrillic", "latin"] });

export const RUBIK = rubik.fontFamily;
export const CAVEAT = caveat.fontFamily;
