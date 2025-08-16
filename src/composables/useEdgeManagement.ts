import type { Edge } from '@vue-flow/core';
import { Alg } from 'cubing/alg';
import { useNodeConfluence } from './useNodeConfluence';

export function useEdgeManagement({ edges, nodes, findNode, updateNodeData, updateNodePosition, addEdges }: any) {
  const { checkAndRepositionNode } = useNodeConfluence({ findNode, updateNodePosition, addEdges, edges, updateNodeData });

  const handleEdgeAlgorithmUpdate = async ({ edgeId, newAlgorithm }: { edgeId: string, newAlgorithm: string }) => {
    const edge = edges.value.find((e: Edge) => e.id === edgeId);
  if (!edge) return;
  if (edge.type === 'confluence') return; // confluence edges are informational only

    edge.data = { algorithm: newAlgorithm };
    edge.label = newAlgorithm;

    const sourceNode = findNode(edge.source);
    const targetNode = findNode(edge.target);

    if (sourceNode && targetNode && edge.targetHandle === targetNode.data.targetHandleId) {
      const sourceAlg = new Alg(sourceNode.data.alg || '');
      const edgeSegmentAlg = new Alg(newAlgorithm);
      const newTargetCombinedAlg = sourceAlg.concat(edgeSegmentAlg).experimentalSimplify({ cancel: true }).toString();

  updateNodeData(targetNode.id, { alg: newTargetCombinedAlg, label: newTargetCombinedAlg, rawAlgorithm: newAlgorithm });

	await checkAndRepositionNode(targetNode.id, nodes.value, { parentId: sourceNode.id, rawSegment: newAlgorithm, sourceHandle: edge.sourceHandle });
    }
  };

  return { handleEdgeAlgorithmUpdate };
}
