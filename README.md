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
- Chunk Explorer: arrange named sequences, their inverses, and optional interrupted sequences; identify PLLs on the resulting graph.

### Chunk Explorer

Open **Algorithms → Autogenerate → Chunk Explorer**. Edit the chunks or add
one of your saved algorithms. The default two chunks demonstrate both orders
of the T/Y relationship. Each step branches over every chunk and its inverse;
repeats are allowed. Each path is kept separately even when cube states match.
Edge labels show the applied moves, and nodes show the chunk used, the
cancelled accumulated algorithm, and the PLL name or “Not a PLL”.

Optionally include interruptions: at each boundary between expanded moves of
an outer chunk, insert one complete chunk or inverse. An interrupted chunk is
one step, with its outer name, split pieces, and inserted sequence shown on the
node. This does not search nested interruptions or automatically extract
chunks from algorithms. Mirroring is not generated automatically; the
existing algorithm mirror button can create a preset to add.

PLL identification compares cube states to 21 familiar reference algorithms
up to pre/post AUF and whole-cube rotations, including a final rotation of
the cube. “Solved” includes a state solved up to AUF. References are based on
[this PLL collection](https://github.com/alonswartz/cube/tree/c6d9eee0e2af1a20a921b1697e686a60d964d79b/src/algs).
The explorer starts from a new solved node, adds to the current graph without
deleting nodes, and limits generation to 200 nodes and 40 expanded moves per
chunk. Larger interruption sets may require reducing the step count to one.
Labels describe the generated path and are hidden if that node's algorithm
is subsequently changed.

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
