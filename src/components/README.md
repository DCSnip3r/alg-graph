# Components Folder

Vue Single File Components. Keep them as thin as possible—delegate logic to composables.

## Key Components
* `AlgGraph.vue` – Central orchestrator hosting the Vue Flow graph and hooking composables to events.
* `TwistyNode.vue` – Renders a cube state node. Emits handle change, delete, collapse events. Displays accumulated algorithm.
* `SpecialEdge.vue` – Custom edge with algorithm label; emits updates that trigger re-evaluation of downstream node.
* `MenuOverlay.vue` – Top-level UI overlay aggregating submenus (save/load, algorithm presets, display settings, examples).
* `submenus/*.vue` – Focused UI panels for specific feature clusters.
* `shared/CollapsibleHeader.vue` – Common UI pattern for collapsible sections.

## Interaction Principles
* Downstream calculations (alg accumulation, confluence) belong in composables; components only emit user intent.
* Avoid direct localStorage or complex algorithm manipulation inside components.
* One-way data flow: props in, events out.

## Adding a New Component
1. Define minimal props/events contract.
2. Offload stateful logic to a dedicated composable if reused or complex.
3. Add unit tests only if the component contains logic (else rely on composable tests).
