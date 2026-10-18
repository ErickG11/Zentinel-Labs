// Uso: node scripts/capture-case-screenshots.mjs <carpetaDelSitio> <carpetaSalida>
import { createServer } from 'node:http';
import { mkdir, readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { chromium } from '@playwright/test';

const [siteDir, outDir] = process.argv.slice(2);
if (!siteDir || !outDir) {
  process.stderr.write('Uso: node scripts/capture-case-screenshots.mjs <siteDir> <outDir>\n');
  process.exit(1);
}

const PORT = 4321;
const root = resolve(siteDir);
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://localhost:${PORT}`);
  let filePath = normalize(join(root, decodeURIComponent(url.pathname)));
  if (!filePath.startsWith(root)) {
    response.writeHead(403).end();
    return;
  }
  try {
    if ((await stat(filePath)).isDirectory()) filePath = join(filePath, 'index.html');
  } catch {
    filePath = join(root, 'index.html');
  }
  try {
    const body = await readFile(filePath);
    const type = MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream';
    response.writeHead(200, { 'content-type': type }).end(body);
  } catch {
    response.writeHead(404).end();
  }
});

await new Promise((done) => server.listen(PORT, done));
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const shots = ['cover', 'shot-1', 'shot-2', 'shot-3'];
for (const [index, name] of shots.entries()) {
  await page.evaluate((top) => window.scrollTo(0, top), index * 1000);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: join(outDir, `${name}.jpg`), type: 'jpeg', quality: 85 });
}

await browser.close();
server.close();
process.stdout.write(`Capturas guardadas en ${outDir}\n`);
