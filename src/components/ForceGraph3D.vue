<template>
  <div class="force-graph-container">
    <!-- Close button -->
    <button class="close-button" @click="goBack" title="Return to 2D Editor">
      ✕ Close 3D View
    </button>

    <!-- Loading state -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-message">
        <div class="spinner"></div>
        <p>Loading 3D puzzles...</p>
      </div>
    </div>

    <!-- 3D Force Graph -->
    <VueForceGraph3D
      v-else
      ref="graphRef"
      :graph-data="graphData"
      :node-label="(node: any) => node.name"
      :node-three-object="nodeThreeObject"
      :link-label="(link: any) => link.label || ''"
      :link-color="(link: any) => link.color || '#999999'"
      :link-width="2"
      :link-directional-arrow-length="3.5"
      :link-directional-arrow-rel-pos="1"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGraphDataStore } from '../stores/graphDataStore';
import { convertToForceGraphData } from '../utils/graphConverter';
import { preloadTwisty3DNodes, getTwisty3DNode } from '../utils/twisty3DNodeFactory';
import { VueForceGraph3D } from 'vue-force-graph';

const router = useRouter();
const graphDataStore = useGraphDataStore();
const graphRef = ref<any>(null);
const isLoading = ref(true);

// Convert the graph data to force graph format
const graphData = computed(() => {
  return convertToForceGraphData(
    graphDataStore.nodes,
    graphDataStore.edges
  );
});

// Navigate back to 2D editor
const goBack = () => {
  router.push('/');
};

// Create custom 3D node objects using cubing.js
// This function must be synchronous for vue-force-graph
const nodeThreeObject = (node: any) => {
  const alg = node.alg || '';
  return getTwisty3DNode(alg);
};

onMounted(async () => {
  // If no graph data (no nodes and no edges), redirect back to editor
  if (graphDataStore.nodes.length === 0 && graphDataStore.edges.length === 0) {
    router.push('/');
    return;
  }

  // Pre-load all puzzle objects before rendering
  const nodeAlgs = graphDataStore.nodes.map(node => node.data?.alg || '');
  
  try {
    await preloadTwisty3DNodes(nodeAlgs);
  } catch (error) {
    console.error('Error loading 3D puzzles:', error);
  }
  
  isLoading.value = false;
});
</script>

<style scoped>
.force-graph-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #1a1a1a;
}

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.close-button:hover {
  background-color: #c82333;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.4);
}

.close-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1a1a1a;
  z-index: 999;
}

.loading-message {
  text-align: center;
  color: white;
}

.loading-message p {
  margin-top: 20px;
  font-size: 18px;
  font-weight: 500;
}

.spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #4a9eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
