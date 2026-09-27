// Builds every public page from content/*.json and templates/.
// Run: node scripts/build.mjs   (Node 18+; no packages needed)
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { root, site, escape, link, inline, render, hasCover, SITE_URL } from './render.mjs';

const write = async (path, html) => {
  const url = new URL(path, root);
  await mkdir(new URL('./', url), { recursive: true });
  await writeFile(url, html);
};
const arrow = '<span class="arrow" aria-hidden="true">&#8599;</span>';
const monthYear = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' });

/* ---------- Writing ---------- */
const essays = [...site.writing].sort((a, b) => b.date.localeCompare(a.date));
const featured = essays.find((essay) => essay.featured);
const years = essays.map((essay) => essay.date.slice(0, 4));
const featuredHTML = featured ? `<article class="feature">
        <p class="label">Start here</p>
        <h3 class="feature-title"><a href="${link(featured.url)}">${escape(featured.title)}</a></h3>
        ${featured.note ? `<p class="feature-note">${escape(featured.note)}</p>` : ''}
        <p class="feature-meta"><time datetime="${escape(featured.date)}">${monthYear.format(new Date(featured.date))}</time> &middot; Read on Medium ${arrow}</p>
      </article>` : '';
const writingHTML = essays.filter((essay) => essay !== featured).map((essay) => `<li><a class="index-row" href="${link(essay.url)}"><span class="index-title">${escape(essay.title)}</span><time datetime="${escape(essay.date)}">${essay.date.slice(0, 4)}</time></a></li>`).join('\n');

/* ---------- Projects ---------- */
const art = {
  wheel: `<svg viewBox="0 0 240 180" aria-hidden="true"><g class="wheel"><circle cx="120" cy="94" r="58"/>${
    Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4;
      return `<line x1="120" y1="94" x2="${(120 + 58 * Math.cos(a)).toFixed(1)}" y2="${(94 + 58 * Math.sin(a)).toFixed(1)}"/>`;
    }).join('')
  }<path class="fill" d="M120 94 L178 94 A58 58 0 0 1 161 135 Z"/><circle class="hub" cx="120" cy="94" r="5"/></g><path class="pointer" d="M113 24 h14 l-7 12 Z"/></svg>`,
  globe: `<svg viewBox="0 0 240 180" aria-hidden="true"><g class="globe"><circle cx="120" cy="90" r="62"/><ellipse cx="120" cy="90" rx="24" ry="62"/><ellipse cx="120" cy="90" rx="46" ry="62"/><line x1="120" y1="28" x2="120" y2="152"/><line x1="58" y1="90" x2="182" y2="90"/><line x1="66" y1="60" x2="174" y2="60"/><line x1="66" y1="120" x2="174" y2="120"/></g><g class="peaks"><circle cx="97" cy="70" r="3.5"/><circle cx="148" cy="82" r="3.5"/><circle cx="128" cy="112" r="3.5"/><circle cx="84" cy="104" r="3.5"/><circle cx="160" cy="58" r="3.5"/></g></svg>`,
  watch: `<svg viewBox="0 0 240 180" aria-hidden="true"><line class="axis" x1="120" y1="18" x2="120" y2="166"/>${
    [['back', 138], ['movement', 108], ['dial', 78], ['crystal', 48]].map(([name, y]) => `<g class="layer ${name}"><ellipse cx="120" cy="${y}" rx="64" ry="17"/>${
      name === 'movement' ? `<circle class="accent" cx="104" cy="${y}" r="7"/><circle cx="134" cy="${y - 2}" r="10"/>` : ''
    }${name === 'dial' ? `<line class="accent" x1="120" y1="${y}" x2="162" y2="${y + 4}"/><line class="accent" x1="120" y1="${y}" x2="111" y2="${y - 10}"/><circle class="hub" cx="120" cy="${y}" r="2.5"/>` : ''}</g>`).join('')
  }</svg>`,
  rings: `<svg viewBox="0 0 240 180" aria-hidden="true"><circle cx="100" cy="90" r="44"/><circle cx="140" cy="90" r="44"/></svg>`,
};
const projectsHTML = site.projects.length ? `<ul class="projects">${site.projects.map((project) => {
  const figure = art[project.art] || art.rings;
  const title = project.url ? `<a href="${link(project.url)}">${escape(project.title)} ${arrow}</a>` : escape(project.title);
  return `<li class="project">
        ${project.url ? `<a class="project-art" href="${link(project.url)}" tabindex="-1" aria-hidden="true">${figure}</a>` : `<div class="project-art">${figure}</div>`}
        ${project.status ? `<p class="label">${escape(project.status)}</p>` : ''}
        <h3>${title}</h3>
        ${project.description ? `<p class="project-description">${escape(project.description)}</p>` : ''}
      </li>`;
}).join('\n')}</ul>` : '<p class="empty-note">New projects are on the bench.</p>';

