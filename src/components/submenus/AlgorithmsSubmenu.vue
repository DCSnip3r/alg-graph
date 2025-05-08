<template>
  <div class="submenu">
    <CollapsibleHeader title="Algorithms" v-model="isVisible" />
    <div v-if="isVisible" class="submenu-content">
      <h5>User-Defined Algorithms (Drag in to add node)</h5>
      <div 
        v-for="(algEntry) in algStore.presets" 
        :key="algEntry.id" 
        class="algorithm-entry"
        draggable="true"
        @dragstart="onDragStart($event, algEntry)"
      >
        <input type="text" v-model="algEntry.algorithm" placeholder="Algorithm (e.g., R U R' U')">
        <input type="text" v-model="algEntry.name" placeholder="Shorthand Name (e.g., Sune)">
        <input type="color" v-model="algEntry.color" title="Algorithm Color">
      </div>
      <button @click="algStore.addPreset">Add Algorithm</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CollapsibleHeader from '../shared/CollapsibleHeader.vue';
import { useAlgPresetsStore } from '../../stores/algPresetsStore';
import { useDragAndDrop } from '../../composables/useDragAndDrop';

const isVisible = ref(true);
const algStore = useAlgPresetsStore();
const { onDragStart } = useDragAndDrop();
</script>

<style scoped>
.algorithm-entry {
  display: flex;
  gap: 5px;
  align-items: center;
  padding: 5px;
  border: 1px dashed transparent;
  cursor: grab;
}

.algorithm-entry:hover {
  border-color: #555;
}

.algorithm-entry input[type="text"] {
  flex-grow: 1;
  padding: 5px;
  background-color: #333;
  color: #f0f0f0;
  border: 1px solid #555;
  border-radius: 3px;
}

.algorithm-entry input[type="text"]::placeholder {
  color: #888;
}

.algorithm-entry input[type="color"] {
  padding: 0;
  border: 1px solid #555;
  border-radius: 3px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  background-color: #333;
}
</style>
