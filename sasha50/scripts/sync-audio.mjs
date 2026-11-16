// Copies assets/song.mp3 into public/ (Remotion serves files from public/)
// and writes src/generated/manifest.json with the list of photos found in
// public/photos, so scenes can use any number of photos per group.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const src = path.join(root, "assets", "song.mp3");
const dst = path.join(root, "public", "song.mp3");

let hasSong = false;
if (fs.existsSync(src)) {
  const need = !fs.existsSync(dst) || fs.statSync(dst).mtimeMs < fs.statSync(src).mtimeMs || fs.statSync(dst).size !== fs.statSync(src).size;
  if (need) fs.copyFileSync(src, dst);
  hasSong = true;
} else if (fs.existsSync(dst)) {
  hasSong = true;
} else {
  console.warn("[sync-audio] assets/song.mp3 not found: rendering without music (210 s fallback).");
}

const groups = ["child", "youth", "travel", "family", "friends"];
const dir = path.join(root, "public", "photos");
const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
const isImg = (f) => /\.(jpe?g|png|webp)$/i.test(f);
const photos = {};
for (const g of groups) {
  photos[g] = files
    .filter((f) => isImg(f) && f.toLowerCase().startsWith(g + "_"))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }))
    .slice(0, 10)
    .map((f) => "photos/" + f);
}
const fg = files.find((f) => /^final_group\.(jpe?g|png|webp)$/i.test(f));
const manifest = { hasSong, photos, finalGroup: fg ? "photos/" + fg : null };
fs.mkdirSync(path.join(root, "src", "generated"), { recursive: true });
fs.writeFileSync(path.join(root, "src", "generated", "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
const counts = groups.map((g) => `${g}:${photos[g].length}`).join(" ");
console.log(`[sync-audio] song: ${hasSong ? "yes" : "NO"} | photos ${counts} | final_group: ${fg ? "yes" : "no"}`);