/* ---------- Talks ---------- */
const talksHTML = site.talks.map((talk) => `<li><a class="talk" href="${link(talk.url)}"><span class="talk-title">${escape(talk.title)}</span>${talk.description ? `<span class="talk-description">${escape(talk.description)}</span>` : ''}<span class="talk-cta">Watch ${arrow}</span></a></li>`).join('\n');

/* ---------- Reading ---------- */
const library = JSON.parse(await readFile(new URL('content/books.json', root), 'utf8'));
const themes = JSON.parse(await readFile(new URL('content/book-themes.json', root), 'utf8'));
const read = library.books.filter((book) => book.shelf === 'read');
const shelf = [];
for (const book of [...read].sort((a, b) => (b.added || '').localeCompare(a.added || ''))) {
  if (shelf.length === 6) break;
  if (await hasCover(book.id)) shelf.push(book);
}
const shelfHTML = shelf.map((book) => `<li><a class="shelf-book" href="books/?q=${encodeURIComponent(book.title.split(':')[0])}" title="${escape(book.title)}, ${escape(book.author)}"><img src="assets/books/${book.id}.webp" width="240" height="360" alt="${escape(book.title)} by ${escape(book.author)}" loading="lazy" decoding="async"></a></li>`).join('\n');
const authors = new Map();
for (const book of read) {
  const author = book.author.trim().replace(/\s+/g, ' ');
  authors.set(author, (authors.get(author) || 0) + 1);
}
const [topAuthor] = [...authors].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
const readIDs = new Set(read.map((book) => book.id));
const groups = themes.groups
  .map((group) => ({ ...group, count: group.ids.filter((id) => readIDs.has(id)).length }))
  .filter((group) => group.count);
const themeBar = groups.length ? `<div class="themes">
        <div class="theme-bar" role="img" aria-label="${escape(groups.map((g) => `${g.label}: ${g.count} books`).join('; '))}">${groups.map((g) => `<span class="${g.tone}" style="flex-grow:${g.count}"></span>`).join('')}</div>
        <ul class="theme-key">${groups.map((g) => `<li><a href="books/?topic=${g.id}"><i class="${g.tone}" aria-hidden="true"></i>${escape(g.label)} <span>${Math.round((g.count / read.length) * 100)}%</span></a></li>`).join('')}</ul>
      </div>` : '';

/* ---------- Pages ---------- */
await write('index.html', await render('index.html', {
  TITLE: `${escape(site.name)} · ${escape(site.tagline)}`,
  DESCRIPTION: `${escape(site.bio)} Essays, projects, talks, and a reading shelf.`,
  URL: SITE_URL,
  BIO_URL: link(site.bioUrl), LOCATION: escape(site.location), TIME_ZONE: escape(site.timeZone),
  INTRO: inline(site.intro),
  WRITING_SPAN: `selected from ${years.at(-1)} to ${years[0]}`,
  FEATURED: featuredHTML, WRITING: writingHTML, PROJECTS: projectsHTML, TALKS: talksHTML,
  READING_SUMMARY: `${read.length} books and counting. ${escape(topAuthor[0])} turns up most often.`,
  SHELF: shelfHTML, THEME_BAR: themeBar,
}));

await write('colophon/index.html', await render('colophon.html', {
  ROOT: '../', TITLE: `Colophon · ${escape(site.name)}`,
  DESCRIPTION: 'How this site is made: type, tools, and principles.',
  URL: `${SITE_URL}colophon/`,
}));

await write('404.html', await render('404.html', {
  ROOT: '/', TITLE: `Page not found · ${escape(site.name)}`,
  DESCRIPTION: 'This page does not exist.', URL: SITE_URL,
}));

// Old on-site writing index: send visitors to the essays.
await write('writing/index.html', `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex">
<title>Writing · ${escape(site.name)}</title>
<link rel="canonical" href="${link(site.writingUrl)}">
<meta http-equiv="refresh" content="0; url=${link(site.writingUrl)}">
</head><body><p>Essays now live on <a href="${link(site.writingUrl)}">Medium</a>.</p></body></html>
`);

const pages = ['', 'books/', 'blowup/', 'colophon/'];
await write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((page) => `  <url><loc>${SITE_URL}${page}</loc></url>`).join('\n')}
</urlset>
`);
await write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}sitemap.xml\n`);

console.log(`Built index.html: ${essays.length} essays, ${site.projects.length} projects, ${site.talks.length} talks, ${shelf.length} shelf covers.`);
console.log('Built colophon/, 404.html, writing/ redirect, sitemap.xml, robots.txt.');

await import('./build-books.mjs');
