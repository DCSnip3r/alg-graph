<template>
  <div class="menu-overlay" :class="{ 'is-collapsed': !isVisible }">
    <div class="menu-header" @click="toggleVisibility">
      <span>{{ isVisible ? 'Collapse Menu' : 'Expand Menu' }}</span>
      <span class="chevron" :class="{ 'rotated': isVisible }">▼</span>
    </div>
    <div v-show="isVisible" class="menu-content-wrapper">
      <hr class="submenu-divider" />
      <AlgorithmsSubmenu @open-tree-generator="emit('open-tree-generator')" />
      <hr class="submenu-divider" />
      <GraphSavingSubmenu 
        :saveStatus="props.saveStatus" 
        @save-graph-request="emit('save-graph-request', $event)"
        @load-graph-request="emit('load-graph-request', $event)"
        @load-graph-from-file-request="emit('load-graph-from-file-request', $event)"
      />
      <hr class="submenu-divider" />
      <DisplayAndLayoutSubmenu
        @auto-layout-request="emit('auto-layout-request')"
        @custom-layout-request="emit('custom-layout-request', $event)"
        @snap-to-grid-request="emit('snap-to-grid-request', $event)"
        @scale-graph-request="emit('scale-graph-request', $event)"
        @render-3d-request="emit('render-3d-request')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCollapsible } from '../composables/useCollapsible';
import AlgorithmsSubmenu from './submenus/AlgorithmsSubmenu.vue';
import GraphSavingSubmenu from './submenus/GraphSavingSubmenu.vue';
import DisplayAndLayoutSubmenu from './submenus/DisplayAndLayoutSubmenu.vue';

const props = defineProps<{
  saveStatus: { message: string, type: 'success' | 'error' } | null;
}>();

const emit = defineEmits(['save-graph-request', 'load-graph-request', 'load-graph-from-file-request', 'auto-layout-request', 'custom-layout-request', 'snap-to-grid-request', 'scale-graph-request', 'render-3d-request', 'open-tree-generator']);

const { isVisible, toggleVisibility } = useCollapsible(true);
</script>

<style scoped>
.menu-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #2c2c2c;
  border: 1px solid #444;
  padding: 10px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #f0f0f0;
  border-radius: 5px;
  transition: padding 0.2s ease-in-out, background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
  min-width: fit-content;
}

.menu-overlay.is-collapsed {
  padding: 0;
  background-color: transparent;
  border-color: transparent;
  gap: 0;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-weight: bold;
  user-select: none;
  padding: 5px 5px; /* Add padding for better click area */
}

.menu-header span {
  margin: 8px; /* Remove default margins */
  font-size: 1rem; /* Adjust font size for better spacing */
  line-height: 1.2; /* Reduce line height for compactness */
}

.menu-header .chevron {
  transition: transform 0.2s ease;
}

.menu-header .chevron.rotated {
  transform: rotate(180deg);
}

.menu-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.submenu-divider {
  border: none;
  border-top: 1px solid #444;
  margin: 5px 0;
}
</style>