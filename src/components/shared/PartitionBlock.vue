<template>
  <div class="partition-block">
    <div 
      v-if="heading" 
      class="block-heading-wrapper" 
      :class="{ 'collapsible': collapsible }"
      @click="collapsible ? toggle() : null"
    >
      <div class="block-heading">{{ heading }}</div>
      <span v-if="collapsible" class="chevron" :class="{ 'rotated': !isExpanded }">▲</span>
    </div>
    <div v-if="!collapsible || isExpanded" class="block-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = withDefaults(defineProps<{
  heading?: string;
  collapsible?: boolean;
  modelValue?: boolean;
}>(), {
  heading: '',
  collapsible: false,
  modelValue: true
});

const emit = defineEmits(['update:modelValue']);

const isExpanded = ref(props.modelValue);

watch(() => props.modelValue, (newVal) => {
  isExpanded.value = newVal;
});

const toggle = () => {
  isExpanded.value = !isExpanded.value;
  emit('update:modelValue', isExpanded.value);
};
</script>

<style scoped>
.partition-block {
  background: #1f1f1f;
  padding: 8px 10px 10px;
  border-radius: 6px;
  box-shadow: 0 0 0 1px #2e2e2e inset;
  margin: 8px 4px;
}

.partition-block:first-of-type {
  margin-top: 6px;
}

.block-heading-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.block-heading-wrapper.collapsible {
  cursor: pointer;
  user-select: none;
}

.block-heading {
  font-size: 0.55rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  opacity: 0.75;
  margin: 0 0 6px;
  font-weight: 600;
}

.block-heading-wrapper .block-heading {
  margin-bottom: 0;
}

.block-heading-wrapper + .block-content {
  margin-top: 6px;
}

.chevron {
  transition: transform 0.2s ease;
  font-size: 0.7rem;
  opacity: 0.75;
}

.chevron.rotated {
  transform: rotate(180deg);
}

.block-content :deep(.setting-item) {
  margin: 6px 0;
  padding-left: 0;
}

.block-content :deep(.inline-setting) {
  gap: 8px;
}
</style>
