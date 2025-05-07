import type { XYPosition } from '@vue-flow/core';

export interface NodeData {
  label: string;
  alg: string;
  rawAlgorithm: string;
  targetHandleId: string;
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
