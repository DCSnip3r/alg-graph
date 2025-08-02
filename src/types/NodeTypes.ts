import type { XYPosition } from '@vue-flow/core';

export interface NodeData {
  label: string;
  alg: string;
  rawAlgorithm: string;
  targetHandleId: string;
  collapsed: boolean; // Indicates if the node is collapsed
}

export interface NodeStyle {
  borderColor?: string;
  borderWidth?: string;
  borderStyle?: string;
  borderRadius?: string;
}

export interface NodePosition extends XYPosition {
  x: number;
  y: number;
}
