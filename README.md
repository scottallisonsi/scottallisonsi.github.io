# scottallisonsi.github.io

The personal site of Scott Allison Si: selected essays, projects, talks, and a
reading shelf. Live at <https://scottallisonsi.github.io>.

Plain HTML, CSS, and a little JavaScript, generated from a few JSON files. No
framework, analytics, trackers, or third-party requests. Hosted on GitHub Pages.

## Updating the site

**You can do everything from github.com.** Open a file under `content/`, click
the pencil icon, edit, and commit to `main`. A GitHub Action rebuilds the pages
and publishes them within a couple of minutes. If an edit breaks the JSON, the
Action fails (you'll get an email) and the live site stays as it was.

| To change… | Edit | Notes |
| --- | --- | --- |
| Name, tagline, intro, links | `content/site.json` | In `intro`, write links as `[text](https://…)` |
| Selected essays | `writing` in `content/site.json` | Sorted newest-first automatically. Mark one `"featured": true` and give it a `"note"` to make it the "Start here" pick |
| Projects | `projects` in `content/site.json` | Order is display order. Leave `url` empty for unreleased work. `art` is `wheel`, `globe`, `watch`, or `rings` |
| Talks | `talks` in `content/site.json` | |
| Book themes | `content/book-themes.json` | Each Goodreads book ID belongs to at most one theme; new books show as "Not yet grouped" |

### Refreshing books and new essays

Actions tab → **Refresh books and writing** → **Run workflow**. It pulls your
public Goodreads shelves, caches any new covers, saves the latest Medium posts
to `content/latest-writing.json` as candidates, rebuilds, and commits. It never
changes your curated essay list; copy a candidate into `site.json` if you want
it on the homepage. Refreshing is manual by design.

Curation notes for the current essay selection are in `docs/writing-selection.md`.

## How it's put together

- `content/`: everything you edit
- `templates/`: page layouts; `templates/partials/` holds the shared head, masthead, and footer
- `styles.css`: the design system for every page; `books/books.css` adds the bookshelf
- `scripts/build.mjs`: generates `index.html`, `books/`, `colophon/`, `404.html`, `sitemap.xml`, and `robots.txt`
- `scripts/check.mjs`: verifies the output (template fields, local links, share images, an 11px minimum text size)
- `blowup/`: the prebuilt 3D watch; its source is in `tools/blowup/`
- `assets/fonts/`: Source Serif 4 and IBM Plex Mono, self-hosted under the SIL Open Font License
- `assets/og/`: link-preview images, regenerated with `scripts/make-share-images.mjs` (rarely needed)

Generated pages are committed, so the site works without a build step. Don't
edit `index.html` or `books/index.html` by hand; the next build overwrites them.

## Working locally (optional)

```sh
node scripts/build.mjs && node scripts/check.mjs   # Node 18+, no packages
python3 -m http.server 8000                        # then open http://localhost:8000
```

To rebuild Blowup (Node 22.12+):

```sh
npm --prefix tools/blowup ci
npm --prefix tools/blowup run build
```

Blowup is an original, simplified NH35 reconstruction. Dependency licences are
in `blowup/THIRD_PARTY_LICENSES.txt`. Its code loads only on `/blowup/`.

## Design notes

One serif, Source Serif 4, carries headlines and reading text through its
optical sizes; IBM Plex Mono is reserved for small labels. Warm paper, ink, and
a single terracotta accent, with a faint paper grain. Every section shares one
two-column rhythm: a narrow rail for the heading, a wide column for the content.
Small, quiet details: the portrait smiles on hover, the clock shows Singapore
time, and each project drawing moves on hover. The theme follows the system
until the visitor chooses, and motion respects reduced-motion settings.
