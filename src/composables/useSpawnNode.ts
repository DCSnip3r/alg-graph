import { Alg } from 'cubing/alg';
import type { Node, Edge } from '@vue-flow/core';

type Direction = 'u' | 'd' | 'l' | 'r';

export function useSpawnNode(
  algorithm: string,
  node: Node,
  source: Direction,
  target: Direction,
  nodeArray: Node[],
  edgeArray: Edge[]
): { newNode: Node } {

  const baseAlg = new Alg(node.data.alg || '');
  const newAlg = baseAlg.concat(new Alg(algorithm));
  const simplifiedNewAlg = newAlg.experimentalSimplify({ cancel: true }).toString();

  const newNode: Node = {
    ...node,
    id: simplifiedNewAlg,
    data: {
      ...node.data,
      label: simplifiedNewAlg,
      alg: simplifiedNewAlg,
    },
    position: {
      x: node.position.x + 0, // Adjust position as needed
      y: node.position.y - 300, // Adjust position as needed
    },
  };

  const newEdge: Edge = {
    id: `e${node.id}-${newNode.id}`,
    source: node.id,
    target: newNode.id,
    sourceHandle: `source-${source}`,
    targetHandle: `target-${target}`,
    type: 'default', // Adjust type as needed
    label: algorithm,
    animated: true,
  };

  nodeArray.push(newNode);
  edgeArray.push(newEdge);

  return { newNode };
}