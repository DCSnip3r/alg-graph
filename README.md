# Cube Algorithm Graph Explorer

Explore 3x3x3 cube algorithms visually with an interactive, graph-based UI. Built with Vue 3, TypeScript, Vite, Vue Flow for graph rendering, and cubing.js for algorithm parsing / cube visualization.

## Getting Started

## Live Site
Deployed on GitHub Pages: **https://dcsnip3r.github.io/alg-graph/**

### Prerequisites
- Install [pnpm](https://pnpm.io/installation) if you don't already have it.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/alg-graph.git
   cd alg-graph
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```

### Development
To start the development server:
```bash
pnpm run dev
```
This will launch the application and provide a local development server. The default URL is typically `http://localhost:5173`.

### Build
To build the project for production:
```bash
pnpm run build
```

### Preview
To preview the production build:
```bash
pnpm run preview
```

## Features
- Visualize cube algorithms as a directed graph (nodes = alg states / variants, edges = transitions / appended moves).
- Drag & drop layout with zoom / pan (powered by Vue Flow).
- Algorithm parsing, normalization, and cube state display (cubing.js).
- Save & load graphs to localStorage or export/import as JSON files.
- Confluence detection (with optional AUF variants) including:
   - Dashed informational confluence edges (toggleable).
   - Node badges summarizing inbound confluent variants.
- Preset graphs (e.g., Sune chain) for inspiration.

## Tech Stack
- Vue 3 + TypeScript + Vite
- @vue-flow/core for graph canvas & interaction
- cubing.js (alg parsing, TwistyPlayer component)
- Pinia for state management

## Acknowledgments
Huge thanks to the maintainers of these foundational libraries:
- [cubing.js](https://github.com/cubing/cubing.js) for robust cube algorithm parsing and visualization utilities.
- [Vue Flow](https://vueflow.dev/) for the flexible, extensible graph interaction layer.

Your work made this project dramatically simpler and more fun to build.

## License
MIT
