import type { Edge } from '@vue-flow/core';
import { Alg } from 'cubing/alg';
import { useNodeConfluence } from './useNodeConfluence';

export function useEdgeManagement({ edges, nodes, findNode, updateNodeData, updateNodePosition }: any) {
  const { checkAndRepositionNode } = useNodeConfluence({ findNode, updateNodePosition });

  const handleEdgeAlgorithmUpdate = async ({ edgeId, newAlgorithm }: { edgeId: string, newAlgorithm: string }) => {
    const edge = edges.value.find((e: Edge) => e.id === edgeId);
    if (!edge) return;

    edge.data = { algorithm: newAlgorithm };
    edge.label = newAlgorithm;

    const sourceNode = findNode(edge.source);
    const targetNode = findNode(edge.target);

    if (sourceNode && targetNode && edge.targetHandle === targetNode.data.targetHandleId) {
      const sourceAlg = new Alg(sourceNode.data.alg || '');
      const edgeSegmentAlg = new Alg(newAlgorithm);
      const newTargetCombinedAlg = sourceAlg.concat(edgeSegmentAlg).experimentalSimplify({ cancel: true }).toString();

      updateNodeData(targetNode.id, { alg: newTargetCombinedAlg, label: newTargetCombinedAlg, rawAlgorithm: newAlgorithm });
      
      await checkAndRepositionNode(targetNode.id, nodes.value);
    }
  };

  return { handleEdgeAlgorithmUpdate };
}
