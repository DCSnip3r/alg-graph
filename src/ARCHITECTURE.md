# Src Folder Overview

Entrypoint application code. Organizes UI, logic, state, assets, and types.

## Composition API Philosophy
All domain logic lives in composables returning a minimal, explicit API surface. Components import only what they use. Stores remain thin, providing persistence & reactive shared state; they never own complex business procedures (those stay in composables so they remain testable and reusable).

## Execution Order at Runtime
1. `main.ts` mounts Vue, registers Pinia, loads global styles.
2. `App.vue` renders primary layout (delegates to `AlgGraph.vue`).
3. `AlgGraph.vue` initializes Vue Flow, wires events to composables.
4. Composables subscribe / expose operations; stores furnish initial saved graphs & presets.
5. User actions produce graph mutations (nodes/edges) & persistence side effects.

## Subfolder Summaries
* `assets/` – Static resources (JSON example graphs, icons).
* `components/` – Presentational / container Vue SFCs (graph canvas, overlay menus, nodes & edges, submenus, shared UI pieces).
* `composables/` – Functional logic slices (algorithm utilities, node & edge mgmt, persistence, DnD, confluence, graph mgmt facade, color utils, collapsible headers).
* `stores/` – Pinia stores: algorithm presets, display settings, saved graphs.
* `types/` – Shared interfaces & type aliases.
* `style.css` – Global base styles.

Refer to each subfolder README for file‑level purpose & extension guidelines.
