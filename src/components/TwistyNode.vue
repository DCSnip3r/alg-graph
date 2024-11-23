<script setup lang="ts">
import { ref } from 'vue';
import { Handle, Position } from '@vue-flow/core';
import type { NodeProps } from '@vue-flow/core';
import Twisty from './Twisty.vue';

const props = defineProps<NodeProps>();
const isVisible = ref(true);

const toggleVisibility = () => {
  isVisible.value = !isVisible.value;
};
</script>

<template>
  <div class="vue-flow__node-default">
    <div>
      <div v-if="isVisible">{{ data.label }}</div>
      <div class="twisty-container">
        <Twisty v-if="isVisible" :alg="props.data.alg"/>
        <button class="toggle-button" @click="toggleVisibility">{{ isVisible ? '-' : '+' }}</button>
      </div>
      <Handle id="source-d" type="source" :position="Position.Bottom" />
      <Handle id="source-u" type="source" :position="Position.Top" />
      <Handle id="source-l" type="source" :position="Position.Left" />
      <Handle id="source-r" type="source" :position="Position.Right" />
      <Handle id="target-u" type="target" :position="Position.Top" />
      <Handle id="target-d" type="target" :position="Position.Bottom" />
      <Handle id="target-l" type="target" :position="Position.Left" />
      <Handle id="target-r" type="target" :position="Position.Right" />
    </div>
  </div>
</template>

<style scoped>
.vue-flow__node-default {
  /* display: flex;
  flex-direction: column; */
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

/* import the necessary styles for Vue Flow to work */

/* Use a purple theme for our custom node */
.vue-flow__node-custom {
    background: purple;
    color: white;
    border: 1px solid purple;
    border-radius: 4px;
    box-shadow: 0 0 0 1px purple;
    padding: 8px;
}
</style>