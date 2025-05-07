<script setup lang="ts">
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@vue-flow/core'
import { computed, ref, watch, defineEmits } from 'vue' // Added ref, watch, defineEmits
import { useAlgPresetsStore } from '../stores/algPresetsStore'; // Import the presets store

interface SpecialEdgeData {
  algorithm?: string;
}

const props = defineProps<EdgeProps<SpecialEdgeData>>()
const emit = defineEmits(['update:algorithm'])

const path = computed(() => getBezierPath(props))

// Local state for the input, initialized from props.data.algorithm or props.label
const localAlgorithm = ref(props.data?.algorithm ?? props.label ?? '')

// Watch for prop changes to update localAlgorithm if needed (e.g., if parent updates it)
watch(() => [props.data?.algorithm, props.label], ([newAlgData, newLabel]) => {
  const propValue = newAlgData ?? newLabel ?? '';
  if (localAlgorithm.value !== propValue) {
    localAlgorithm.value = propValue;
  }
}, { immediate: true });

// Watch localAlgorithm to emit updates when it changes
watch(localAlgorithm, (newValue) => {
  // Avoid emitting if the change came from the prop update
  if (newValue !== (props.data?.algorithm ?? props.label ?? '')) {
    emit('update:algorithm', { edgeId: props.id, newAlgorithm: newValue });
  }
});

const algStore = useAlgPresetsStore(); // Use the store

const getBackgroundColorForAlgorithm = (algorithm: string): string => {
  const preset = algStore.presets.find(p => p.algorithm === algorithm);
  return preset?.color || '#ffffff'; // Default to white if no match
};

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

</script>

<template>
  <BaseEdge :id="props.id" :style="props.style" :path="path[0]" :marker-end="props.markerEnd" />

  <EdgeLabelRenderer>
    <div
      :style="{
        pointerEvents: 'all',
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
        backgroundColor: getBackgroundColorForAlgorithm(localAlgorithm.valueOf()), // Set background color dynamically
        color: getTextColorForBackground(getBackgroundColorForAlgorithm(localAlgorithm.valueOf())), // Set text color dynamically
      }"
      class="nodrag nopan edge-label-container"
    >
      <!-- Display algorithm as text input -->
      <input
        type="text"
        v-model="localAlgorithm"
        class="edge-algorithm-input"
        placeholder="alg"
      />
    </div>
  </EdgeLabelRenderer>
</template>

<style scoped>
.edge-label-foreignobject {
  overflow: visible;
}

.edge-label-container {
  background: var(--vf-node-bg, #ffffff); /* Use Vue Flow's node background variable */
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 1.75em; /* Adjusted to a more reasonable size */
  color: var(--vf-node-text, #000000); /* Use Vue Flow's node text color variable */
  text-align: center;
  width: 350px; /* Fixed width for simplicity */
  overflow-wrap: break-word;
  word-break: break-word;
  white-space: normal; /* Allow wrapping */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Add a subtle shadow for better visibility */
}

.edge-algorithm-input {
  background-color: transparent;
  border: none;
  text-align: center;
  width: 100%; /* Match the container's width */
  color: inherit; /* Inherit the text color from the container */
  font-size: inherit; /* Match the font size of the container */
  padding: 1px;
}

.edge-algorithm-input:focus {
  outline: 1px solid var(--vf-connection-path, #007bff); /* Use Vue Flow's connection path color */
  background-color: var(--vf-node-bg, #f0f0f0); /* Use Vue Flow's node background variable */
}
</style>