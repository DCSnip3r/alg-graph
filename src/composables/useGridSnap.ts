import type { GraphNode } from '@vue-flow/core';

/** Simple grid snapping utility */
export function useGridSnap(setNodes: (updater: any) => void) {
  function snapAll(gridSize: number) {
    if (!gridSize || gridSize <= 0) return;
    setNodes((curr: GraphNode[]) => curr.map(n => {
      const { x = 0, y = 0 } = n.position || { x: 0, y: 0 };
      const snappedX = Math.round(x / gridSize) * gridSize;
      const snappedY = Math.round(y / gridSize) * gridSize;
      if (snappedX === x && snappedY === y) return n;
      return { ...n, position: { ...n.position, x: snappedX, y: snappedY } };
    }));
  }
  return { snapAll };
}
