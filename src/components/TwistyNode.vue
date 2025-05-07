<script setup lang="ts">
import { ref, computed, defineEmits } from 'vue';
import { Handle, Position } from '@vue-flow/core';
import type { NodeProps } from '@vue-flow/core';
import Twisty from './Twisty.vue';
import { useAlgPresetsStore } from '../stores/algPresetsStore';

const props = defineProps<NodeProps>();
const emit = defineEmits(['setTargetHandle', 'delete-node']); // Added 'delete-node'
const algStore = useAlgPresetsStore();

const isVisible = ref(true);

const toggleVisibility = () => {
  isVisible.value = !isVisible.value;
};

const onDeleteNode = () => {
  emit('delete-node', props.id);
};

// Helper function to determine text color for good contrast
const getTextColorForBackground = (hexColor: string): string => {
  if (!hexColor || hexColor.length < 7) return '#000000'; // Default to black
  try {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    // Simple luminance formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff'; // Black for light bg, white for dark
  } catch (e) {
    return '#000000'; // Fallback
  }
};

const colorizeLabel = computed(() => {
  const label = props.data.label;
  if (typeof label !== 'string') {
    return ''; 
  }
  // Get sorted presets from the store
  const presetsToHighlight = algStore.getSortedPresetsForHighlighting;
  let colorizedLabel = label;

  presetsToHighlight.forEach(presetEntry => {
    const trimmedPresetAlg = presetEntry.algorithm.trim(); // Already trimmed in store getter logic
    // const escapedPresetAlg = trimmedPresetAlg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Simpler escape for typical alg notation (apostrophe, numbers, letters, spaces)
    // More robust escaping might be needed if presets can contain arbitrary regex chars
    const escapedPresetAlg = trimmedPresetAlg.replace(/[']/g, "\\'"); // Escape apostrophes specifically
                                          // .replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Full escape if needed

    const regex = new RegExp(escapedPresetAlg + '(?=\\s|$)', 'g');
    
    colorizedLabel = colorizedLabel.replace(regex, (match) => {
      const textColor = getTextColorForBackground(presetEntry.color);
      return `<span class="highlight" style="background-color: ${presetEntry.color}; color: ${textColor};">${match}</span>`;
    });
  });

  return colorizedLabel;
});

// Define all potential handles for this node type
const potentialHandles = [
  { id: 'handle-t', position: Position.Top, name: 'Top' },
  { id: 'handle-b', position: Position.Bottom, name: 'Bottom' },
  { id: 'handle-l', position: Position.Left, name: 'Left' },
  { id: 'handle-r', position: Position.Right, name: 'Right' },
];

const handleClicked = (clickedHandleId: string) => {
  if (!isVisible.value) return; // Disable handle adjustment if the node is minimized
  emit('setTargetHandle', { nodeId: props.id, newTargetHandleId: clickedHandleId });
};

const currentTargetHandleId = computed(() => props.data?.targetHandleId || 'handle-b');

const getHandleStyle = (handleId: string) => {
  if (currentTargetHandleId.value === handleId) {
    return { backgroundColor: 'red' };
  }
  return { backgroundColor: '#007bff' }; // Default source handle color
};

</script>

<template>
  <div 
    class="vue-flow__node-default twisty-node-wrapper" 
    :class="{ minimized: !isVisible }" 
    :style="{ borderColor: props.style?.borderColor || '#ffffff' }"
  >
    <div class="node-content">
      <div class="node-controls">
        <button class="toggle-button node-action-button" @click="toggleVisibility" :title="isVisible ? 'Collapse Node' : 'Expand Node'">
          {{ isVisible ? '−' : '+' }}
        </button>
        <button 
          v-if="isVisible" 
          class="delete-node-button node-action-button" 
          @click="onDeleteNode" 
          title="Delete Node"
        >
          X
        </button>
      </div>
      <div v-if="isVisible" class="node-alg-label" v-html="colorizeLabel"></div>
      <div class="twisty-container" v-if="isVisible">
        <Twisty :alg="props.data.alg"/>
      </div>
      <!-- Render handles only when the node is visible -->
      <template v-for="handle in potentialHandles" :key="handle.id">
        <Handle 
          :id="handle.id" 
          :type="currentTargetHandleId === handle.id ? 'target' : 'source'" 
          :position="handle.position"
          :style="getHandleStyle(handle.id)"
          @click.stop="handleClicked(handle.id)" 
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.vue-flow__node-default {
  padding: 5px;
  border: 8px solid transparent; /* Keep the same border as the maximized version */
  transition: all 0.3s ease; /* Smooth transition for minimization */
}

.vue-flow__node-default.minimized {
  width: 40px; /* Minimum size */
  height: 40px; /* Minimum size */
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center; /* Center the minimize button */
  overflow: hidden; /* Hide contents when minimized */
}

.node-controls {
  position: absolute;
  top: -10px;
  right: -10px;
  display: flex;
  gap: 5px;
}

.vue-flow__node-default.minimized .node-controls {
  position: static; /* Reset positioning for minimized state */
  display: flex;
  justify-content: center; /* Center the minimize button */
  align-items: center;
  gap: 0; /* Remove gap for a single button */
}

.twisty-node-wrapper {
  position: relative; /* For positioning radio buttons if needed */
  border: none; /* Ensure no border is applied to the wrapper */
}

.node-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: none; /* Ensure no border is applied to the content */
}

.node-controls {
  position: absolute;
  top: -10px;
  right: -10px;
  display: flex;
  gap: 5px;
}

.node-action-button { /* Common style for delete and toggle buttons */
  background-color: #6c757d; /* Grey as a base */
  color: white;
  border: 1px solid #5a6268; /* Keep the button border */
  border-radius: 50%;
  width: 26px; /* Increased size */
  height: 26px; /* Increased size */
  font-size: 16px; /* Slightly larger font size */
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 1;
}

.node-action-button:hover {
  opacity: 0.8;
}

.delete-node-button {
  background-color: #d9534f; /* Duller red */
  border-color: #d43f3a;
}

.delete-node-button:hover {
  background-color: #c9302c; /* Darker dull red */
}

.toggle-button {
  /* Uses .node-action-button base style */
}

.node-alg-label {
  font-size: 2em; /* Increased font size for better visibility */
  padding: 0px;
  text-align: center; /* Center the algorithm text */
  max-width: 300px; /* Constrain the width of the label */
  overflow-wrap: break-word; /* Wrap long words/algs */
  word-break: break-word; /* Ensure breaking for very long non-space strings */
  color: #f0f0f0; /* Light text color */
  line-height: 1.75; /* Adjust line height for better readability */
}

.twisty-container {
  position: relative;
}

.vue-flow__node-custom {
  background: purple;
  color: white;
  border: 1px solid purple;
  border-radius: 4px;
  box-shadow: 0 0 0 1px purple;
  padding: 8px;
}

:deep(.highlight) { /* General highlight styles, specific colors are now inline */
  padding: 0 2px; /* Example: add some horizontal padding */
  border-radius: 3px; /* Example: slightly rounded corners for the highlight */
}

:deep(.vue-flow__handle) {
  width: 20px !important;
  height: 20px !important;
  border-radius: 4px !important;
  cursor: pointer !important; /* Indicate handles are clickable */
}

/* Positioning for handles relative to the node center might need adjustment */
:deep(.vue-flow__handle-top) { top: -5px !important; }
:deep(.vue-flow__handle-bottom) { bottom: -5px !important; }
:deep(.vue-flow__handle-left) { left: -5px !important; }
:deep(.vue-flow__handle-right) { right: -5px !important; }
</style>