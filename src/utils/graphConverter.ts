import type { Node, Edge } from '@vue-flow/core';
import { useAlgPresetsStore } from '../stores/algPresetsStore';

export interface ForceGraphNode {
  id: string;
  name: string;
  alg?: string;
  val?: number;
  collapsed?: boolean;
}

export interface ForceGraphLink {
  source: string;
  target: string;
  label?: string;
  color?: string;
}

export interface ForceGraphData {
  nodes: ForceGraphNode[];
  links: ForceGraphLink[];
}

/**
 * Converts Vue Flow graph data to vue-force-graph format
 */
export function convertToForceGraphData(
  nodes: Node[],
  edges: Edge[]
): ForceGraphData {
  const algPresetsStore = useAlgPresetsStore();

  // Helper function to get color for an algorithm
  const getColorForAlgorithm = (algorithm: string): string => {
    const preset = algPresetsStore.presets.find(p => p.algorithm === algorithm);
    return preset?.color || '#999999'; // Default gray if no match
  };

  // Convert nodes
  const forceNodes: ForceGraphNode[] = nodes.map((node) => ({
    id: node.id,
    name: node.data?.label || node.id,
    alg: node.data?.alg || '',
    val: 10, // Size of the node
    collapsed: node.data?.collapsed || false,
  }));

  // Convert edges to links
  const forceLinks: ForceGraphLink[] = edges.map((edge) => {
    const algorithm = edge.data?.algorithm || '';
    return {
      source: edge.source,
      target: edge.target,
      label: String(algorithm),
      color: getColorForAlgorithm(String(algorithm)),
    };
  });

  return {
    nodes: forceNodes,
    links: forceLinks,
  };
}
