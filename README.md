# Scott Allison Si

A small, editorial personal website. Plain HTML, CSS, and a little JavaScript;
no framework, dependencies, remote fonts, analytics, or video embeds.

## Update content

Edit `content/site.json`, then run:

```sh
node scripts/build.mjs
```

This regenerates `index.html`. Node 18+ is needed only to build, never to serve.
Keep the generated `index.html` alongside the source files when publishing.
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
is based on your Civilizational Peak Atlas concept. BlowUp has teaser copy only.

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
- All page assets are local; the complete initial payload is roughly 35 KB
  before HTTP compression. No install step is needed to preview or publish.
