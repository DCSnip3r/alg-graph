import { Alg } from 'cubing/alg';
import type { Node, Edge, XYPosition } from '@vue-flow/core';

export function useSpawnNode(
  edgeAlgorithm: string, 
  parentNode: Node | null, // Allow parentNode to be potentially null
  newNodeId: string,
  sourceHandleId: string, 
  offset: XYPosition,
): { newNode: Node; newEdge: Edge } | null { // Return type can now be null

  if (!parentNode) {
    console.error(`useSpawnNode: parentNode is null. Cannot spawn node with id ${newNodeId} from a null parent.`);
    return null;
  }
  
  // Ensure parentNode.data and parentNode.position exist, though type Node should guarantee this
  // This is more for runtime defensiveness if somehow a malformed Node object is passed.
  if (!parentNode.data || !parentNode.position) {
    console.error(`useSpawnNode: parentNode (id: ${parentNode.id}) is missing 'data' or 'position' properties.`);
    return null;
  }

  const baseAlg = new Alg(parentNode.data.alg || '');
  const currentEdgeAlg = new Alg(edgeAlgorithm); 
  const newNodeCombinedAlg = baseAlg.concat(currentEdgeAlg);
  const simplifiedNewNodeAlg = newNodeCombinedAlg.experimentalSimplify({ cancel: true }).toString();

  const defaultNewNodeTargetHandleId = 'handle-b'; // Default target is bottom

  const newNode: Node = {
    id: newNodeId,
    type: parentNode.type, 
    position: {
      x: parentNode.position.x + offset.x,
      y: parentNode.position.y + offset.y,
    },
    data: {
      label: simplifiedNewNodeAlg || "New Node", 
      alg: simplifiedNewNodeAlg, 
      rawAlgorithm: edgeAlgorithm, 
      targetHandleId: defaultNewNodeTargetHandleId, 
    },
    style: { 
      borderColor: '#ffffff',
      borderWidth: '8px',
      borderStyle: 'solid',
      borderRadius: '4px',
    },
  };

  const newEdge: Edge = {
    id: `e${parentNode.id}-${newNode.id}`,
    source: parentNode.id,
    target: newNode.id,
    sourceHandle: sourceHandleId,
    targetHandle: defaultNewNodeTargetHandleId, 
    type: 'special',
    label: edgeAlgorithm, 
    data: { algorithm: edgeAlgorithm },
    animated: true,
  };

  return { newNode, newEdge };
}