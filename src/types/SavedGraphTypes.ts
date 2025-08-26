import type { Edge } from '@vue-flow/core';
import type { AlgPreset } from './AlgPresetTypes';

export interface SavedGraphManifest {
  name: string;
  savedAt: string; // ISO string date
}

// Define the keys that should be persisted - single source of truth
export const PERSISTABLE_DISPLAY_SETTING_KEYS = ['twistyNodeSize', 'showColorizedEdgeLabels'] as const;

// Automatically derive the interface from the keys array - no duplication!
export type PersistableDisplaySettings = {
  [K in typeof PERSISTABLE_DISPLAY_SETTING_KEYS[number]]?: 
    K extends 'twistyNodeSize' ? number :
    K extends 'showColorizedEdgeLabels' ? boolean :
    never;
};

export interface SavedGraphState {
  name: string;
  nodes: Node[];
  edges: Edge[];
  algPresets: AlgPreset[];
  displaySettings?: PersistableDisplaySettings;
  // You could add viewport info here too if needed:
  // viewport: { x: number; y: number; zoom: number };
}
