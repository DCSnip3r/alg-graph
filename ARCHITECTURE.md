# Project Architecture Overview

This document gives a high‑level mental model of the Cube Algorithm Graph Explorer so a fresh contributor (or AI agent) can orient quickly.

## Core Idea
Users build and explore transformation graphs of 3x3x3 cube algorithms. Each node represents a cube state reached by applying an accumulated algorithm string. Directed edges carry the incremental ("raw") algorithm appended when connecting two nodes. Graph data (nodes, edges, presets) can be saved, loaded, imported, exported, and visualized interactively.

## Layered Structure
| Layer | Responsibility | Key Folders |
|-------|----------------|-------------|
| UI Components | Render graph, menus, interactive nodes/edges | `src/components/**` |
| Domain Logic (Composable Hooks) | Encapsulate reusable logic (nodes, edges, graph persistence, drag & drop, confluence, algorithms) | `src/composables` |
| State (Pinia Stores) | Persist app and user data (presets, saved graphs, display settings) | `src/stores` |
| Types / Models | Shared TypeScript interfaces | `src/types` |
| Assets | Static JSON example graphs & images | `src/assets` |
| Tests | Unit tests (Vitest) targeting composables | `tests/**` |

## Data Flow (Happy Path)
1. User drags an algorithm chip / drops onto canvas (Drag & Drop composable) → new node(s) created.
2. User connects nodes (Vue Flow `onConnect`) → edge created; target node's accumulated `alg` recalculated (concatenate + simplify).
3. Node algorithm updated → confluence check runs (compare cube state patterns) → optional repositioning / merging logic (in `useNodeConfluence`).
4. User saves graph → `useGraphPersistence.saveGraphToStore` delegates to `savedGraphsStore` (localStorage + manifest).
5. User loads / imports graph → nodes/edges/presets replaced; `nodeIdCounter` recalibrated.
6. Example graphs preloaded via Vite `import.meta.glob` allowing quick bootstrap.

## Key Concepts
* **Raw Algorithm (edge)**: Algorithm string a user wants to append when traversing from parent to child.
* **Accumulated Algorithm (node)**: Full algorithm sequence from the root (Solved) to the node.
* **Confluence**: Two different accumulated algorithms that produce identical cube states (optionally considering AUF adjustments) — used to detect equivalence.
* **Confluence Edge**: A lightweight, non‑propagating edge visually linking the parent of a newly updated node to an existing confluent node. Dashed, muted styling; never triggers target recomputation; optional via Display Settings.
* **Graph Persistence**: LocalStorage serialization of nodes, edges, and algorithm presets under a manifest.

## Important Files
* `src/components/AlgGraph.vue` – Orchestrates Vue Flow graph, wiring events to composables & stores.
* `src/composables/useNodeManagement.ts` – Node CRUD, id generation, collapse/expand, tree generation helpers.
* `src/composables/useEdgeManagement.ts` – Edge algorithm editing / updates (see folder README for details).
* `src/composables/useGraphPersistence.ts` – Pure data persistence logic (save/load/import/export helpers).
* `src/composables/useGraphManagement.ts` – UI‑facing orchestration of persistence events & example graphs.
* `src/composables/useAlg.ts` – Algorithm utilities (parse, invert, mirror, expand doubles, detect setup moves, confluence test).
* `src/stores/*` – Pinia stores: presets, display settings, saved graph manifest & storage adapter.
* `src/types/*` – Shared interfaces (`SavedGraphState`, `AlgPreset`, node/edge related types).

## Event / Emit Contract Highlights
| Emitter | Event | Payload | Purpose |
|---------|-------|---------|---------|
| MenuOverlay → AlgGraph | `save-graph-request` | graphName:string | Trigger persistence save |
| MenuOverlay → AlgGraph | `load-graph-request` | {nodes,edges} | Apply stored graph |
| MenuOverlay → AlgGraph | `load-graph-from-file-request` | SavedGraphState | Import external file |
| TwistyNode → AlgGraph | `set-target-handle` | {nodeId,newTargetHandleId} | Update target connection handle |
| TwistyNode → AlgGraph | `delete-node` | nodeId | Remove node & incident edges |
| TwistyNode → AlgGraph | `toggle-collapse` | nodeId | Collapse / expand node bounding box |
| SpecialEdge → AlgGraph | `update:algorithm` | {edgeId,newAlg} | Update edge label & recompute downstream |

## Extending the System
1. Add a new algorithm transformation: place helper in `useAlg.ts`; expose via return object.
2. Introduce new persisted metadata: extend interfaces in `src/types`, update `useGraphPersistence` serialization before UI wiring.
3. Add visualization customization: create Pinia store (or extend `displaySettingsStore`) and inject into relevant composables.
4. Add batch operations on nodes: implement pure logic in a new composable `useBatchOps.ts`; call from `AlgGraph.vue` or a submenu component.

## Testing Strategy
Tests focus on composables (pure logic) using Vitest: algorithm manipulation, node/edge management, persistence, confluence. Keep UI thin so logic remains testable headlessly.

## Performance Considerations
* Confluence checks are async (puzzle state comparisons). Defer heavy checks or debounce if adding bulk operations.
* LocalStorage serialization is synchronous; large graphs may warrant chunking or compression in future.

## Future Ideas
* Graph diffing & merge.
* Server sync / shareable graph links.
* Visual clustering of confluent states.
* Undo/redo stack via command pattern composable.
* Toggle visibility / filtering of confluence edges.
* Batch re‑evaluation of confluence after large imports.

See subfolder READMEs for deeper per‑module design notes.

## Confluence Edges
When a node's accumulated algorithm becomes confluent with an existing node (detected through `useAlg().isConfluent`), optional side‑effects occur:

1. Reposition: If `repositionOnConfluence` is enabled, the updated node is moved to the confluent node's coordinates.
2. Confluence Edge Creation: If `createConfluenceEdges` is enabled, a dashed "confluence" edge (`type: 'confluence'`) is added from the parent (source of the most recent raw segment) to the confluent existing node. Duplicate edges with identical source/target/label are suppressed.
3. Metadata: The target node tracks inbound confluence count & AUF variants (`data.confluenceInbound = { count, variants[] }`) driving a ∞ badge (with count) on the node.
4. Variants: If `isConfluent` returns a string (AUF-adjusted variant), it's stored per edge in `edge.data.aufVariant` and aggregated in the node metadata.

Confluence edges are purely informational: they never trigger algorithm recomputation, are not editable, and serialize alongside normal edges (distinguished only by `type` & data flags).
