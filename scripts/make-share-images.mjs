// Renders the 1200x630 link-preview images in assets/og/.
// Optional and rarely needed: re-run only after changing the name, tagline,
// or bookshelf. Needs a local Chromium via Playwright:
//   npm install --no-save --package-lock=false playwright-core
//   CHROMIUM=/path/to/chromium node scripts/make-share-images.mjs
// Serve the site first (python3 -m http.server 8000) so Blowup can render.
import { readFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { root, site, escape } from './render.mjs';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const base = process.env.SITE || 'http://127.0.0.1:8000';
const out = new URL('assets/og/', root);
await mkdir(out, { recursive: true });

const file = (path) => `${base}/${path}`;
const css = `
@font-face { font-family: S; src: url(${file('assets/fonts/source-serif-4.woff2')}); font-weight: 350 600; }
@font-face { font-family: M; src: url(${file('assets/fonts/ibm-plex-mono.woff2')}); }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; background: #f4f1ea; color: #22231e; font-family: S; position: relative; overflow: hidden; }
.frame { position: absolute; inset: 56px 64px; border-top: 2px solid #22231e; border-bottom: 1px solid #dcd7cb; }
.top { position: absolute; top: 20px; left: 0; right: 0; display: flex; justify-content: space-between; font: 17px M; letter-spacing: .12em; text-transform: uppercase; }
.top span:last-child { color: #a3432c; }
.url { position: absolute; bottom: 18px; left: 0; font: 17px M; color: #5d5e55; letter-spacing: .04em; }
h1 { font-weight: 380; letter-spacing: -.028em; line-height: .98; }
p { color: #5d5e55; }
`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(`${base}/404.html`); // same origin as the fonts
const shoot = async (name, html) => {
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html}</body></html>`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: new URL(`${name}.png`, out).pathname });
};

// Homepage
await shoot('home', `<div class="frame">
  <div class="top"><span>${escape(site.tagline)}</span><span>${escape(site.location)}</span></div>
  <div style="position:absolute;top:128px;left:0;right:0;display:grid;grid-template-columns:230px 1fr;gap:56px;align-items:center">
    <div style="width:230px;height:230px;border-radius:50%;background:#ebe7dd;box-shadow:0 0 0 1.5px #dcd7cb;padding:10px"><img src="${file('assets/portrait.webp')}" style="width:100%;height:100%;border-radius:50%;object-fit:cover"></div>
    <div><h1 style="font-size:104px">${escape(site.name)}</h1>
    <p style="margin-top:26px;font-size:34px;line-height:1.35">Product builder, writer, and educator.</p></div>
  </div>
  <div class="url">scottallisonsi.github.io</div>
</div>`);

// Books
const library = JSON.parse(await readFile(new URL('content/books.json', root), 'utf8'));
const themes = JSON.parse(await readFile(new URL('content/book-themes.json', root), 'utf8'));
const read = new Set(library.books.filter((b) => b.shelf === 'read').map((b) => b.id));
const tones = { clay: '#934f3c', moss: '#53674b', ink: '#344d53', ochre: '#c2a169', slate: '#6c7781', berry: '#795454' };
const marks = themes.groups.flatMap((g) => g.ids.filter((id) => read.has(id)).map(() => tones[g.tone]));
await shoot('books', `<div class="frame">
  <div class="top"><span>Books</span><span>${read.size} read</span></div>
  <h1 style="position:absolute;top:92px;font-size:84px">What I&rsquo;ve been reading</h1>
  <div style="position:absolute;top:236px;left:0;right:0;display:grid;grid-template-columns:repeat(31,1fr);gap:5px">${marks.map((c) => `<i style="height:30px;background:${c};border-radius:1px"></i>`).join('')}</div>
  <div class="url">scottallisonsi.github.io/books</div>
</div>`);

// Blowup: the live 3D render alone, without its interface, on a dark card.
const live = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await live.goto(`${base}/blowup/`, { waitUntil: 'networkidle' });
await live.addStyleTag({ content: 'html, body { background: transparent !important; } * { visibility: hidden !important; } canvas { visibility: visible !important; }' });
await live.waitForTimeout(3500);
const canvas = live.locator('canvas').first();
const watch = await canvas.screenshot({ omitBackground: true });
const box = await canvas.boundingBox();
await shoot('blowup', `<div style="position:absolute;inset:0;background:radial-gradient(circle at 72% 50%,#34495a,#1b242c 70%)"></div>
  <img src="data:image/png;base64,${watch.toString('base64')}" style="position:absolute;left:330px;top:${330 - (box.height * 960 / box.width) / 2}px;width:960px">
  <div style="position:absolute;left:64px;top:72px;color:#f1ece2;width:440px">
    <div style="font:17px M;letter-spacing:.12em;text-transform:uppercase;color:#e3a86f">Blowup</div>
    <h1 style="margin-top:22px;font-size:84px">Time, taken apart.</h1>
    <p style="margin-top:24px;font-size:28px;line-height:1.4;color:#b9c0c4">An automatic watch, in three dimensions.</p>
  </div>
  <div style="position:absolute;left:64px;bottom:56px;font:17px M;color:#9aa4a9;letter-spacing:.04em">scottallisonsi.github.io/blowup</div>`);

await browser.close();
console.log('Wrote assets/og/home.png, books.png, blowup.png');
