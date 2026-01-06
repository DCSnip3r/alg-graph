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
        <button
          class="delete-btn"
          @click="algStore.deletePreset(algEntry.id)"
          title="Delete this algorithm"
        >
          ×
        </button>
        <button
          class="mirror-btn"
          @click="onMirrorAlg(algEntry)"
          title="Mirror this algorithm"
        >
          M
        </button>
        <button
          class="invert-btn"
          @click="onInvertAlg(algEntry)"
          title="Invert this algorithm"
        >
          i
        </button>
        <input type="text" v-model="algEntry.algorithm" placeholder="Algorithm (e.g., R U R' U')">
        <input type="text" v-model="algEntry.name" placeholder="Shorthand Name (e.g., Sune)">
        <input type="color" v-model="algEntry.color" title="Algorithm Color">
      </div>
      <button @click="algStore.addPreset()">Add Algorithm</button>

      <!-- Tree Generator Subsection -->
      <div>
        <button @click="openTreeGenerator" class="generate-tree-btn">
          🌳 Open Tree Generator
        </button>
      </div>

      <!-- Confluence Settings (Collapsible) -->
      <div class="subsection">
        <CollapsibleHeader title="Confluence Settings" v-model="confluenceVisible" />
        <div v-if="confluenceVisible" class="confluence-settings">
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CollapsibleHeader from '../shared/CollapsibleHeader.vue';
import { useAlgPresetsStore } from '../../stores/algPresetsStore';
import { useDisplaySettingsStore } from '../../stores/displaySettingsStore';
import { useDragAndDrop } from '../../composables/useDragAndDrop';
import { useAlg } from '../../composables/useAlg';
import { useColorUtils } from '../../composables/useColorUtils';
const { mirrorColor, invertColor } = useColorUtils();

const isVisible = ref(true);
const confluenceVisible = ref(false);
const algStore = useAlgPresetsStore();
const displaySettingsStore = useDisplaySettingsStore();
const { onDragStart } = useDragAndDrop();
const { mirrorAlg, invertAlg } = useAlg();

const emit = defineEmits<{
  'open-tree-generator': [];
}>();

function openTreeGenerator() {
  emit('open-tree-generator');
}

const defaultSwapPair: [string, string] = ["F", "B"];

function onMirrorAlg(algEntry: { algorithm: string, name: string, color: string }) {
  const mirroredAlg = mirrorAlg(algEntry.algorithm, defaultSwapPair);
  algStore.addPreset({
    algorithm: mirroredAlg.toString(),
    name: `Mirror ${algEntry.name}`,
    color: mirrorColor(algEntry.color)
  });
}

function onInvertAlg(algEntry: { algorithm: string, name: string, color: string }) {
  // Use Alg's invert method directly
  const invertedAlg = invertAlg(algEntry.algorithm)

  algStore.addPreset({
    algorithm: invertedAlg.toString(),
    name: `Inverse ${algEntry.name}`,
    color: invertColor(algEntry.color)
  });
}
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

.delete-btn {
  border: none;
  border-radius: 50%;
  width: 1em;
  height: 1em;
  font-size: 1em;
  font-weight: bold;
  margin-right: 0.5em;
  cursor: pointer;
  color: #fff;
  background: #c00;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: filter 0.2s;
}
.delete-btn:hover {
  filter: brightness(1.2);
}

.mirror-btn,
.invert-btn {
  border: none;
  border-radius: 50%;
  width: 1em;
  height: 1em;
  font-weight: bold;
  font-size: 0.8em;
  margin-right: 0.5em;
  cursor: pointer;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: filter 0.2s;
  background: #222;
}
.mirror-btn:hover,
.invert-btn:hover {
  filter: brightness(1.2);
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

.subsection {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #444;
}

.subsection h5 {
  margin: 0 0 8px 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.description {
  color: #aaa;
  font-size: 0.85rem;
  margin-bottom: 10px;
  line-height: 1.4;
}

.generate-tree-btn {
  padding: 5px;
  margin-top: 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;  font-size: 0.75rem;
  transition: background-color 0.2s;
}

.generate-tree-btn:hover {
  background-color: #45a049;
}

.confluence-settings {
  padding: 10px 0;
}

.setting-item {
  margin: 8px 0;
  text-align: left;
}

.inline-setting {
  display: flex;
  align-items: center;
  gap: 8px;
}

.inline-setting label {
  margin: 0;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
</style>
