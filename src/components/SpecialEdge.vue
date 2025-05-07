<script setup lang="ts">
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@vue-flow/core'
import { computed, ref, watch, defineEmits } from 'vue' // Added ref, watch, defineEmits

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

</script>

<template>
  <BaseEdge :id="props.id" :style="props.style" :path="path[0]" :marker-end="props.markerEnd" />

  <EdgeLabelRenderer>
    <div
      :style="{
        pointerEvents: 'all',
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
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

<style>
.edge-label-container {
  background-color: rgba(220, 220, 220, 0.7); /* Slightly adjusted for visibility */
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 10px;
  color: #333; /* Darker text for light background */
  min-width: 10px;
  text-align: center;
}

.edge-algorithm-input {
  background-color: transparent;
  border: none;
  text-align: center;
  width: auto; /* Adjust width as needed, or make it dynamic */
  min-width: 50px; /* Minimum width */
  color: #333;
  font-size: 10px;
  padding: 1px;
}

.edge-algorithm-input:focus {
  outline: 1px solid #007bff; /* Highlight on focus */
  background-color: white;
}
</style>