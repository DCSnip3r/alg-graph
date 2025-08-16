<script setup lang="ts">
import { computed } from 'vue';
import { Handle, Position } from '@vue-flow/core';
import type { NodeProps } from '@vue-flow/core';
import type { DefineComponent } from 'vue';
// import type { NodeData, NodeStyle } from '../types/NodeTypes';

// Extend NodeProps to include the style property
interface ExtendedNodeProps extends NodeProps {
  style?: {
    borderColor?: string;
    borderWidth?: string;
    borderStyle?: string;
    borderRadius?: string;
  };
}

import Twisty from './Twisty.vue';
const TwistyComponent = Twisty as DefineComponent<{}, {}, any>; // Explicitly type the Twisty component
import { useColorUtils } from '../composables/useColorUtils'; // Import the composable

const props = defineProps<ExtendedNodeProps>(); // Use the extended type
const emit = defineEmits(['setTargetHandle', 'delete-node', 'toggle-collapse']); // Ensure 'delete-node' is emitted
const { colorizeLabel } = useColorUtils(); // Use the composable

const isCollapsed = computed(() => props.data?.collapsed || false);

const toggleCollapse = () => {
  emit('toggle-collapse', props.id);
};

const onDeleteNode = () => {
  emit('delete-node', props.id); // Emit the delete-node event with the node ID
};

const computedLabel = computed(() => {
  return colorizeLabel(props.data.label || ''); // Use the composable function
});
// Confluence badge feature removed

// Define all potential handles for this node type
const potentialHandles = [
  { id: 'handle-t', position: Position.Top, name: 'Top' },
  { id: 'handle-b', position: Position.Bottom, name: 'Bottom' },
  { id: 'handle-l', position: Position.Left, name: 'Left' },
  { id: 'handle-r', position: Position.Right, name: 'Right' },
];

const handleClicked = (clickedHandleId: string) => {
  if (isCollapsed.value) return; // Disable handle adjustment if the node is minimized
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
    :class="{ minimized: isCollapsed }" 
    :style="{ borderColor: props.style?.borderColor || '#ffffff' }"
  >
    <div class="node-content">
      <div class="node-controls">
        <button class="toggle-button node-action-button" @click="toggleCollapse" :title="!isCollapsed ? 'Collapse Node' : 'Expand Node'">
          {{ !isCollapsed ? '−' : '+' }}
        </button>
        <button 
          v-if="!isCollapsed" 
          class="delete-node-button node-action-button" 
          @click="onDeleteNode" 
          title="Delete Node"
        >
          X
        </button>
      </div>
      <div v-if="!isCollapsed" class="node-alg-label" v-html="computedLabel"></div>
      <div class="twisty-container" v-if="!isCollapsed">
        <TwistyComponent :alg="props.data.alg"/>
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
  <!-- Confluence badge removed -->
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
/* Confluence badge styles removed */

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