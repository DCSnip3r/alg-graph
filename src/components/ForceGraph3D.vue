<template>
  <div class="force-graph-container">
    <!-- Close button -->
    <button class="close-button" @click="goBack" title="Return to 2D Editor">
      ✕ Close 3D View
    </button>

    <!-- 3D Force Graph -->
    <VueForceGraph3D
      ref="graphRef"
      :graph-data="graphData"
      :node-label="(node: any) => node.name"
      :node-color="() => '#4a9eff'"
      :node-val="10"
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
import { VueForceGraph3D } from 'vue-force-graph';

const router = useRouter();
const graphDataStore = useGraphDataStore();
const graphRef = ref<any>(null);

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

onMounted(() => {
  // If no graph data, redirect back to editor
  if (graphDataStore.nodes.length === 0) {
    router.push('/');
  }
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
</style>
