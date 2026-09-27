// Tiny template renderer shared by every page build.
// {{> name}} includes templates/partials/name.html; {{KEY}} fills a value.
import { readFile, readdir, stat } from 'node:fs/promises';

export const root = new URL('../', import.meta.url);
export const SITE_URL = 'https://scottallisonsi.github.io/';

export const escape = (text) => String(text ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);

export const link = (url) => {
  if (new URL(url).protocol !== 'https:') throw new Error(`Expected an HTTPS link: ${url}`);
  return escape(url);
};

// Plain text with optional [label](https://…) links, safe to put in HTML.
export const inline = (text) => escape(text).replace(
  /\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g,
  (_, label, url) => `<a href="${url}">${label}</a>`,
);

// A cached cover counts only if it is a real image, not an empty placeholder.
export const hasCover = async (id) => {
  try { return (await stat(new URL(`assets/books/${id}.webp`, root))).size > 1024; } catch { return false; }
};

const partials = {};
for (const file of await readdir(new URL('templates/partials/', root))) {
  if (file.endsWith('.html')) {
    partials[file.slice(0, -5)] = (await readFile(new URL(`templates/partials/${file}`, root), 'utf8')).trim();
  }
}

export const site = JSON.parse(await readFile(new URL('content/site.json', root), 'utf8'));

const defaults = {
  ROOT: '', YEAR: new Date().getFullYear(), EXTRA_HEAD: '', BODY_CLASS: '',
  CURRENT_WRITING: '', CURRENT_PROJECTS: '', CURRENT_TALKS: '', CURRENT_BOOKS: '',
  NAME: escape(site.name), TAGLINE: escape(site.tagline),
  MEDIUM_URL: link(site.writingUrl), LINKEDIN_URL: link(site.linkedinUrl), GOODREADS_URL: link(site.goodreadsUrl),
  OG_IMAGE: `${SITE_URL}assets/og/home.png`, OG_ALT: `${escape(site.name)}: ${escape(site.tagline)}`,
};

export async function render(templateName, values) {
  const all = { ...defaults, ...values };
  all.HOME ??= all.ROOT || './';
  let html = await readFile(new URL(`templates/${templateName}`, root), 'utf8');
  html = html.replace(/\{\{> ([a-z-]+)\}\}/g, (_, name) => {
    if (!(name in partials)) throw new Error(`Unknown partial: ${name}`);
    return partials[name];
  });
  return html.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {
    if (!(key in all)) throw new Error(`Unknown template field in ${templateName}: ${key}`);
    return all[key];
  });
}
