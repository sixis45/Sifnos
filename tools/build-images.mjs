// Builds the responsive images used by the site from the files in images/originals.
//
//   npm run images
//
// To use real photos, drop e.g. `hero.jpg` or `bedroom.jpg` into images/originals
// (delete the matching placeholder .svg) and run the command again. Every image is
// cropped to a fixed aspect ratio so the width/height attributes in the HTML stay valid.

import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'images/originals';
const OUT = 'assets/img';

// name -> output widths and aspect ratio (must match the <img> width/height in the HTML)
const IMAGES = {
  hero:    { widths: [960, 1600, 2400], ratio: [16, 10] },
  veranda: { widths: [640, 1280], ratio: [4, 3] },
  bedroom: { widths: [640, 1280], ratio: [4, 3] },
  living:  { widths: [640, 1280], ratio: [4, 3] },
  olives:  { widths: [640, 1280], ratio: [4, 3] },
  kastro:  { widths: [640, 1280], ratio: [4, 3] },
};

const EXT = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tif', '.tiff', '.svg'];

async function findSource(files, name) {
  // Prefer a real photo over the SVG placeholder when both exist.
  const matches = files.filter((f) => path.parse(f).name === name && EXT.includes(path.extname(f).toLowerCase()));
  matches.sort((a, b) => (a.endsWith('.svg') ? 1 : 0) - (b.endsWith('.svg') ? 1 : 0));
  return matches[0] && path.join(SRC, matches[0]);
}

function load(file) {
  return sharp(file, { density: file.endsWith('.svg') ? 144 : undefined }).rotate();
}

await mkdir(OUT, { recursive: true });
const files = await readdir(SRC);

for (const [name, { widths, ratio }] of Object.entries(IMAGES)) {
  const src = await findSource(files, name);
  if (!src) {
    console.warn(`! missing source for "${name}" in ${SRC}`);
    continue;
  }
  for (const width of widths) {
    const height = Math.round((width * ratio[1]) / ratio[0]);
    const out = path.join(OUT, `${name}-${width}.webp`);
    await load(src)
      .resize(width, height, { fit: 'cover', position: sharp.strategy.attention })
      .webp({ quality: 78, effort: 6 })
      .toFile(out);
    console.log(`  ${out}`);
  }
  if (name === 'hero') {
    const out = path.join(OUT, 'og-image.jpg');
    await load(src)
      .resize(1200, 630, { fit: 'cover', position: sharp.strategy.attention })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(out);
    console.log(`  ${out}`);
  }
}

// Icons from the SVG logo mark.
const icon = path.join(OUT, 'favicon.svg');
await sharp(icon, { density: 600 }).resize(180, 180).png().toFile(path.join(OUT, 'apple-touch-icon.png'));
await sharp(icon, { density: 300 }).resize(32, 32).png().toFile(path.join(OUT, 'favicon-32.png'));
console.log('  icons');
