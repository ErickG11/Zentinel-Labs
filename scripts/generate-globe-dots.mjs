// Precalcula los puntos de tierra del globo: node --experimental-strip-types scripts/generate-globe-dots.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { generateDotsInFeature } from '../src/components/remote/globe-geometry.ts';

const DOT_STEP = 1.28;
const input = new URL('../public/data/land-110m.json', import.meta.url);
const output = new URL('../public/data/land-dots.json', import.meta.url);

const round = (value) => Math.round(value * 100) / 100;

const land = JSON.parse(await readFile(input, 'utf8'));
const flat = [];
for (const feature of land.features) {
  for (const [lng, lat] of generateDotsInFeature(feature, DOT_STEP))
    flat.push(round(lng), round(lat));
}

await writeFile(output, JSON.stringify(flat));
process.stdout.write(`${flat.length / 2} dots written\n`);
