<template>
  <div class="submenu">
    <CollapsibleHeader title="Tree Generator" v-model="isVisible" />
    <div v-if="isVisible" class="submenu-content">
      <p class="description">
        Generate a hierarchical tree of algorithm permutations with automatic confluence detection.
      </p>
      <button @click="openModal" class="generate-tree-btn">
        🌳 Open Tree Generator
      </button>
      
      <div class="info-box">
        <h5>How it works:</h5>
        <ul>
          <li>Select a starting node</li>
          <li>Define levels with comma-separated algorithms</li>
          <li>Creates all permutations level-by-level</li>
          <li>Automatically detects and handles confluence</li>
          <li>Smart 2D layout based on child count</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CollapsibleHeader from '../shared/CollapsibleHeader.vue';

const isVisible = ref(false);

const emit = defineEmits<{
  'open-tree-generator': [];
}>();

function openModal() {
  emit('open-tree-generator');
}
</script>

<style scoped>
.submenu {
  margin-bottom: 10px;
}

.submenu-content {
  padding: 10px 0;
}

.description {
  color: #aaa;
  font-size: 0.9rem;
  margin-bottom: 15px;
  line-height: 1.4;
}

.generate-tree-btn {
  width: 100%;
  padding: 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.generate-tree-btn:hover {
  background-color: #45a049;
}

.info-box {
  margin-top: 15px;
  padding: 12px;
  background-color: #1a1a1a;
  border: 1px solid #444;
  border-radius: 4px;
}

.info-box h5 {
  margin: 0 0 8px 0;
  color: #4CAF50;
  font-size: 0.95rem;
}

.info-box ul {
  margin: 0;
  padding-left: 20px;
  color: #ccc;
  font-size: 0.85rem;
}

.info-box li {
  margin-bottom: 5px;
}
</style>
