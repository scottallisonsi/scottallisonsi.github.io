# scottallisonsi.github.io

Personal site of Scott Allison Si. Built with Jekyll, served by GitHub
Pages, styled by hand. Live at <https://scottallisonsi.github.io>.

## How to update content

Everything you'd change day-to-day lives in two places: `_data/` (lists)
and `_posts/` (essays). Edit them on github.com directly — press `.` or
the pencil icon on any file — commit, and GitHub Pages rebuilds the site
in a minute or two. No local tooling required.

### Write a new essay

Add a Markdown file to `_posts/` named `YYYY-MM-DD-slug.md`:

```markdown
---
layout: post
title: The Title
subtitle: An optional one-line dek shown under the title.
---

Body in Markdown. Blockquotes, headings, images, and `---`
section breaks are all styled.
```

It appears automatically on the homepage (latest five), the
[/writing](https://scottallisonsi.github.io/writing/) index, and the RSS
feed. The URL will be `/writing/YYYY/slug/`.

### Edit the lists

| File | Drives | Notes |
| --- | --- | --- |
| `_data/profile.yml` | Name, tagline, bio paragraphs, portrait | Bio items accept inline HTML links |
| `_data/now.yml` | The "Now" section | Update `as_of` when you revise it |
| `_data/canon.yml` | Handpicked best essays | `note:` is an optional annotation line |
| `_data/talks.yml` | Talks list | `year` and `note` optional |
| `_data/library.yml` | Books | `note` optional |
| `_data/elsewhere.yml` | Contact / profiles row | `handle` is the small grey text |

Each file has a comment at the top showing its format. Order in the file
is the order on the page.

### Rarely-touched things

- `_config.yml` — site title, description, URL, permalink format
- `_layouts/` + `assets/css/main.css` — structure and design
- `colophon.md`, `404.html` — the small pages
- `assets/images/portrait.png` — the avatar (transparent PNG)

## Local preview (optional)

```sh
bundle install
bundle exec jekyll serve
# open http://localhost:4000
```

## Design notes

Slow editorial: one serif family ([Newsreader](https://fonts.google.com/specimen/Newsreader)),
warm paper / ink palette with a plum accent, dotted-leader indexes,
and a hairline viewport frame — the "slow frame." Dark mode follows the
system and can be toggled; the choice is remembered in `localStorage`.
