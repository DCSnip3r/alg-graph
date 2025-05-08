<template>
  <div class="collapsible-header" @click="toggle">
    <h4>{{ title }}</h4>
    <span class="chevron" :class="{ 'rotated': !modelValue }">▲</span>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
  title: string;
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const toggle = () => {
  emit('update:modelValue', !props.modelValue);
};
</script>

<style scoped>
.collapsible-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-weight: bold;
  user-select: none;
  padding: 5px 10px; /* Add padding for better click area */
}

.collapsible-header h4 {
  margin: 4px; /* Remove default margins */
  font-size: 1rem; /* Adjust font size for better spacing */
  line-height: 1.2; /* Reduce line height for compactness */
}

.collapsible-header .chevron {
  transition: transform 0.2s ease;
}

.collapsible-header .chevron.rotated {
  transform: rotate(180deg);
}
</style>
