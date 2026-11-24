/*
 * Converts every PNG/JPEG under public/images to WebP, in place.
 *
 *   npm run images
 *
 * Astro serves public/ as is, so whatever is committed here is what the
 * browser downloads.
 *
 * 1. A 1600px width cap. Polaroids render at most about 800px wide, so this
 *    stays sharp on a 2x screen. Smaller images keep their own size.
 *
 * 2. Whichever WebP encode comes out smaller, lossless or quality 82. Flat UI
 *    screenshots compress better lossless and keep text crisp; photos and
 *    gradients come out far smaller lossy.
 *
 * The source file is removed once its .webp is written, so re-running this is
 * a no-op. Update the references in src/data to match when you add images.
 *
 * KEEP lists files that must stay in their original format: about.jpg is the
 * og:image for link previews, where WebP support is patchy.
 */
import { readdir, stat, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const imagesDir = path.join(root, "public", "images");

const MAX_WIDTH = 1600;
const QUALITY = 82;
const KEEP = new Set(["about.jpg"]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(full) : [full];
    }),
  );
  return files.flat();
}

async function convert(file) {
  const before = (await stat(file)).size;
  const source = sharp(file).resize({
    width: MAX_WIDTH,
    withoutEnlargement: true,
  });

  const [lossy, lossless] = await Promise.all([
    source.clone().webp({ quality: QUALITY, effort: 6 }).toBuffer(),
    source.clone().webp({ lossless: true, effort: 6 }).toBuffer(),
  ]);
  const winner = lossless.length < lossy.length ? lossless : lossy;
  const mode = winner === lossless ? "lossless" : `q${QUALITY}`;

  const out = file.replace(/\.(png|jpe?g)$/i, ".webp");
  await sharp(winner).toFile(out);
  await unlink(file);

  return { file, before, after: winner.length, mode };
}

const sources = (await walk(imagesDir)).filter(
  (file) =>
    /\.(png|jpe?g)$/i.test(file) && !KEEP.has(path.basename(file)),
);

if (sources.length === 0) {
  console.log("Nothing to convert. Every image under public/images is WebP.");
  process.exit(0);
}

const kb = (bytes) => `${Math.round(bytes / 1024)}KB`;
let before = 0;
let after = 0;

for (const source of sources) {
  const result = await convert(source);
  before += result.before;
  after += result.after;
  const saved = Math.round((1 - result.after / result.before) * 100);
  console.log(
    `${path.relative(root, result.file).replace(/\\/g, "/")}  ` +
      `${kb(result.before)} → ${kb(result.after)} (${saved}% off, ${result.mode})`,
  );
}

console.log(
  `\n${sources.length} images: ${kb(before)} → ${kb(after)}, ` +
    `${Math.round((1 - after / before) * 100)}% smaller.`,
);
