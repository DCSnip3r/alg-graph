import { Alg } from 'cubing/alg';
import type { Node, Edge } from '@vue-flow/core';

type Direction = 'u' | 'd' | 'l' | 'r';

export function useSpawn2Nodes(
  alg1: string,
  alg2: string,
  node: Node,
  nodeArray: Node[],
  edgeArray: Edge[]
): { newNode1: Node; newNode2: Node } {
  const baseAlg = new Alg(node.data.alg || '');
  const newAlg1 = baseAlg.concat(new Alg(alg1));
  const newAlg2 = baseAlg.concat(new Alg(alg2));

  const simplifiedNewAlg1 = newAlg1.experimentalSimplify({ cancel: true }).toString();
  const simplifiedNewAlg2 = newAlg2.experimentalSimplify({ cancel: true }).toString();
  
  const newNode1: Node = {
    ...node,
    id: simplifiedNewAlg1,
    data: {
      ...node.data,
      label: simplifiedNewAlg1,
      alg: simplifiedNewAlg1,
    },
    position: {
      x: node.position.x + 300, // Adjust position as needed
      y: node.position.y, // Adjust position as needed
    },
  };
  const newNode2: Node = {
    ...node,
    id: simplifiedNewAlg2,
    data: {
      ...node.data,
      label: simplifiedNewAlg2,
      alg: simplifiedNewAlg2,
    },
    position: {
      x: node.position.x - 300, // Adjust position as needed
      y: node.position.y, // Adjust position as needed
    },
  };

  const newEdge1: Edge = {
    id: `e${node.id}-${newNode1.id}`,
    source: node.id,
    target: newNode1.id,
    sourceHandle: `source-r`,
    targetHandle: `target-l`,
    type: 'default', // Adjust type as needed
    label: new Alg(alg1).toString(),
    animated: true,
  };
  const newEdge2: Edge = {
    id: `e${node.id}-${newNode2.id}`,
    source: node.id,
    target: newNode2.id,
    sourceHandle: `source-l`,
    targetHandle: `target-r`,
    type: 'default', // Adjust type as needed
    label: new Alg(alg2).toString(),
    animated: true,
  };

  nodeArray.push(newNode1, newNode2);
  edgeArray.push(newEdge1, newEdge2);

  return { newNode1, newNode2 };

}