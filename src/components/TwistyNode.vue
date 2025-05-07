<script setup lang="ts">
import { ref, computed, defineEmits } from 'vue';
import { Handle, Position } from '@vue-flow/core';
import type { NodeProps } from '@vue-flow/core';
import Twisty from './Twisty.vue';
import { useAlgPresetsStore } from '../stores/algPresetsStore'; // Import the store

const props = defineProps<NodeProps>();
const emit = defineEmits(['setTargetHandle']);
const algStore = useAlgPresetsStore(); // Use the store

const isVisible = ref(true);

const toggleVisibility = () => {
  isVisible.value = !isVisible.value;
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
  // Emit an event to set this handle as the target for the current node
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
  <div class="vue-flow__node-default twisty-node-wrapper">
    <div>
      <div v-if="isVisible" v-html="colorizeLabel"></div>
      <div class="twisty-container">
        <Twisty v-if="isVisible" :alg="props.data.alg"/>
        <button class="toggle-button" @click="toggleVisibility">{{ isVisible ? '-' : '+' }}</button>
      </div>

      <!-- Render handles and make them clickable -->
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
  /* Ensure enough space for radio buttons if they are outside */
}

.twisty-node-wrapper {
  position: relative; /* For positioning radio buttons if needed */
   /* min-width: 150px; /* Adjust as needed */
   /* min-height: 100px; /* Adjust as needed */
}


.twisty-container {
  position: relative;
}

.toggle-button {
  position: absolute;
  bottom: 0px;
  right: 0px;
  font-size: 14px;
  background-color: rgb(0, 0, 0);
  color: white;
  border: 1px solid #ccc;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
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
  /* background-color and color will be set inline by colorizeLabel */
}

:deep(.vue-flow__handle) {
  width: 12px !important;
  height: 12px !important;
  /* backgroundColor is now controlled by inline style via getHandleStyle */
  border: 1px solid white !important;
  border-radius: 3px !important;
  cursor: pointer !important; /* Indicate handles are clickable */
}

/* Positioning for handles relative to the node center might need adjustment */
:deep(.vue-flow__handle-top) { top: -6px !important; }
:deep(.vue-flow__handle-bottom) { bottom: -6px !important; }
:deep(.vue-flow__handle-left) { left: -6px !important; }
:deep(.vue-flow__handle-right) { right: -6px !important; }

/* Removed styles for .handles-container, .handle-control-group, .handle-radio */

</style>