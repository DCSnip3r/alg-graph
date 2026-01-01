<template>
  <div class="force-graph-container">
    <!-- Controls Panel -->
    <div class="controls-panel">
      <!-- Close button -->
      <button class="close-button" @click="goBack" title="Return to 2D Editor">
        ✕ Close 3D View
      </button>
      
      <!-- Lock cube rotation toggle -->
      <button 
        class="control-button" 
        @click="toggleCubeLock" 
        :title="displaySettings.lockCubeRotation ? 'Unlock cube rotation (cubes will rotate with graph)' : 'Lock cube rotation (cubes maintain orientation)'"
      >
        {{ displaySettings.lockCubeRotation ? '🔒' : '🔓' }} {{ displaySettings.lockCubeRotation ? 'Locked' : 'Unlocked' }}
      </button>
      
      <!-- Hint for shift+drag -->
      <div class="hint-text">
        Hold <kbd>Shift</kbd> and drag to rotate cubes independently
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
import { useDisplaySettingsStore } from '../stores/displaySettingsStore';
import { convertToForceGraphData } from '../utils/graphConverter';
import { preloadTwisty3DNodes, getTwisty3DNode, clearTwisty3DCache, getAllPuzzleObjects } from '../utils/twisty3DNodeFactory';
import { VueForceGraph3D } from 'vue-force-graph';
import { Euler, Quaternion } from 'three';

// Rotation sensitivity for shift+drag
const ROTATION_SENSITIVITY = 0.01;

const router = useRouter();
const graphDataStore = useGraphDataStore();
const displaySettings = useDisplaySettingsStore();
const graphRef = ref<any>(null);
const isLoading = ref(true);

// Track state for shift+drag rotation
const isShiftPressed = ref(false);
const isDragging = ref(false);
const lastMouseX = ref(0);
const lastMouseY = ref(0);
let animationFrameId: number | null = null;

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

// Toggle cube rotation lock
const toggleCubeLock = () => {
  displaySettings.lockCubeRotation = !displaySettings.lockCubeRotation;
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

// Apply rotation to all puzzle cubes
const applyRotationToCubes = () => {
  const puzzleObjects = getAllPuzzleObjects();
  const cubeRotation = new Euler(
    displaySettings.cubeRotationX,
    displaySettings.cubeRotationY,
    displaySettings.cubeRotationZ,
    'XYZ'
  );
  
  if (displaySettings.lockCubeRotation) {
    // When locked, need camera for billboard effect
    if (!graphRef.value) return;
    
    const graph = graphRef.value;
    const camera = graph.camera?.();
    if (!camera) return;
    
    puzzleObjects.forEach((puzzleObj) => {
      if (puzzleObj) {
        // When locked, make cube face the camera (billboard effect) plus independent rotation
        // Create a quaternion that makes the cube face the camera direction
        const quaternion = new Quaternion();
        quaternion.setFromRotationMatrix(camera.matrixWorld);
        
        // Apply the camera's rotation to make cube face camera
        puzzleObj.quaternion.copy(quaternion);
        
        // Then apply independent rotation on top
        const independentRotation = new Quaternion().setFromEuler(cubeRotation);
        puzzleObj.quaternion.multiply(independentRotation);
      }
    });
  } else {
    // When unlocked, just apply independent rotation (let cubes rotate naturally with view)
    puzzleObjects.forEach((puzzleObj) => {
      if (puzzleObj) {
        puzzleObj.rotation.set(cubeRotation.x, cubeRotation.y, cubeRotation.z);
      }
    });
  }
};

// Handle keyboard events for shift key
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Shift') {
    isShiftPressed.value = true;
  }
};

const handleKeyUp = (e: KeyboardEvent) => {
  if (e.key === 'Shift') {
    isShiftPressed.value = false;
  }
};

// Handle mouse events for shift+drag rotation
const handleMouseDown = (e: MouseEvent) => {
  if (isShiftPressed.value) {
    isDragging.value = true;
    lastMouseX.value = e.clientX;
    lastMouseY.value = e.clientY;
    e.preventDefault();
  }
};

const handleMouseMove = (e: MouseEvent) => {
  if (isDragging.value && isShiftPressed.value) {
    const deltaX = e.clientX - lastMouseX.value;
    const deltaY = e.clientY - lastMouseY.value;
    
    // Rotate cubes based on mouse movement
    // Horizontal movement rotates around Y axis, vertical around X axis
    displaySettings.cubeRotationY += deltaX * ROTATION_SENSITIVITY;
    displaySettings.cubeRotationX += deltaY * ROTATION_SENSITIVITY;
    
    lastMouseX.value = e.clientX;
    lastMouseY.value = e.clientY;
    
    applyRotationToCubes();
    e.preventDefault();
  }
};

const handleMouseUp = () => {
  isDragging.value = false;
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
  
  // Set up animation loop for continuous rotation updates
  // Only run when locked (for billboard effect) to optimize performance
  const animationLoop = () => {
    if (displaySettings.lockCubeRotation) {
      applyRotationToCubes();
    }
    animationFrameId = requestAnimationFrame(animationLoop);
  };
  animationFrameId = requestAnimationFrame(animationLoop);
  
  // Add event listeners for keyboard and mouse
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  window.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
});

onBeforeUnmount(() => {
  // Cancel animation frame
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
  
  clearTwisty3DCache();
  
  // Remove event listeners
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
  window.removeEventListener('mousedown', handleMouseDown);
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', handleMouseUp);
});
</script>

<style scoped>
.force-graph-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #1a1a1a;
}

.controls-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
}

.close-button,
.control-button {
  background-color: #191919;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  opacity: 0.5;
  white-space: nowrap;
}

.close-button:hover,
.control-button:hover {
  background-color: #2a2a2a;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.4);
  opacity: 1;
}

.close-button:hover {
  background-color: #c82333;
}

.close-button:active,
.control-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.hint-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 8px 12px;
  border-radius: 4px;
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.hint-text:hover {
  opacity: 1;
}

.hint-text kbd {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
  font-weight: bold;
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
