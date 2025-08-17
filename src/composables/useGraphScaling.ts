import type { GraphNode } from '@vue-flow/core';

/**
 * Uniformly scale all node positions about an origin (default 0,0).
 * Edges auto-update visually via Vue Flow after node changes.
 */
export function useGraphScaling(setNodes: (updater: any) => void) {
	function scaleAll(factor: number, origin: { x: number; y: number } = { x: 0, y: 0 }) {
		if (!factor || factor <= 0 || !isFinite(factor)) return;
		setNodes((curr: GraphNode[]) => curr.map(n => {
			const { x = 0, y = 0 } = n.position || { x: 0, y: 0 };
			const newX = origin.x + (x - origin.x) * factor;
			const newY = origin.y + (y - origin.y) * factor;
			if (newX === x && newY === y) return n;
			return { ...n, position: { ...n.position, x: newX, y: newY } };
		}));
	}
	return { scaleAll };
}

export type UseGraphScalingReturn = ReturnType<typeof useGraphScaling>;
