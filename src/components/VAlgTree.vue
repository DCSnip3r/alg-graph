<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import type { Node, Edge, XYPosition, Connection, EdgeUpdateEvent } from '@vue-flow/core';
import { VueFlow, useVueFlow, Position } from '@vue-flow/core';
import { Alg } from 'cubing/alg';

import TwistyNode from './TwistyNode.vue';
import SpecialEdge from './SpecialEdge.vue';
import MenuOverlay from './MenuOverlay.vue';
import { useSpawnNode } from '../composables/useSpawnNode.ts';
import { useSavedGraphsStore, type SavedGraphState } from '../stores/savedGraphsStore'; // Import SavedGraphState
import { useAlgPresetsStore } from '../stores/algPresetsStore'; // Import useAlgPresetsStore

const { 
  onPaneReady, addNodes, addEdges, getNode, getEdges, 
  updateNodeData, removeNodes, removeEdges, nodes, edges,
  screenToFlowCoordinate, onConnect, project,
  setNodes, setEdges,
} = useVueFlow();

const savedGraphsStore = useSavedGraphsStore();
const saveFeedback = ref<{ message: string, type: 'success' | 'error' } | null>(null);
let saveFeedbackTimeoutId: number | undefined = undefined;

onPaneReady((flowInstance) => flowInstance.fitView());

onConnect((connection) => {
  const sourceNode = getNode.value(connection.source);
  const targetNode = getNode.value(connection.target);

  if (sourceNode && targetNode && connection.targetHandle === targetNode.data.targetHandleId) {
    const rawAlgForEdge = targetNode.data.rawAlgorithm || ''; 
    
    const newCombinedAlg = new Alg(sourceNode.data.alg || '').concat(new Alg(rawAlgForEdge)).experimentalSimplify({ cancel: true }).toString();

    updateNodeData(targetNode.id, {
      alg: newCombinedAlg,
      label: newCombinedAlg,
    });
    
    const newEdge: Edge = {
      ...connection,
      id: `e${connection.source}-${connection.target}-${connection.targetHandle || 'target'}`,
      type: 'special',
      label: rawAlgForEdge,
      data: { algorithm: rawAlgForEdge },
      animated: true,
    };
    addEdges([newEdge]);
  } else if (sourceNode && targetNode) {
    addEdges([{ 
      ...connection, 
      id: `e${connection.source}-${connection.target}-${connection.sourceHandle}-${connection.targetHandle}-${Date.now()}`, 
      type: 'special', 
      label: 'link',
      data: { algorithm: '' }
    }]);
  }
});

const sune = 'R U R\' U R U2\' R\'';
const mSune = 'R\' U\' R U\' R\' U2 R';
const sexy = new Alg("[R, U]");
const sLexy = new Alg("[R, U\']");
const sledge = new Alg("[R\', F]");
const mix = new Alg("F [R : U\']");
const mixi = mix.invert();
const hedge = sledge.invert();
const adjustment = 'U';
const sxa = 'R2\' U\' R2 U\' R\' U2 R U\' R\' U\' R\' U R2';
const msxa = 'R2 U R2 U R U2 R\' U R U R U\' R2';

const nodeIdCounter = ref(1);

const getNextNodeId = (): string => {
  const id = nodeIdCounter.value;
  nodeIdCounter.value++;
  return `n-${id}`; 
};

function resetNodes(): Node | null { 
  nodeIdCounter.value = 1; 
  const rootId = getNextNodeId(); 

  setNodes([]);
  setEdges([]);

  const initialRootNode: Node = { 
    id: rootId,
    type: 'twisty',
    position: { x: 0, y: 0 },
    data: { 
      label: 'Solved', 
      alg: '',
      targetHandleId: 'handle-b',
      rawAlgorithm: '',
    },
    style: {
      borderColor: '#ffffff',
      borderWidth: '8px',
      borderStyle: 'solid',
      borderRadius: '4px',
    },
  };
  addNodes([initialRootNode]);
  return initialRootNode; 
} 

