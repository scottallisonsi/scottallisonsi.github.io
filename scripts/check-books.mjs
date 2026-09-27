import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const json = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const library = await json('content/books.json');
const taxonomy = await json('content/book-themes.json');
const html = await readFile(new URL('books/index.html', root), 'utf8');
const embedded = JSON.parse(html.match(/<script type="application\/json" id="book-data">([\s\S]*?)<\/script>/)[1]);
const read = library.books.filter(book => book.shelf === 'read');
assert.equal(embedded.length, read.length);
assert.deepEqual(embedded.map(book => book.id), read.map(book => book.id));
assert.equal(new Set(embedded.map(book => book.id)).size, read.length);
assert(embedded.every(book => book.shelf === 'read' && !('coverSource' in book)));
assert.equal((html.match(/class="book-card"/g) || []).length, read.length);
assert.equal((html.match(/class="book-mark /g) || []).length, read.length);
assert(!html.includes('id="show-more"'));
assert(!html.includes('{{'));
const assignments = new Map();
for (const group of taxonomy.groups) {
  for (const id of group.ids) {
    assert(!assignments.has(id), `Duplicate theme: ${id}`);
    assignments.set(id, group.id);
  }
}
for (const book of embedded) assert.equal(book.topic, assignments.get(book.id) || 'ungrouped');
const homepage = await readFile(new URL('index.html', root), 'utf8');
const shelfImages = homepage.match(/<img[^>]+assets\/books\/[^>]+>/g) || [];
assert(shelfImages.length <= 6, 'Homepage shows at most six covers');
assert(shelfImages.every(tag => tag.includes('loading="lazy"')), 'Homepage covers must lazy-load');
assert(!/<script[^>]+books\.js/.test(homepage), 'Bookshelf script stays on /books/');
console.log(`Books checked: ${read.length} read books; complete theme map; homepage shelf is light.`);
