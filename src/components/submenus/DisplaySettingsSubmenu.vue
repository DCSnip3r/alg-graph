<template>
  <div class="submenu">
    <CollapsibleHeader title="Display Settings" v-model="isVisible" />
    <div v-if="isVisible" class="submenu-content">
      <!-- Confluence Related Settings -->
      <PartitionBlock heading="Confluence">
        <div class="setting-item inline-setting">
          <label for="create-confluence-edges">
            <input
              id="create-confluence-edges"
              type="checkbox"
              v-model="displaySettingsStore.createConfluenceEdges"
            />
            Create confluence edges
          </label>
        </div>
        <div class="setting-item inline-setting">
          <label for="match-if-auf">
            <input
              id="match-if-auf"
              type="checkbox"
              v-model="displaySettingsStore.matchIfAUF"
            />
            Allow AUF confluence (U/U'/U2)
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
        <div class="setting-item inline-setting">
          <label for="delete-duplicate-on-confluence">
            <input
              id="delete-duplicate-on-confluence"
              type="checkbox"
              v-model="displaySettingsStore.deleteDuplicateOnConfluence"
            />
            Delete duplicate node on confluence
          </label>
        </div>
      </PartitionBlock>

      <!-- Display Toggles -->
      <PartitionBlock heading="Display">
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
          <label for="visualization-mode">Visualization Mode:</label>
          <select id="visualization-mode" v-model="displaySettingsStore.twistyVisualizationMode">
            <option value="3D">3D</option>
            <option value="experimental-2D-LL">Experimental 2D LL</option>
          </select>
        </div>
      </PartitionBlock>

      <!-- Sizing -->
      <PartitionBlock heading="Sizing">
        <div class="setting-item">
          <div class="inline-setting">
            <label for="twisty-node-size">Twisty Node Size: {{ displaySettingsStore.twistyNodeSize }}px</label>
            <input
              id="twisty-node-size"
              type="range"
              min="100"
              max="450"
              step="10"
              v-model.number="displaySettingsStore.twistyNodeSize"
            />
          </div>
          <!-- <div class="size-hint">Adjusts cube viewer & node footprint; label font scales automatically.</div> -->
        </div>
      </PartitionBlock>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CollapsibleHeader from '../shared/CollapsibleHeader.vue';
import PartitionBlock from '../shared/PartitionBlock.vue';
import { useDisplaySettingsStore } from '../../stores/displaySettingsStore';

const isVisible = ref(false);
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

.size-hint {
  font-size: 0.6rem;
  opacity: 0.7;
  margin-left: 10px;
  margin-top: 2px;
}

/* Subtle internal divider (not a full submenu separator) */
.mini-divider { height:1px; width:65%; background:linear-gradient(90deg, rgba(255,255,255,.15), rgba(255,255,255,.05)); margin:6px auto 2px; border-radius:1px; }
.group-heading { font-size:0.55rem; letter-spacing:.5px; text-transform:uppercase; opacity:.75; margin:0 0 4px 6px; }
</style>
