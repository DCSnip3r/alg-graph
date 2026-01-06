import { useDisplaySettingsStore } from '../stores/displaySettingsStore.ts';
import { useAlg } from './useAlg';
import type { Node, Edge } from '@vue-flow/core';

interface UseNodeConfluenceArgs {
  findNode: (id: string) => Node | undefined;
  updateNodePosition: (id: string, position: { x: number, y: number }) => void;
  addEdges?: (edges: Edge[]) => void;
  edges?: { value: Edge[] };
  updateNodeData?: (id: string, data: any) => void;
  removeNodes?: (nodeIds: string[]) => void;
  setEdges?: (edges: Edge[]) => void;
}

export function useNodeConfluence({ findNode, updateNodePosition, addEdges, edges, updateNodeData, removeNodes, setEdges }: UseNodeConfluenceArgs) {
  const displaySettings = useDisplaySettingsStore();
  const { isConfluent } = useAlg();

  /**
   * Core check for confluence. Optionally repositions the node and/or creates a confluence edge.
   * Returns metadata about the first confluence detected, including whether the duplicate node was deleted.
   */
  const checkAndRepositionNode = async (updatedNodeId: string, allNodes: Node[], context?: { parentId?: string; rawSegment?: string; sourceHandle?: string }) => {
    const updatedNode = findNode(updatedNodeId);
    if (!updatedNode) return null;

    for (const existingNode of allNodes) {
      if (existingNode.id === updatedNodeId) continue;

      const confluenceResult = await isConfluent(updatedNode.data.alg, existingNode.data.alg);
      if (confluenceResult) {
        const aufVariant = confluenceResult === true ? 'exact' : typeof confluenceResult === 'string' ? confluenceResult : 'exact';
        
        // If delete duplicate is enabled, delete the newly created node and create confluence edge
        if (displaySettings.deleteDuplicateOnConfluence && removeNodes && context?.parentId && context?.rawSegment) {
          // Delete the duplicate node
          removeNodes([updatedNodeId]);
          
          // Remove edges connected to the deleted node
          if (setEdges && edges) {
            const remainingEdges = edges.value.filter((edge: Edge) => 
              edge.source !== updatedNodeId && edge.target !== updatedNodeId
            );
            setEdges(remainingEdges);
          }
          
          // Create confluence edge from parent to existing confluent node if enabled
          if (displaySettings.createConfluenceEdges && addEdges && edges) {
            const sourceId = context.parentId;
            const targetId = existingNode.id;
            const label = context.rawSegment;
            // Duplicate prevention
            const duplicate = edges.value.some(e => e.type === 'confluence' && e.source === sourceId && e.target === targetId && e.label === label);
            if (!duplicate) {
              const hash = label.replace(/[^A-Za-z0-9]/g, '-').slice(0, 24);
              const id = `ce-${sourceId}-${targetId}-${hash}`;
              const newEdge: Edge = {
                id,
                source: sourceId,
                target: targetId,
                sourceHandle: context.sourceHandle,
                targetHandle: existingNode.data?.targetHandleId || 'handle-b',
                label,
                type: 'confluence',
                data: { algorithm: label, confluence: true, aufVariant },
                animated: true,
                style: { strokeDasharray: '4 4' },
              } as any;
              addEdges([newEdge]);
              
              // Update inbound confluence metadata on target node
              if (updateNodeData) {
                const inbound = (existingNode.data.confluenceInbound || { count: 0, variants: [] });
                const variants = [...new Set([...inbound.variants, aufVariant])];
                updateNodeData(targetId, { confluenceInbound: { count: inbound.count + 1, variants } });
              }
            }
          }
          
          return { confluentWithId: existingNode.id, aufVariant, nodeDeleted: true };
        }
        
        // Original behavior: reposition if enabled
        if (displaySettings.repositionOnConfluence) {
          // First snap to existing node position (preserve previous behavior for tests / expectations)
          updateNodePosition(updatedNodeId, existingNode.position);
        }

        // Create confluence edge if enabled & we have enough context
  if (displaySettings.createConfluenceEdges && addEdges && edges && context?.parentId && context?.rawSegment) {
          const sourceId = context.parentId;
          const targetId = existingNode.id; // Confluent existing node
          const label = context.rawSegment;
          // Duplicate prevention
            const duplicate = edges.value.some(e => e.type === 'confluence' && e.source === sourceId && e.target === targetId && e.label === label);
          if (!duplicate) {
            const hash = label.replace(/[^A-Za-z0-9]/g, '-').slice(0, 24);
            const id = `ce-${sourceId}-${targetId}-${hash}`;
            const newEdge: Edge = {
              id,
              source: sourceId,
              target: targetId,
              sourceHandle: context.sourceHandle, // ensure same originating handle as triggering edge
              targetHandle: existingNode.data?.targetHandleId || 'handle-b',
              label,
              type: 'confluence',
              data: { algorithm: label, confluence: true, aufVariant },
              animated: true,
              style: { strokeDasharray: '4 4' },
            } as any;
            addEdges([newEdge]);
            // If we ALSO repositioned and kept both nodes, nudge updated node so it doesn't perfectly overlap.
            if (displaySettings.repositionOnConfluence && updatedNodeId !== existingNode.id) {
              const OFFSET = 32; // pixels
              updateNodePosition(updatedNodeId, { x: existingNode.position.x + OFFSET, y: existingNode.position.y + OFFSET });
            }
            // Update inbound confluence metadata on target node
            if (updateNodeData) {
              // Update inbound metadata on confluent existing node
              const inbound = (existingNode.data.confluenceInbound || { count: 0, variants: [] });
              const variants = [...new Set([...inbound.variants, aufVariant])];
              updateNodeData(targetId, { confluenceInbound: { count: inbound.count + 1, variants } });
              // Also flag the updated node itself so user sees immediate badge feedback
              // Direct confluent flag removed (badge feature removed)
            }
          }
        }
        return { confluentWithId: existingNode.id, aufVariant, nodeDeleted: false };
      }
    }
    return null;
  };

  return { checkAndRepositionNode };
}