function generateAlgTree(baseAlgString: string, mirrorAlgString: string) {
  const rootNodeForBranching = resetNodes(); 
  
  if (!rootNodeForBranching) {
    console.error("Root node not available for generateAlgTree after resetNodes.");
    return;
  }

  const createBranch = (currentParentNode: Node, edgeAlg: string, sourceHandle: string, offset: XYPosition) => {
    let parentForLoop: Node | null = currentParentNode;
    for (let i = 0; i < 3; i++) {
      if (!parentForLoop) {
        console.error("createBranch: parentForLoop is null, cannot continue creating branch.");
        break;
      }
      const newNodeId = getNextNodeId();
      const actualSourceHandleId = sourceHandle;

      const spawnResult = useSpawnNode(
        edgeAlg, 
        parentForLoop, 
        newNodeId,
        actualSourceHandleId, 
        offset
      );
      
      if (!spawnResult) {
        console.error(`Failed to spawn child node from parent ${parentForLoop.id}. Stopping this branch.`);
        break;
      }
      
      const { newNode, newEdge } = spawnResult;
      
      addNodes([newNode]);
      addEdges([newEdge]);
      
      parentForLoop = newNode;
    }
  };

  createBranch(rootNodeForBranching, baseAlgString, 'handle-r', { x: 300, y: 0 }); 
  createBranch(rootNodeForBranching, new Alg(baseAlgString).invert().toString(), 'handle-l', { x: -300, y: 0 }); 
  createBranch(rootNodeForBranching, mirrorAlgString, 'handle-t', { x: 0, y: -300 }); 
}

generateAlgTree(sxa, msxa); 

const onDragOver = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy';
  }
};

const vueFlowRef = ref(null);

const onDrop = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer) {
    const algEntryString = event.dataTransfer.getData('application/json');
    if (!algEntryString) return;

    try {
      const algEntry = JSON.parse(algEntryString);
      const position = screenToFlowCoordinate({
         x: event.clientX,
         y: event.clientY,
       });
      const newNodeId = getNextNodeId();
      const useCustomColor = algEntry.color && algEntry.color !== '#ffffff';

      const newNode: Node = {
        id: newNodeId,
        type: 'twisty', 
        position,
        data: {
          label: algEntry.name || algEntry.algorithm,
          alg: algEntry.algorithm, 
          rawAlgorithm: algEntry.algorithm, 
          color: algEntry.color, 
          targetHandleId: 'handle-b',
        },
        style: { 
          borderColor: useCustomColor ? algEntry.color : '#ffffff',
          borderWidth: '8px',
          borderStyle: 'solid',
          borderRadius: '4px',
        },
      };
      addNodes([newNode]);
    } catch (e) {
      console.error("Failed to parse dropped data or create node:", e);
    }
  }
};

const handleSetTargetHandle = ({ nodeId, newTargetHandleId }: { nodeId: string, newTargetHandleId: string }) => {
  const node = getNode.value(nodeId);
  if (node) {
    updateNodeData(nodeId, { targetHandleId: newTargetHandleId });

    const connectedEdges = edges.value.filter(edge => edge.target === nodeId && edge.targetHandle === newTargetHandleId);
    if (connectedEdges.length > 0) {
      const incomingEdge = connectedEdges[0];
      const sourceNode = getNode.value(incomingEdge.source);
      if (sourceNode) {
         const rawAlgForEdge = node.data.rawAlgorithm || '';
         const newCombinedAlg = new Alg(sourceNode.data.alg || '').concat(new Alg(rawAlgForEdge)).experimentalSimplify({ cancel: true }).toString();
         updateNodeData(nodeId, { alg: newCombinedAlg, label: newCombinedAlg });
      }
    } else {
      updateNodeData(nodeId, { alg: node.data.rawAlgorithm, label: node.data.rawAlgorithm });
    }
  }
};

const handleEdgeAlgorithmUpdate = ({ edgeId, newAlgorithm }: { edgeId: string, newAlgorithm: string }) => {
  const edge = edges.value.find(e => e.id === edgeId); 
  if (!edge) return;

  if (edge.data) {
    edge.data.algorithm = newAlgorithm;
  } else {
    edge.data = { algorithm: newAlgorithm };
  }
  edge.label = newAlgorithm;

  const sourceNode = getNode.value(edge.source);
  const targetNode = getNode.value(edge.target);

  if (sourceNode && targetNode) {
    if (edge.targetHandle === targetNode.data.targetHandleId) {
      try {
        const sourceAlg = new Alg(sourceNode.data.alg || '');
        const edgeSegmentAlg = new Alg(newAlgorithm); 
        const newTargetCombinedAlg = sourceAlg.concat(edgeSegmentAlg).experimentalSimplify({ cancel: true }).toString();
        
        updateNodeData(targetNode.id, { 
          alg: newTargetCombinedAlg, 
          label: newTargetCombinedAlg,
          rawAlgorithm: newAlgorithm, 
        });
      } catch (e) {
        console.error("Error updating target node algorithm from edge update:", e);
      }
    }
  }
};

