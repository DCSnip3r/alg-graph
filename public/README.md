# Public Folder

Static files served directly at the web root (e.g., `index.html` references, favicon, experimental test pages like `colorTest.html`).

Anything here bypasses module graph bundling. Use for:
* Lightweight static HTML test fixtures.
* Icons / manifest files.

Avoid placing large or numerous assets here—prefer importing through `src/assets` so Vite can optimize.
