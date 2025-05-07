import type { Edge } from '@vue-flow/core';
import type { AlgPreset } from './AlgPresetTypes';

export interface SavedGraphManifest {
  name: string;
  savedAt: string; // ISO string date
}

export interface SavedGraphState {
  name: string;
  nodes: Node[];
  edges: Edge[];
  algPresets: AlgPreset[];
  // You could add viewport info here too if needed:
  // viewport: { x: number; y: number; zoom: number };
}
