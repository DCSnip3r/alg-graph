# Tests Overview

Unit tests (Vitest) target composables—the highest value pure logic layer.

## Philosophy
* Treat composables like micro-libraries: deterministic inputs → expected outputs.
* Isolate side effects (localStorage, dynamic imports) behind mocks.

## Coverage Focus
* Algorithm utilities (parsing, inversion, mirroring, setup detection, confluence logic) – correctness & edge cases.
* Node & edge management – id sequencing, collapse logic, branch generation, algorithm propagation.
* Persistence – serialization integrity, manifest updates, id recalibration.

## Test Structure
* `composables/*.spec.ts` – One spec file per composable mirroring file name.

## Adding Tests
1. Create `tests/composables/<name>.spec.ts`.
2. Import composable, inject mocks for callbacks (`addNodes`, `updateNodeData`, etc.).
3. Write minimal happy path + at least one edge case.

## Future Enhancements
* Snapshot tests for SavedGraphState exports.
* Performance tests around confluence detection.
* Property-based tests for algorithm transformations.
