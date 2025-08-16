# Composables (Domain Logic Layer)

Encapsulate cohesive, testable logic slices. Each file returns a plain object API. Avoid implicit side effects beyond the scoped concerns described below.

## Inventory & Responsibility
| File | Responsibility | Key Exports |
|------|----------------|-------------|
| `useAlg.ts` | Algorithm parsing, inversion, mirroring, expansion, setup detection, confluence test | `mirrorAlg`, `invertAlg`, `expandDoubleMoves`, `detectSetupMoves`, `isConfluent`, etc. |
| `useCollapsible.ts` | UI state helper for collapsible headers | toggle / state refs |
| `useColorUtils.ts` | (Assumed) Color manipulation & mapping helpers | color functions |
| `useDragAndDrop.ts` | Convert screen coords to flow coords & create nodes on drop | `onDragOver`, `onDrop` |
| `useEdgeManagement.ts` | Update edge algorithms & propagate changes to target nodes | `handleEdgeAlgorithmUpdate` |
| `useGraphManagement.ts` | UI-facing orchestration for saving/loading & example graphs | handlers: save/load/delete/download/upload |
| `useGraphPersistence.ts` | Pure persistence (serialize/deserialize) & id recalibration | `saveGraphToStore`, `applyGraphState`, `importGraphFromFile` |
| `useNodeConfluence.ts` | Detect confluent nodes, optional reposition, create dashed informational confluence edges, aggregate inbound variant metadata | `checkAndRepositionNode` |
| `useNodeManagement.ts` | Node id management, creation, collapse/expand, branch generation | `getNextNodeId`, `resetNodes`, `generateAlgTree` |

## Design Patterns
* Keep composables **pure-ish**: UI / DOM only via passed callbacks or Vue Flow APIs.
* Shared mutation passes through function parameters (e.g., `updateNodeData`, `setNodes`) injected by caller (`AlgGraph.vue`).
* Avoid circular store imports by late/dynamic import only when needed (see `isConfluent`).

## Adding a New Composable
1. Define contract (inputs/outputs, side effects) in header comment.
2. Provide narrow, intention-based method names.
3. Export only what the UI needs—hide internals.
4. Add a spec under `tests/composables`. Mock stores if necessary.

## Error Handling
* Return booleans or throw for unexpected states; UI-layer decides how to notify.
* Console logging acceptable internally; prefer not to alert inside composables (alerts belong to UI orchestration like `useGraphManagement`).
