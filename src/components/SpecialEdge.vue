<script setup lang="ts">
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@vue-flow/core';
import { computed, ref, watch } from 'vue';
import { useColorUtils } from '../composables/useColorUtils';
import { useDisplaySettingsStore } from '../stores/displaySettingsStore';

interface SpecialEdgeData {
  algorithm?: string;
}

const props = defineProps<EdgeProps<SpecialEdgeData>>();
const emit = defineEmits(['update:algorithm']);

const path = computed(() => getBezierPath(props));

// Local state for the input, initialized from props.data.algorithm or props.label
const localAlgorithm = ref(props.data?.algorithm ?? props.label ?? '');

// Watch for prop changes to update localAlgorithm if needed (e.g., if parent updates it)
watch(() => [props.data?.algorithm, props.label], ([newAlgData, newLabel]) => {
  const propValue = newAlgData ?? newLabel ?? '';
  if (localAlgorithm.value !== propValue) {
    localAlgorithm.value = propValue;
  }
}, { immediate: true });

// Watch localAlgorithm to emit updates when it changes
watch(localAlgorithm, (newValue) => {
  if (newValue !== (props.data?.algorithm ?? props.label ?? '')) {
    emit('update:algorithm', { edgeId: props.id, newAlgorithm: newValue });
  }
});

const { getTextColorForBackground, getBackgroundColorForAlgorithm } = useColorUtils();
const displaySettingsStore = useDisplaySettingsStore();

// Computed properties for background and text colors
const backgroundColor = computed(() => getBackgroundColorForAlgorithm(String(localAlgorithm.value)));
const textColor = computed(() => getTextColorForBackground(backgroundColor.value));

// Determine if the label should be hidden
const shouldHideLabel = computed(() => {
  return !displaySettingsStore.showColorizedEdgeLabels && backgroundColor.value !== '#ffffff';
});
</script>

<template>
  <BaseEdge :id="props.id" :style="props.style" :path="path[0]" :marker-end="props.markerEnd" />

  <EdgeLabelRenderer>
    <div
      v-if="!shouldHideLabel"
      :style="{
        pointerEvents: 'all',
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
        backgroundColor: backgroundColor,
        color: textColor,
      }"
      class="nodrag nopan edge-label-container"
    >
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