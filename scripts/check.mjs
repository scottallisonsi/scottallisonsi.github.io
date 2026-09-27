// Sanity checks for the built site. Run after node scripts/build.mjs.
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const pages = ['index.html', 'books/index.html', 'colophon/index.html', '404.html'];

for (const page of pages) {
  const url = new URL(page, root);
  const html = await readFile(url, 'utf8');
  assert(!html.includes('{{'), `${page}: unfilled template field`);
  assert.match(html, /<meta property="og:image" content="https:\/\/scottallisonsi\.github\.io\/assets\/og\/[a-z]+\.png">/, `${page}: missing share image`);
  const image = html.match(/og:image" content="https:\/\/scottallisonsi\.github\.io\/([^"]+)"/)[1];
  await stat(new URL(image, root));
  // Every local link, script, stylesheet, and image must exist.
  for (const [, ref] of html.matchAll(/(?:href|src)="([^"#?]+)[^"]*"/g)) {
    if (/^(https?:|mailto:|data:)/.test(ref)) continue;
    const target = ref.startsWith('/') ? new URL(`.${ref}`, root) : new URL(ref, url);
    const path = target.pathname.endsWith('/') ? new URL('index.html', target) : target;
    await stat(path).catch(() => assert.fail(`${page}: broken local reference ${ref}`));
  }
}

// Nothing smaller than 11px, anywhere.
for (const sheet of ['styles.css', 'books/books.css']) {
  const css = await readFile(new URL(sheet, root), 'utf8');
  for (const [, size] of css.matchAll(/font(?:-size)?:\s*(?:[a-z0-9 ]*\s)?(\d+(?:\.\d+)?)px/g)) {
    assert(Number(size) >= 11, `${sheet}: ${size}px text is below the 11px floor`);
  }
}

console.log(`Site checked: ${pages.length} pages, local references, share images, 11px floor.`);
await import('./check-books.mjs');
await import('./check-blowup.mjs');