const handleSaveGraphRequest = (graphName: string) => {
  const success = savedGraphsStore.saveGraph(
    graphName, 
    nodes.value, 
    edges.value  
  );

  if (saveFeedbackTimeoutId) {
    clearTimeout(saveFeedbackTimeoutId);
  }

  if (success) {
    saveFeedback.value = { message: `Graph '${graphName}' saved!`, type: 'success' };
  }
  
  saveFeedbackTimeoutId = window.setTimeout(() => {
    saveFeedback.value = null;
  }, 5000);
};

const handleLoadGraphRequest = (loadedData: { nodes: Node[], edges: Edge[] }) => {
  setNodes(loadedData.nodes);
  setEdges(loadedData.edges);
  
  let maxId = 0;
  loadedData.nodes.forEach(node => {
    const idParts = node.id.split('-');
    if (idParts.length > 1) {
      const idNum = parseInt(idParts[1]);
      if (!isNaN(idNum) && idNum > maxId) {
        maxId = idNum;
      }
    }
  });
  nodeIdCounter.value = maxId + 1;
  console.log("Graph loaded!");
};

const handleLoadGraphFromFile = (graphState: SavedGraphState) => {
  // Update presets store
  // For consistency, let's assume the loaded file's presets should be used.
  const algPresetsStore = useAlgPresetsStore(); 
  algPresetsStore.replaceAllPresets(graphState.algPresets || []);

  // Update nodes and edges
  setNodes(graphState.nodes);
  setEdges(graphState.edges);

  // Update nodeIdCounter
  let maxId = 0;
  graphState.nodes.forEach(node => {
    const idParts = node.id.split('-');
    if (idParts.length > 1) {
      const idNum = parseInt(idParts[1]);
      if (!isNaN(idNum) && idNum > maxId) {
        maxId = idNum;
      }
    }
  });
  nodeIdCounter.value = maxId + 1;

  // Save this newly loaded graph to localStorage
  // This will make it appear in the "Saved Graphs" list in MenuOverlay.
  // The saveGraph method in savedGraphsStore will use the algPresets 
  // that were just updated by algPresetsStore.replaceAllPresets.
  const saveSuccess = savedGraphsStore.saveGraph(graphState.name, graphState.nodes, graphState.edges);

  // Feedback
  if (saveFeedbackTimeoutId) {
    clearTimeout(saveFeedbackTimeoutId);
  }
  if (saveSuccess) {
    saveFeedback.value = { message: `Graph '${graphState.name}' loaded and saved!`, type: 'success' };
  } else {
    // This case might occur if the graph name is empty or saving fails for other reasons.
    saveFeedback.value = { message: `Graph '${graphState.name}' loaded from file, but failed to save to local list.`, type: 'error' };
  }
  
  saveFeedbackTimeoutId = window.setTimeout(() => {
    saveFeedback.value = null;
  }, 5000);

  // The old commented out section:
  // savedGraphsStore.saveGraph(graphState.name, graphState.nodes, graphState.edges);
  // Note: saveGraph in the store also saves the *current* algPresetsStore.presets,
  // so if the file's presets are different and meant to be the new source of truth,
  // the order of operations matters or saveGraph needs to accept presets.
  // The current savedGraphsStore.saveGraph saves algPresetsStore.presets.
  // Since we called algPresetsStore.replaceAllPresets above, this should be fine.
};

const handleDeleteNode = (nodeIdToRemove: string) => {
  // Find edges connected to the node
  const edgesToRemove = edges.value.filter(edge => edge.source === nodeIdToRemove || edge.target === nodeIdToRemove).map(edge => edge.id);
  
  if (edgesToRemove.length > 0) {
    removeEdges(edgesToRemove);
  }
  removeNodes([nodeIdToRemove]);
};

</script>

<template>
  <div 
    style="width: 100vw; height: 100vh;"
    @dragover="onDragOver"
    @drop="onDrop"
    ref="vueFlowRef"
  >
    <MenuOverlay 
      @save-graph-request="handleSaveGraphRequest"
      @load-graph-request="handleLoadGraphRequest"
      @load-graph-from-file-request="handleLoadGraphFromFile"
      :save-status="saveFeedback"
    />
    <VueFlow 
      :nodes="nodes" 
      :edges="edges" 
      :elevate-nodes-on-select="false" 
      :elevate-edges-on-select="false"
      :connect-on-click="false" 
    >
      <template #node-twisty="twistyNodeProps">
        <TwistyNode 
          v-bind="twistyNodeProps" 
          @set-target-handle="handleSetTargetHandle"
          @delete-node="handleDeleteNode"
        />
      </template>
      <template #edge-special="specialEdgeProps">
        <SpecialEdge 
          v-bind="specialEdgeProps" 
          @update:algorithm="handleEdgeAlgorithmUpdate"
        />
      </template>
    </VueFlow>
  </div>
</template>
