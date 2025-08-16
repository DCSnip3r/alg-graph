# Shared Types

Central definitions used across composables & stores.

## Key Interfaces
* `SavedGraphManifest` – Minimal listing entry for a saved graph.
* `SavedGraphState` – Full serialized state (nodes, edges, algorithm presets).
* `AlgPreset` (in `AlgPresetTypes.ts`) – Structure for stored algorithm preset items.
* `NodeTypes.ts` – (Assumed) Node-related custom type augmentations.

## Guidelines
* Keep types narrow—prefer composition over large monolithic interfaces.
* If runtime validation needed, introduce lightweight schema (e.g., Zod) but keep optional to avoid bundle bloat unless complexity grows.
