<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { VueFlow, useVueFlow } from '@vue-flow/core';
import { useNodeManagement } from '../composables/useNodeManagement';
import { useEdgeManagement } from '../composables/useEdgeManagement';
import { useGraphPersistence } from '../composables/useGraphPersistence';
import { useDragAndDrop } from '../composables/useDragAndDrop'; // Import the new composable
import TwistyNode from './TwistyNode.vue';
import SpecialEdge from './SpecialEdge.vue';
import ConfluenceEdge from './ConfluenceEdge.vue';
import MenuOverlay from './MenuOverlay.vue';
import { Alg } from 'cubing/alg'; // Import the Alg class

import { useNodeConfluence } from '../composables/useNodeConfluence';
import { useAutoLayout } from '../composables/useAutoLayout';
import { useGridSnap } from '../composables/useGridSnap';
import { useGraphScaling } from '../composables/useGraphScaling';
import { useGraphDataStore } from '../stores/graphDataStore';

const router = useRouter();
const graphDataStore = useGraphDataStore();

const { 
  onPaneReady, addNodes, addEdges, findNode, 
  updateNodeData, removeNodes, nodes, edges,
  screenToFlowCoordinate, onConnect, setNodes, setEdges,
  fitView,
  // updateNodePosition,
} = useVueFlow();


// Initialize useNodeManagement composable
const { 
  nodeIdCounter, getNextNodeId, handleSetTargetHandle, resetNodes, toggleNodeCollapse, updateNodePosition 
} = useNodeManagement({ addNodes, addEdges, updateNodeData, removeNodes, setNodes, findNode });

// Initialize useNodeConfluence composable (inject edges & addEdges so it can create confluence edges)
const { checkAndRepositionNode } = useNodeConfluence({ findNode, updateNodePosition, addEdges, edges, updateNodeData });

const { handleEdgeAlgorithmUpdate } = useEdgeManagement({ edges, nodes, findNode, updateNodeData, updateNodePosition, addEdges, checkAndRepositionNode });

const { 
  saveGraphToStore, applyGraphState, importGraphFromFile 
} = useGraphPersistence({ nodes, edges, setNodes, setEdges, nodeIdCounter });

const { onDrop, onDragOver } = useDragAndDrop(screenToFlowCoordinate, addNodes, getNextNodeId); // Use the composable

const saveStatus = ref<{ message: string; type: 'success' | 'error' } | null>(null);

// Auto layout composable
const { layout: runAutoLayout } = useAutoLayout(nodes, edges, setNodes, () => fitView({ padding: 0.2 }));
const { snapAll } = useGridSnap(setNodes);
const { scaleAll } = useGraphScaling(setNodes);

function handleAutoLayout() {
  runAutoLayout({ direction: 'TB', nodeSep: 80, rankSep: 160, ranker: 'tight-tree' });
}

function handleCustomLayout(opts: any) {
  runAutoLayout({
    direction: opts.direction,
    nodeSep: opts.nodeSep,
    rankSep: opts.rankSep,
    align: opts.align,
    ranker: opts.ranker,
  });
}

function handleSnapToGrid(gridSize: number) {
  snapAll(gridSize || 75);
  fitView({ padding: 0.2 });
}

function handleScaleGraph({ factor }: { factor: number }) {
  scaleAll(factor);
  // Do not auto-fit; user intent is incremental spacing change
}

function handleRender3D() {
  // Store current graph data in the store
  graphDataStore.setGraphData(nodes.value, edges.value);
  // Navigate to 3D view
  router.push('/3d');
}

onPaneReady((flowInstance) => {
  if (nodes.value.length > 0) {
    const firstNode = nodes.value[0];
    const bounds = {
      x: firstNode.position.x,
      y: firstNode.position.y,
      width: firstNode.dimensions?.width || 0,
      height: firstNode.dimensions?.height || 0,
    };
    flowInstance.fitBounds(bounds, { padding: 3 });
  } else {
    flowInstance.fitView();
  }
});

