// Offline cover optimization; the site itself never needs sharp or remote requests.
import { readFile, mkdir, access, writeFile, rename } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = require(process.env.SHARP_MODULE || 'sharp');
const root = new URL('../', import.meta.url);
const library = JSON.parse(await readFile(new URL('content/books.json', root), 'utf8'));
const books = library.books.filter(book => book.shelf === 'read');
if (books.some(book => !/^\d+$/.test(book.id))) throw new Error('Invalid book ID');
const directory = new URL('assets/books/', root);
await mkdir(directory, { recursive: true });
let cursor = 0, saved = 0, skipped = 0;
const failed = [];
async function worker() {
  while (cursor < books.length) {
    const book = books[cursor++];
    const path = new URL(`${book.id}.webp`, directory);
    try { await access(path); skipped++; continue; } catch {}
    if (!book.coverSource) { failed.push(book.id); continue; }
    try {
      const url = new URL(book.coverSource);
      if (url.protocol !== 'https:' || !['i.gr-assets.com', 'images.gr-assets.com'].includes(url.hostname)) throw new Error('Unexpected cover host');
      const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
      if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error(`Image response ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length > 10000000) throw new Error('Oversized image');
      const output = await sharp(buffer).rotate().resize({ width: 240, height: 360, fit: 'inside', withoutEnlargement: true }).webp({ quality: 77 }).toBuffer();
      const temporary = new URL(`${book.id}.tmp`, directory);
      await writeFile(temporary, output);
      await rename(temporary, path);
      saved++;
    } catch (error) { failed.push(book.id); console.warn(`Cover ${book.id}: ${error.message}`); }
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
console.log(JSON.stringify({ saved, skipped, failed }));
if (failed.length) console.log('Missing covers use a title-and-author fallback. Re-run to retry.');
