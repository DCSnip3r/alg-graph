# Stores (Pinia)

Central reactive state & persistence boundary.

## Present Stores
* `algPresetsStore.ts` – Collection of user-defined algorithm presets (deep-cloned into saved graphs).
* `displaySettingsStore.ts` – Flags controlling how algorithms / confluence are interpreted (e.g., AUF matching toggle).
* `savedGraphsStore.ts` – Manifest + CRUD against LocalStorage for serialized graphs; deep clones to avoid reference leakage.

## Design Principles
* Keep stores **data-centric**: no heavy algorithm logic.
* Deep clone when persisting to detach reactive references (`JSON.parse(JSON.stringify(...))`).
* Manifest pattern: separate list of names + timestamp from full objects ensures quick listing and lazy retrieval.

## Extending
1. Add new field to persisted graph: update `SavedGraphState` in `types`, adjust write/read in `savedGraphsStore` & `useGraphPersistence`.
2. New store: create file, define interface, register in components/composables by importing and invoking inside setup function.

## Persistence Notes
* Key prefix: `vueFlowGraph_` + name.
* Manifest key: `vueFlowGraphsList` (stores array of `{name, savedAt}`).
