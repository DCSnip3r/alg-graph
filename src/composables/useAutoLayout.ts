// @ts-ignore - dagre has no bundled types; rely on implicit any where necessary
import dagre from 'dagre';
import type { GraphNode, GraphEdge } from '@vue-flow/core';

/**
 * Auto layout helper using dagre. Keeps concerns outside components for testability.
 */
export interface AutoLayoutOptions {
  direction?: 'TB' | 'BT' | 'LR' | 'RL';
  nodeSep?: number; // horizontal gap for TB/BT (or vertical for LR/RL)
  rankSep?: number; // vertical gap for TB/BT (or horizontal for LR/RL)
  marginX?: number;
  marginY?: number;
  align?: 'UL' | 'UR' | 'DL' | 'DR';
  ranker?: 'network-simplex' | 'tight-tree' | 'longest-path';
}

export function useAutoLayout(
  nodesRef: any,
  edgesRef: any,
  setNodes: (updater: any) => void,
  fit?: () => void,
) {
  function layout(options: AutoLayoutOptions = {}) {
    const {
      direction = 'TB',
      nodeSep = 60,
      rankSep = 140,
      marginX = 20,
      marginY = 20,
      align,
      ranker = 'network-simplex',
    } = options;

  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: direction, nodesep: nodeSep, ranksep: rankSep, marginx: marginX, marginy: marginY, align, ranker });
    g.setDefaultEdgeLabel(() => ({}));

    const nodes: GraphNode[] = nodesRef.value;
    const edges: GraphEdge[] = edgesRef.value;

    // Provide fallback dimensions; Vue Flow may not have measured yet.
    nodes.forEach((n) => {
      const width = (n.dimensions && n.dimensions.width) || 180;
      const height = (n.dimensions && n.dimensions.height) || 80;
      g.setNode(n.id, { width, height });
    });
    edges.forEach((e) => {
      if (e.source && e.target) g.setEdge(e.source, e.target);
    });

    dagre.layout(g);

    // Center anchor: dagre positions are top-left; Vue Flow expects top-left (so direct assign ok).
    const nodePositionMap: Record<string, { x: number; y: number }> = {};
  g.nodes().forEach((id: string) => {
      const n = g.node(id);
      nodePositionMap[id] = { x: n.x - n.width / 2, y: n.y - n.height / 2 };
    });

    setNodes((curr: GraphNode[]) => curr.map((n) => {
      const pos = nodePositionMap[n.id];
      return pos ? { ...n, position: { x: pos.x, y: pos.y } } : n;
    }));

    if (fit) setTimeout(() => fit(), 0);
  }

  return { layout };
}
