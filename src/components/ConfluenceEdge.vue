<script setup lang="ts">
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@vue-flow/core';
import { computed } from 'vue';
import { useColorUtils } from '../composables/useColorUtils';
import { useDisplaySettingsStore } from '../stores/displaySettingsStore';
import { useSizeScaling } from '../composables/useSizeScaling';

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

// Dynamic scaling using composable
const { scaledEm, scaled, scaledSquareButton } = useSizeScaling(350);
const dynamicFontSize = computed(() => scaledEm(1.75, { min: 0.8, max: 2.0 }));
const dynamicWidth = computed(() => scaled(350, { min: 160, max: 430 }));
const deleteButtonStyle = computed(() => {
  const base = scaledSquareButton(28, 18, { minSize: 18, maxSize: 32, minFont: 12, maxFont: 20 });
  return {
    ...base,
    position: 'absolute' as const,
    top: '50%',
    right: '4px',
    transform: 'translateY(-50%)',
  };
});
</script>

<template>
  <BaseEdge :id="props.id" :style="{ ...(props.style||{}), strokeDasharray: '5 5', stroke: backgroundColor, strokeWidth: 3 }" :path="path[0]" :marker-end="props.markerEnd" />
  <EdgeLabelRenderer>
    <div
      v-if="!shouldHideLabel"
      class="nodrag nopan confluence-edge-label"
      :style="{ position: 'absolute', transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`, backgroundColor: backgroundColor, color: textColor, pointerEvents: 'all', fontSize: dynamicFontSize, width: dynamicWidth + 'px' }"
      :title="tooltip"
    >
  <span class="confluence-label-text">{{ algorithmString }}</span>
  <button class="delete-confluence-edge" :style="deleteButtonStyle" title="Delete confluence edge" @click="onDelete">×</button>
    </div>
  </EdgeLabelRenderer>
</template>

<style scoped>
.confluence-edge-label { border: 3px dashed currentColor; border-radius: 6px; padding: 6px 8px; line-height: 1.25; word-break: break-word; position: relative; box-shadow: 0 4px 10px rgba(0,0,0,0.35); backdrop-filter: blur(3px); z-index: 10; transition: box-shadow .18s ease, transform .18s ease; overflow: visible; }
.confluence-edge-label:hover {
  box-shadow: 0 6px 14px rgba(0,0,0,0.5);
  transform: translateY(-2px);
}
.confluence-label-text { pointer-events: none; }
.delete-confluence-edge { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.55); color: #fff; border: 1px solid rgba(255,255,255,0.4); border-radius: 50%; cursor: pointer; line-height: 1; display: flex; align-items: center; justify-content: center; padding: 0; transition: background .15s ease, transform .15s ease; }
.delete-confluence-edge:hover { background: rgba(0,0,0,0.75); transform: scale(1.05); }
.delete-confluence-edge:active { transform: scale(0.92); }
</style>
