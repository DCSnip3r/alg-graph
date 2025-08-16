<template>
  <div class="submenu">
    <CollapsibleHeader title="Display Settings" v-model="isVisible" />
    <div v-if="isVisible" class="submenu-content">
      <div class="setting-item inline-setting">
        <label for="colorized-edge-labels">
          <input 
            id="colorized-edge-labels"
            type="checkbox" 
            v-model="displaySettingsStore.showColorizedEdgeLabels" 
          />
          Show colorized edge labels
        </label>
      </div>
      <div class="setting-item inline-setting">
        <label for="reposition-on-confluence">
          <input
            id="reposition-on-confluence"
            type="checkbox"
            v-model="displaySettingsStore.repositionOnConfluence"
          />
          Auto-reposition node on confluent algorithm
        </label>
      </div>
      <div class="setting-item inline-setting" style="margin-left: 24px;">
        <label for="match-if-auf">
          <input
            id="match-if-auf"
            type="checkbox"
            v-model="displaySettingsStore.matchIfAUF"
          />
          Allow AUF confluence (U/U'/U2)
        </label>
      </div>
      <div class="setting-item inline-setting" style="margin-left: 24px;">
        <label for="create-confluence-edges">
          <input
            id="create-confluence-edges"
            type="checkbox"
            v-model="displaySettingsStore.createConfluenceEdges"
          />
          Create confluence edges
        </label>
      </div>
      <div class="setting-item">
        <div class="inline-setting">
          <label for="visualization-mode">Visualization Mode:</label>
          <select id="visualization-mode" v-model="displaySettingsStore.twistyVisualizationMode">
            <option value="3D">3D</option>
            <option value="experimental-2D-LL">Experimental 2D LL</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CollapsibleHeader from '../shared/CollapsibleHeader.vue';
import { useDisplaySettingsStore } from '../../stores/displaySettingsStore';

const isVisible = ref(true);
const displaySettingsStore = useDisplaySettingsStore();
</script>

<style scoped>
.display-settings-section {
  border-top: 1px solid #444;
  padding-top: 10px;
  margin-top: 10px;
}

.display-settings-section .setting-item {
  margin-bottom: 10px;
}

.display-settings-section .inline-setting {
  display: flex;
  align-items: center;
  gap: 10px;
}

.display-settings-section .inline-setting label {
  margin: 0;
  white-space: nowrap;
}

.submenu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-weight: bold;
  user-select: none;
}

.submenu-header .chevron {
  transition: transform 0.2s ease;
}

.submenu-header .chevron.rotated {
  transform: rotate(180deg);
}

.setting-item {
  margin: 10px 0; /* Add vertical space */
  text-align: left; /* Align items to the left */
  padding-left: 10px; /* Align horizontally with other elements */
}

.inline-setting {
  display: flex;
  align-items: center;
  gap: 10px;
}

.inline-setting label {
  margin: 0;
  white-space: nowrap;
}
</style>
