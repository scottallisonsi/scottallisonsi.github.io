# Scott Allison Si

A small, editorial personal website. The homepage uses plain HTML, CSS, and a little JavaScript;
no framework, dependencies, remote fonts, analytics, or video embeds.

## Update content

Edit `content/site.json`, then run:

```sh
node scripts/build.mjs
```

This regenerates `index.html` and `books/index.html`. Node 18+ is needed only to
build, never to serve. Keep both generated pages alongside the source files when publishing.
The layout lives in `templates/index.html`; visual styles live in `styles.css`.
Do not edit the generated page directly: the next build would overwrite it.

### Add a project

Add an object to the `projects` list. The list order is the display order:

```json
{
  "title": "Project name",
  "description": "What it does and who it is for.",
  "url": "https://example.com",
  "status": "Live / Web tool",
  "tags": ["Category", "Another category"]
}
```

Use an empty `url` for unpublished projects. They appear as text, without a dead
link. Status and tags are optional. An empty project list has a coming-soon state.
The artwork is decorative CSS, not a product screenshot.

Freewheeling's description was checked against its live homepage. The Atlas copy
is based on your Civilizational Peak Atlas concept. Blowup links to its standalone interactive watch at `/blowup/`.

### Curate writing and discover new articles

The homepage shows ten selected essays from across the archive, rather than the
ten newest posts. Edit the `writing` array in `content/site.json` and rebuild.
The build sorts the selection in reverse chronological order automatically.
See `docs/writing-selection.md` for the shortlist, rationale, and alternates.

Python 3 uses Medium's public RSS feed, with no packages or API keys:

```sh
python3 scripts/update-writing.py
```

This saves the latest ten candidates in `content/latest-writing.json`. Copy any
you want to feature into `content/site.json`, then run `node scripts/build.mjs`.
The command never changes your curated homepage. A failed or empty feed leaves
the existing candidate list intact. Refresh is manual, not scheduled.
Visitors load the saved HTML, never the feed.

### Refresh the bookshelf

The `/books/` page shows only books marked read in your public Goodreads library,
not a live widget. The import retains the other shelves for future use, but they
are never embedded in the page. No login, API key, or visitor tracking is needed.

```sh
python3 scripts/update-books.py
node scripts/cache-book-covers.mjs
node scripts/build.mjs
```

The optional cover-cache step needs the `sharp` image library. Install it once
with `npm install --no-save --package-lock=false sharp`, or point `SHARP_MODULE`
to an existing installation. Do not commit `node_modules/`. Existing covers are
reused, and an unavailable cover gets a title-and-author fallback. New content
works without running the cover step. The importer needs Python 3 only; failed
requests or invalid data leave the previous snapshot intact.

Data lives in `content/books.json`, the layout in `templates/books.html`, and
the small interaction and style files in `books/`. Covers are local WebPs in
`assets/books/`, at most 240 by 360 pixels. All read books are shown together,
with native lazy loading for covers instead of pagination. Visitors never contact Goodreads until
they choose an outbound link. Search, filters, sorting, and the cover/spine
switch run entirely in the browser. Filter URLs can be bookmarked. Without
JavaScript, all books remain ordinary links.

Ratings are yours, not community averages. Unrated is distinct from zero.
The default order is date added, not date read: most entries have no read date.
The page displays its snapshot date; refreshing and publishing are manual.
Automatic syncing is intentionally not enabled.

The infographic is built from `content/book-themes.json`. Its six themes are
editorial primary-topic groupings, not Goodreads-supplied genres. Assign each
book ID to at most one group. All counts, percentages, and the most represented
author are calculated at build time from read books only. New books without a
theme appear as "Not yet grouped", never guessed into a category. Clicking a
theme filters the bookshelf; the infographic continues to summarize the full
collection. No charting library, images, or AI calls are required to render it.

## Preview

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://localhost:8000. The page also works when opened directly as a file.

## GitHub Pages

Public destination: https://scottallisonsi.github.io/
Repository: scottallisonsi/scottallisonsi.github.io

This workspace inherits a Git repository rooted in the home directory. Use an
isolated clone of the website repository when deploying. Do not use `git add .`
from the inherited home repository.

Rebuild, then copy these public assets to the Pages repository root:

- `index.html`
- `styles.css`
- `theme.js`
- `script.js`
- `books/`
- `assets/`

Also commit `content/`, `templates/`, `scripts/`, and this README so the site
remains maintainable. Push normally to the Pages source branch, preserving remote
history. Keep the existing Jekyll configuration and do not add `.nojekyll`:
the writing archive, older posts, colophon, and 404 page still use Jekyll. The
homepage has no front matter and is served as prebuilt HTML. Exclude `content/`,
`templates/`, `scripts/`, and `docs/` from the Jekyll build. The original portrait
`fastforwardistframe.png` is retained locally; the site loads two ~6 KB WebPs for
the neutral and smiling states. Both are circular. The smile appears on hover or
keyboard focus; the portrait is also a link to the bio. The imagegen prompt and
asset provenance are in `docs/avatar-edit.md`.

## Behavior

- Theme follows the system until the visitor chooses a mode; saved preferences
  apply before first paint. Blocked storage does not break the toggle.
- All writing, project information, and talks work without JavaScript.
- Motion respects reduced-motion preferences.
- Page navigation and focus outlines work with a keyboard.
- All page assets are local; the homepage payload is roughly 35 KB before HTTP
  compression. The bookshelf loads its own small scripts and lazy-loaded covers
  only when visited. No install step is needed to preview or publish.

## Blowup watch explorer

`/blowup/` is a separate React/Three.js application with prebuilt static files in
`blowup/`. Its source and lockfile live in `tools/blowup/`, excluded from Jekyll.
The homepage links to it with a normal anchor; it never loads or prefetches the
watch bundle. No iframe, shared framework, external runtime, or service worker
is involved. The watch also links back to the homepage.

To update it (Node 22.12+):

```sh
npm --prefix tools/blowup ci
npm --prefix tools/blowup run build
node scripts/build.mjs
node scripts/check-blowup.mjs
```

Commit both `tools/blowup/` and the generated `blowup/` assets. Keep the existing
Jekyll setup: the export uses ordinary `assets/` filenames under `/blowup/`,
so no underscore-directory include rule or `.nojekyll` file is needed.

The watch is an original simplified NH35 educational reconstruction, using no
purchased model. Dependencies' license texts are included in
`blowup/THIRD_PARTY_LICENSES.txt`; this text is not fetched by the application.
The 3D module is loaded separately on the subpage; playback is on demand and
stops rendering when the tab is hidden.
