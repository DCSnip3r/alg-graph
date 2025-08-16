<script setup lang="ts">
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@vue-flow/core';
import { computed } from 'vue';
import { useColorUtils } from '../composables/useColorUtils';
import { useDisplaySettingsStore } from '../stores/displaySettingsStore';

interface ConfluenceEdgeData {
  algorithm?: string;
  confluence?: boolean;
  aufVariant?: string;
}

const props = defineProps<EdgeProps<ConfluenceEdgeData>>();
const emit = defineEmits(['delete-edge']);

const path = computed(() => getBezierPath(props));
const { getBackgroundColorForAlgorithm, getTextColorForBackground } = useColorUtils();
const displaySettings = useDisplaySettingsStore();

const algorithmString = computed(() => props.data?.algorithm || props.label || '');
// Always compute the color for the algorithm; the toggle should only hide the label, not remove edge styling.
const backgroundColor = computed(() => getBackgroundColorForAlgorithm(String(algorithmString.value)));
const textColor = computed(() => getTextColorForBackground(backgroundColor.value));
// Mirror SpecialEdge behavior: when colorized labels are disabled, just hide the label container (keep colored stroke)
const shouldHideLabel = computed(() => !displaySettings.showColorizedEdgeLabels && backgroundColor.value !== '#ffffff');

const tooltip = computed(() => {
  const target = props.target;
  const variant = props.data?.aufVariant && props.data.aufVariant !== 'exact' ? props.data.aufVariant : 'exact';
  return `Confluent with node ${target}. AUF variant: ${variant}`;
});

const onDelete = (e: MouseEvent) => {
  e.stopPropagation();
  emit('delete-edge', props.id);
};
</script>

<template>
  <BaseEdge :id="props.id" :style="{ ...(props.style||{}), strokeDasharray: '5 5', stroke: backgroundColor, strokeWidth: 3 }" :path="path[0]" :marker-end="props.markerEnd" />
  <EdgeLabelRenderer>
    <div
      v-if="!shouldHideLabel"
      class="nodrag nopan confluence-edge-label"
      :style="{ position: 'absolute', transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`, backgroundColor: backgroundColor, color: textColor, pointerEvents: 'all',}"
      :title="tooltip"
    >
      <span class="confluence-label-text">{{ algorithmString }}</span>
      <button class="delete-confluence-edge" title="Delete confluence edge" @click="onDelete">×</button>
    </div>
  </EdgeLabelRenderer>
</template>

<style scoped>
.confluence-edge-label {
  border: 3px dashed currentColor;
  border-radius: 6px;
  padding: 6px 42px 6px 8px; /* space for delete button */
  font-size: 1.75em; /* match special edge */
  line-height: 1.25;
  width: 350px; /* match special edge fixed width */
  word-break: break-word;
  position: relative;
  box-shadow: 0 4px 10px rgba(0,0,0,0.35);
  backdrop-filter: blur(3px);
  z-index: 10;
  transition: box-shadow .18s ease, transform .18s ease;
}
.confluence-edge-label:hover {
  box-shadow: 0 6px 14px rgba(0,0,0,0.5);
  transform: translateY(-2px);
}
.confluence-label-text { pointer-events: none; }
.delete-confluence-edge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0,0,0,0.55);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.4);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  line-height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: background .15s ease, transform .15s ease;
}
.delete-confluence-edge:hover { background: rgba(0,0,0,0.75); transform: scale(1.05); }
.delete-confluence-edge:active { transform: scale(0.92); }
</style>
