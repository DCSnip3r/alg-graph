import { Alg } from 'cubing/alg';
import type { Node, Edge } from '@vue-flow/core';

type Direction = 'u' | 'd' | 'l' | 'r';

export function useSpawnMirrorNodes(
  algorithm: string,
  node: Node,
  nodeArray: Node[],
  edgeArray: Edge[]
): { newNode: Node; newNodeI: Node } {
  const inputAlg = new Alg(algorithm);
  const baseAlg = new Alg(node.data.alg || '');
  const newAlg = baseAlg.concat(inputAlg);
  const newAlgI = baseAlg.concat(inputAlg.invert());

  const simplifiedNewAlg = newAlg.experimentalSimplify({ cancel: true }).toString();
  const simplifiedNewAlgI = newAlgI.experimentalSimplify({ cancel: true }).toString();
  
  const newNode: Node = {
    ...node,
    id: simplifiedNewAlg,
    data: {
      ...node.data,
      label: simplifiedNewAlg,
      alg: simplifiedNewAlg,
    },
    position: {
      x: node.position.x + 300, // Adjust position as needed
      y: node.position.y, // Adjust position as needed
    },
  };
  const newNodeI: Node = {
    ...node,
    id: simplifiedNewAlgI,
    data: {
      ...node.data,
      label: simplifiedNewAlgI,
      alg: simplifiedNewAlgI,
    },
    position: {
      x: node.position.x - 300, // Adjust position as needed
      y: node.position.y, // Adjust position as needed
    },
  };

  const newEdge: Edge = {
    id: `e${node.id}-${newNode.id}`,
    source: node.id,
    target: newNode.id,
    sourceHandle: `source-r`,
    targetHandle: `target-l`,
    type: 'default', // Adjust type as needed
    label: inputAlg.toString(),
    animated: true,
  };
  const newEdgeI: Edge = {
    id: `e${node.id}-${newNodeI.id}`,
    source: node.id,
    target: newNodeI.id,
    sourceHandle: `source-l`,
    targetHandle: `target-r`,
    type: 'default', // Adjust type as needed
    label: inputAlg.invert().toString(),
    animated: true,
  };

  nodeArray.push(newNode, newNodeI);
  edgeArray.push(newEdge, newEdgeI);

  return { newNode, newNodeI };

}