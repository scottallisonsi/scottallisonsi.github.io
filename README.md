# Personal Website

A clean, neoclassical-inspired personal site designed for GitHub Pages.

## Edit Your Content

Update placeholders in `index.html`:

- `[Your Name]`
- `[Your Initials]`
- `[role/title]`, `[focus area]`, and `[interest]`
- Email + social links
- Project and writing links
- Place your profile image in the project root and update `index.html` to match the filename

## Run Locally

You can open `index.html` directly in a browser, or run a simple local server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish to GitHub Pages

If this is your main profile repo (`<username>.github.io`):

1. Push these files to the `main` branch.
2. In GitHub repo settings, go to **Pages**.
3. Set source to **Deploy from branch**.
4. Select `main` and root (`/`).
5. Save and wait for deployment.

Your site will be live at `https://<username>.github.io/`.
