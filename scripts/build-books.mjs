import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { root, render, hasCover, SITE_URL } from './render.mjs';
const library = JSON.parse(await readFile(new URL('content/books.json', root), 'utf8'));
const taxonomy = JSON.parse(await readFile(new URL('content/book-themes.json', root), 'utf8'));
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const groups = [...taxonomy.groups, {id:'ungrouped',label:'Not yet grouped',tone:'unclassified',ids:[]}];
const byID = new Map();
for (const group of groups) {
  if (!/^[a-z]+$/.test(group.id) || !/^[a-z]+$/.test(group.tone)) throw new Error('Invalid theme');
  for (const id of group.ids) {
    if (byID.has(id)) throw new Error(`Duplicate theme assignment: ${id}`);
    byID.set(id, group);
  }
}
const readBooks = library.books.filter(book => book.shelf === 'read');
if (!readBooks.length) throw new Error('No read books; refusing an empty build');
const bookData = [];
const cards = [];
const seen = new Set();
for (const book of readBooks) {
  if (!/^\d+$/.test(book.id) || seen.has(book.id)) throw new Error('Invalid or repeated book ID');
  seen.add(book.id);
  const url = new URL(book.url);
  if (url.protocol !== 'https:' || url.hostname !== 'www.goodreads.com') throw new Error('Invalid book link');
  let cover = '';
  if (await hasCover(book.id)) cover = `../assets/books/${book.id}.webp`;
  const group = byID.get(book.id) || groups.at(-1);
  const { coverSource, ...publicBook } = book;
  bookData.push({ ...publicBook, cover, tone:group.tone, topic:group.id });
  cards.push(`<li class="book-card" data-id="${book.id}">
    <a class="book-open" href="${escape(book.url)}" aria-label="${escape(book.title)}, by ${escape(book.author)}">
      <span class="cover-stage ${group.tone}"><span class="cover-fallback"><span>${escape(book.title)}</span><small>${escape(book.author)}</small></span>${cover ? `<img src="${cover}" width="240" height="360" alt="" loading="lazy" decoding="async">` : ''}</span>
      <span class="book-spine ${group.tone}" aria-hidden="true"><span>${escape(book.title)}</span><small>${escape(book.author)}</small></span>
      <span class="book-caption"><span class="book-title">${escape(book.title)}</span><span class="book-author">${escape(book.author)}</span>${book.rating ? `<span class="book-meta"><span class="book-rating" aria-label="Scott rated ${book.rating} out of 5">${'&#9733;'.repeat(book.rating)}</span></span>` : ''}</span>
    </a>
  </li>`);
}
const populated = groups.map(group => ({...group,books:bookData.filter(book=>book.topic===group.id)})).filter(group=>group.books.length);
const fiction = bookData.filter(book=>book.topic==='stories').length;
const nonfiction = bookData.filter(book=>!['stories','ungrouped'].includes(book.topic)).length;
const systemsMindMaking = bookData.filter(book=>['systems','mind','making'].includes(book.topic)).length;
const percent = (n,total) => Math.round(n / total * 100);
const authors = new Map();
for (const book of bookData) {
  const author = book.author.trim().replace(/\s+/g,' ');
  authors.set(author,(authors.get(author)||0)+1);
}
const topAuthors = [...authors].sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0]));
const values = {
  CARDS: cards.join('\n'), TOTAL: readBooks.length,
  THEME_COUNT: populated.filter(group=>group.id!=='ungrouped').length,
  MAP_LABEL: escape(populated.map(group=>`${group.label}: ${group.books.length} books`).join('; ')),
  BOOK_MAP: populated.map(group=>group.books.map(book=>`<span class="book-mark ${group.tone}" data-mark-topic="${group.id}" title="${escape(book.title)}" aria-hidden="true"></span>`).join('')).join(''),
  THEMES: populated.map(group=>`<button type="button" class="theme-key ${group.tone}" data-topic="${group.id}" aria-pressed="false" disabled><i aria-hidden="true"></i><span>${escape(group.label)}</span><strong>${group.books.length}</strong></button>`).join(''),
  INSIGHT: `<p><strong>${percent(fiction,readBooks.length)}%</strong> fiction &amp; poetry.</p><p>${nonfiction ? `Of the grouped nonfiction, <b>${percent(systemsMindMaking,nonfiction)}%</b> explores how people think, make things, and organize society.` : 'Themes update as books are added.'}</p>`,
  AUTHOR_INSIGHT: `Most represented author: <strong>${escape(topAuthors[0][0])}</strong> (${topAuthors[0][1]} books).`,
  UPDATED: escape(library.updated),
  UPDATED_LABEL: new Intl.DateTimeFormat('en', {day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(library.updated)),
  DATA: JSON.stringify(bookData).replace(/</g,'\\u003c'),
};
const html = await render('books.html', {
  ...values, ROOT: '../', CURRENT_BOOKS: ' aria-current="page"',
  TITLE: 'Books · Scott Allison Si',
  DESCRIPTION: `${readBooks.length} books Scott Allison Si has read, grouped into recurring themes, with personal ratings and a searchable shelf.`,
  URL: `${SITE_URL}books/`, OG_IMAGE: `${SITE_URL}assets/og/books.png`, OG_ALT: `${readBooks.length} books read, shown as a colour-coded map of themes`,
  EXTRA_HEAD: '<link rel="stylesheet" href="books.css">\n<script src="books.js" defer></script>',
});
await mkdir(new URL('books/',root),{recursive:true});
await writeFile(new URL('books/index.html',root),html);
console.log(`Built books/index.html: ${bookData.length} read books, ${bookData.filter(book=>book.cover).length} cached covers.`);
