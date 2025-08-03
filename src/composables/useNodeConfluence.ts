import { useDisplaySettingsStore } from '../stores/displaySettingsStore.ts';
import { useAlg } from './useAlg';
import type { Node } from '@vue-flow/core';

export function useNodeConfluence({ findNode, updateNodePosition }: { findNode: (id: string) => Node | undefined, updateNodePosition: (id: string, position: { x: number, y: number }) => void }) {
  const displaySettings = useDisplaySettingsStore();
  const { isConfluent } = useAlg();

  const checkAndRepositionNode = async (updatedNodeId: string, allNodes: Node[]) => {
    if (!displaySettings.repositionOnConfluence) {
      return;
    }

    const updatedNode = findNode(updatedNodeId);
    if (!updatedNode) {
      return;
    }

    for (const existingNode of allNodes) {
      if (existingNode.id === updatedNodeId) {
        continue;
      }

      const confluenceResult = await isConfluent(updatedNode.data.alg, existingNode.data.alg);
      if (confluenceResult) {
        updateNodePosition(updatedNodeId, existingNode.position);
        break; 
      }
    }
  };

  return {
    checkAndRepositionNode,
  };
}