onConnect((connection) => {
  const sourceNode = findNode(connection.source); // Replaced getNode with findNode
  const targetNode = findNode(connection.target); // Replaced getNode with findNode

  if (sourceNode && targetNode && connection.targetHandle === targetNode.data.targetHandleId) {
    const rawAlgForEdge = targetNode.data.rawAlgorithm || ''; 
    const newCombinedAlg = new Alg(sourceNode.data.alg || '').concat(new Alg(rawAlgForEdge)).experimentalSimplify({ cancel: true }).toString();

    // console.log('[AlgGraph] Updating node', targetNode.id, 'with new algorithm:', newCombinedAlg);
    updateNodeData(targetNode.id, {
      alg: newCombinedAlg,
      label: newCombinedAlg,
    });

    // After updating the node's algorithm, check for confluence and reposition if needed
    // This is async and may take a while
    // console.log('[AlgGraph] Checking for confluence and possible reposition for node', targetNode.id);
  const srcHandle = (connection.sourceHandle ?? undefined) as string | undefined;
  checkAndRepositionNode(targetNode.id, nodes.value, { parentId: sourceNode.id, rawSegment: rawAlgForEdge, sourceHandle: srcHandle });

    const newEdge = {
      ...connection,
      id: `e${connection.source}-${connection.target}-${connection.targetHandle || 'target'}`,
      type: 'special',
      label: rawAlgForEdge,
      data: { algorithm: rawAlgForEdge },
      animated: true,
    };
    // console.log('[AlgGraph] Adding new edge:', newEdge);
    addEdges([newEdge]);
  }
});

// Ensure node deletion works
const onNodesDelete = (deletedNodes: any[]) => {
  const deletedNodeIds = deletedNodes.map((node: any) => node.id);
  removeNodes(deletedNodeIds);
  const remainingEdges = edges.value.filter((edge: any) => 
    !deletedNodeIds.includes(edge.source) && !deletedNodeIds.includes(edge.target)
  );
  setEdges(remainingEdges);
};

// Delete a single edge by id
const deleteEdgeById = (edgeId: string) => {
  const remaining = edges.value.filter(e => e.id !== edgeId);
  setEdges(remaining);
};

// Ensure node deletion works
const onNodeDelete = (nodeId: string) => {
  removeNodes([nodeId]); // Remove the node
  const remainingEdges = edges.value.filter((edge: any) => 
    edge.source !== nodeId && edge.target !== nodeId
  );
  setEdges(remainingEdges); // Remove edges connected to the deleted node
};

// Fix autogenerated edges not connecting
const initializeEdges = () => {
  nodes.value.forEach((node: any) => {
    if (node.data && node.data.rawAlgorithm) {
      const parentNode = findNode(node.data.parentId); // Replaced getNode with findNode
      if (parentNode) {
        const rawAlgForEdge = node.data.rawAlgorithm;
        const newEdge = {
          id: `e${parentNode.id}-${node.id}`,
          source: parentNode.id,
          target: node.id,
          type: 'special',
          label: rawAlgForEdge,
          data: { algorithm: rawAlgForEdge },
          animated: true,
        };
        addEdges([newEdge]);
      }
    }
  });
};

onMounted(() => {
  initializeEdges();
  resetNodes(); // Start with a single solved node
});

</script>

<template>
  <div 
    style="width: 100vw; height: 100vh;"
    @dragover="onDragOver"
    @drop="onDrop"
    ref="vueFlowRef"
  >
    <MenuOverlay 
      :save-status="saveStatus"
      @save-graph-request="saveGraphToStore"
      @load-graph-request="applyGraphState"
      @load-graph-from-file-request="importGraphFromFile"
      @auto-layout-request="handleAutoLayout"
      @custom-layout-request="handleCustomLayout"
  @snap-to-grid-request="handleSnapToGrid"
  @scale-graph-request="handleScaleGraph"
      @render-3d-request="handleRender3D"
    />
    <VueFlow 
      :nodes="nodes" 
      :edges="edges" 
      :elevate-nodes-on-select="false" 
      :elevate-edges-on-select="false"
      :connect-on-click="false" 
      @nodes-delete="onNodesDelete"
    >
      <template #node-twisty="twistyNodeProps">
        <TwistyNode 
          v-bind="twistyNodeProps" 
          @set-target-handle="handleSetTargetHandle"
          @delete-node="onNodeDelete"
          @toggle-collapse="toggleNodeCollapse"
        />
      </template>
      <template #edge-special="specialEdgeProps">
        <SpecialEdge 
          v-bind="specialEdgeProps" 
          @update:algorithm="handleEdgeAlgorithmUpdate"
        />
      </template>
      <template #edge-confluence="confluenceEdgeProps">
  <ConfluenceEdge v-bind="confluenceEdgeProps" @delete-edge="deleteEdgeById" />
      </template>
    </VueFlow>
  </div>
</template>
