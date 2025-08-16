# Example Graph JSONs

These JSON files contain serialized `SavedGraphState` objects used as built‑in examples.

Loaded via:
```ts
const exampleGraphFiles = import.meta.glob('../assets/graphs/*.json', { eager: true });
```

## File Format (SavedGraphState)
```ts
interface SavedGraphState {
  name: string;
  nodes: Node[]; // Vue Flow node objects with data.alg, data.rawAlgorithm, etc.
  edges: Edge[]; // Vue Flow edges (type 'special')
  algPresets: AlgPreset[]; // Algorithm presets present when exported
  // (Optional future additions: viewport, metadata)
}
```

## Best Practices
* Keep minimal yet illustrative examples (show branching, confluence, mirrored branches).
* Avoid embedding secrets or PII (files are committed).
* Validate structure before committing (load in app or run persistence test).
