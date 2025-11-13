import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Node, Edge } from '@vue-flow/core';

export const useGraphDataStore = defineStore('graphData', () => {
  const nodes = ref<Node[]>([]);
  const edges = ref<Edge[]>([]);

  function setGraphData(newNodes: Node[], newEdges: Edge[]) {
    nodes.value = newNodes;
    edges.value = newEdges;
  }

  function clearGraphData() {
    nodes.value = [];
    edges.value = [];
  }

  return {
    nodes,
    edges,
    setGraphData,
    clearGraphData,
  };
});
