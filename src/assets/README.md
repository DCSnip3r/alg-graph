# Assets Folder

Holds static, build‑time imported resources.

## Structure
* `cube-icon.svg` – App / favicon style asset.
* `graphs/*.json` – Example graph exports loaded eagerly via `import.meta.glob` inside `useGraphManagement.ts`. Each file exports a `SavedGraphState` JSON blob.

## Adding Example Graphs
1. Export a graph from the UI (download JSON).
2. Place the file into `graphs/` with a descriptive name (spaces allowed but avoid collisions).
3. On reload, it auto-appears in example graphs list (name derived from filename).

## Guidelines
* Keep file sizes modest (localStorage & initial bundle size concerns).
* Prefer vector assets (SVG) for icons.
* If adding large media, consider lazy loading instead of eager glob import.
