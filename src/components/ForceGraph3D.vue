<template>
  <div class="force-graph-container">
    <!-- Combined Menu: Algorithm Legend and Close Button -->
    <div class="legend-container" :class="{ collapsed: isLegendCollapsed }">
      <div class="legend-header">
        <span v-if="isLegendCollapsed" class="collapse-line"></span>
        <button 
          class="legend-toggle" 
          @click="isLegendCollapsed = !isLegendCollapsed"
          :title="isLegendCollapsed ? 'Show Legend' : 'Hide Legend'"
        >
          <span class="chevron" :class="{ rotated: !isLegendCollapsed }">‹</span>
        </button>
      </div>
      <div v-if="!isLegendCollapsed" class="legend-content">
        <!-- Close button -->
        <button class="close-button" @click="goBack" title="Return to 2D Editor">
          ✕ Close 3D View
        </button>
        
        <!-- Algorithm presets -->
        <div 
          v-for="preset in algPresetsStore.presets" 
          :key="preset.id"
          class="legend-item"
          :style="{ backgroundColor: preset.color, color: getTextColor(preset.color) }"
        >
          <span class="legend-name">{{ preset.name }}</span>
          <span class="legend-alg">{{ preset.algorithm }}</span>
        </div>
      </div>
    </div>

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
      :node-color="nodeColor"
      :link-label="(link: any) => link.label || ''"
      :link-color="(link: any) => link.color || '#999999'"
      :link-width="2"
      :link-directional-arrow-length="3.5"
      :link-directional-arrow-rel-pos="1"
      :renderer-config="{ logarithmicDepthBuffer: true, antialias: true }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useGraphDataStore } from '../stores/graphDataStore';
import { useAlgPresetsStore } from '../stores/algPresetsStore';
import { useColorUtils } from '../composables/useColorUtils';
import { convertToForceGraphData } from '../utils/graphConverter';
import { preloadTwisty3DNodes, getTwisty3DNode, clearTwisty3DCache } from '../utils/twisty3DNodeFactory';
import { VueForceGraph3D } from 'vue-force-graph';

const router = useRouter();
const graphDataStore = useGraphDataStore();
const algPresetsStore = useAlgPresetsStore();
const { getTextColorForBackground } = useColorUtils();
const graphRef = ref<any>(null);
const isLoading = ref(true);
const isLegendCollapsed = ref(false);

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

// Get appropriate text color for background
const getTextColor = (backgroundColor: string) => {
  return getTextColorForBackground(backgroundColor);
};

// Create custom 3D node objects using cubing.js
// This function must be synchronous for vue-force-graph
// Returns null for collapsed nodes to render them as default spheres
const nodeThreeObject = (node: any) => {
  // If node is collapsed, return null to use default sphere rendering
  if (node.collapsed) {
    return null;
  }
  
  const alg = node.alg || '';
  return getTwisty3DNode(alg);
};

// Custom node color function for collapsed nodes
const nodeColor = (node: any) => {
  // If node is collapsed, check for incoming edge colors
  if (node.collapsed) {
    // Find incoming links to this node
    const incomingLinks = graphData.value.links.filter((link: any) => link.target === node.id || link.target.id === node.id);
    
    // If there's exactly one incoming link, use its color
    if (incomingLinks.length === 1) {
      return incomingLinks[0].color || 'rgba(255, 255, 255, 0.6)';
    }
    
    // Otherwise, use white with opacity
    return 'rgba(255, 255, 255, 0.6)';
  }
  
  // For non-collapsed nodes (3D cubes), return undefined to use default
  return undefined;
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

onBeforeUnmount(() => {
  clearTwisty3DCache();
});
</script>

<style scoped>
.force-graph-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #1a1a1a;
}

.legend-container {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.legend-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.collapse-line {
  width: 30px;
  height: 2px;
  background-color: rgba(128, 128, 128, 0.6);
  border-radius: 1px;
}

.legend-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  color: #666;
  font-size: 24px;
  line-height: 1;
  transition: all 0.2s ease;
}

.legend-toggle:hover {
  color: #999;
}

.chevron {
  display: inline-block;
  transition: transform 0.3s ease;
  font-weight: bold;
}

.chevron.rotated {
  transform: rotate(-90deg);
}

.close-button {
  background-color: rgba(64, 64, 64, 0.8);
  color: white;
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  white-space: nowrap;
}

.close-button:hover {
  background-color: rgba(80, 80, 80, 0.9);
  transform: translateX(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
}

.close-button:active {
  transform: translateX(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.legend-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
}

.legend-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  line-height: 1.3;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  min-width: 100px;
  max-width: 200px;
  transition: all 0.2s ease;
}

.legend-item:hover {
  transform: translateX(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
}

.legend-name {
  font-weight: 600;
  font-size: 12px;
}

.legend-alg {
  font-family: 'Courier New', monospace;
  font-size: 10px;
  opacity: 0.9;
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
