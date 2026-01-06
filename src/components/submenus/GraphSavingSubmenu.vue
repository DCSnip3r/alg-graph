<template>
  <div class="submenu">
    <CollapsibleHeader title="Graph Management" v-model="isVisible" />
  <div v-if="isVisible" class="submenu-content">
      <!-- Save Current Graph -->
      <PartitionBlock heading="Save Current">
        <div class="save-graph-controls">
          <input type="text" v-model="graphNameToSave" placeholder="Graph Name">
          <button @click="handleSaveGraph" class="save-graph-button">Save Current Graph</button>
        </div>
        <div v-if="props.saveStatus && props.saveStatus.type === 'success'" class="save-feedback success">
          {{ props.saveStatus.message }}
        </div>
      </PartitionBlock>

      <!-- Saved Graphs List -->
      <PartitionBlock heading="Saved Graphs" :collapsible="true">
        <div class="saved-graph-section">
          <ul v-if="savedGraphsStore.savedGraphsManifest.length > 0">
            <li v-for="graph in savedGraphsStore.savedGraphsManifest" :key="graph.name" class="saved-graph-entry">
              <span>{{ graph.name }} ({{ new Date(graph.savedAt).toLocaleDateString() }})</span>
              <div class="saved-graph-actions">
                <button @click="handleLoadGraph(graph.name)" class="load-button">Load</button>
                <button @click="handleDownloadGraph(graph.name)" class="download-button">Download</button>
                <button @click="handleDeleteGraph(graph.name)" class="delete-button">Delete</button>
              </div>
            </li>
          </ul>
          <p v-else>No graphs saved yet.</p>
          
          <!-- Upload Button moved here -->
          <div class="upload-graph-section">
            <input type="file" ref="fileInputRef" @change="handleFileUpload" accept=".json" style="display: none;">
            <button @click="triggerFileInput" class="upload-button">Upload .json file</button>
          </div>
        </div>
      </PartitionBlock>

      <!-- Example Graphs -->
      <PartitionBlock heading="Examples">
        <div class="example-graphs-section">
          <ul v-if="exampleGraphs.length > 0" class="example-graph-list">
            <li v-for="eg in exampleGraphs" :key="eg.name" class="example-graph-chip">
              <button @click="handleLoadExampleGraph(eg.graph)" class="example-graph-chip-button">
                {{ eg.name }}
              </button>
            </li>
          </ul>
          <p v-else>No example graphs found.</p>
        </div>
      </PartitionBlock>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CollapsibleHeader from '../shared/CollapsibleHeader.vue';
import PartitionBlock from '../shared/PartitionBlock.vue';
import { useSavedGraphsStore } from '../../stores/savedGraphsStore';
import { useGraphManagement } from '../../composables/useGraphManagement';

const isVisible = ref(true);
const props = defineProps<{
  saveStatus: { message: string, type: 'success' | 'error' } | null;
}>();

const emit = defineEmits(['save-graph-request', 'load-graph-request', 'load-graph-from-file-request']);

const savedGraphsStore = useSavedGraphsStore();
const {
  graphNameToSave,
  fileInputRef,
  handleSaveGraph,
  handleLoadGraph,
  handleDownloadGraph,
  handleDeleteGraph,
  triggerFileInput,
  handleFileUpload,
  exampleGraphs,
  handleLoadExampleGraph // import from useGraphManagement
} = useGraphManagement(emit);
</script>

<style scoped>
.save-graph-controls {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
  margin: 10px; /* Align with the rest of the content */
}

.save-graph-button {
  background-color: #28a745; /* Green background */
  color: white;
  border: none;
  padding: 4px 8px; /* Match the height of action buttons */
  font-size: 0.9em;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.save-graph-button:hover {
  background-color: #218838; /* Darker green on hover */
}

.save-feedback {
  width: 100%;
  padding: 5px;
  margin-top: 5px;
  border-radius: 3px;
  font-size: 0.9em;
  text-align: center;
  box-sizing: border-box;
}

.save-feedback.success {
  background-color: #28a745;
  color: white;
}

.saved-graph-section {
  margin-top: 15px; /* Add spacing above the section */
}

.upload-graph-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #444;
}

.saved-graph-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  margin: 0;
  list-style-type: none;
}

.saved-graph-actions button {
  margin-left: 5px;
  padding: 4px 8px;
  font-size: 0.9em;
}

.load-button {
  background-color: #218838; /* Dark green background */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.load-button:hover {
  background-color: #1e7e34; /* Darker green on hover */
}

.upload-graph-section {
  margin-top: 15px; /* Add spacing above the section */
}

.upload-button {
  background-color: #6c757d; /* Grey background */
  color: white;
  border: none;
  padding: 8px 12px;
  font-size: 0.9em;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  width: 100%;
}

.upload-button:hover {
  background-color: #5a6268; /* Darker grey on hover */
}

.download-button {
  background-color: #17a2b8;
  color: white;
}

.download-button:hover {
  background-color: #138496;
}

.delete-button {
  background-color: #dc3545;
}

.delete-button:hover {
  background-color: #c82333;
}

.example-graphs-section {
  margin-top: 15px;
}

.example-graph-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  list-style: none;
  padding: 0;
  margin: 0;
  align-items: center;
  max-width: 400px; /* Limit the width of the chip container */
}

.example-graph-chip {
  margin: 0;
  padding: 0;
  display: inline-block;
}

.example-graph-chip-button {
  display: inline-block;
  background: #e3f2fd;
  border: none;
  color: #1976d2;
  padding: 2px 10px;
  border-radius: 16px;
  font-size: 0.95em;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(25, 118, 210, 0.08);
  transition: background 0.2s, color 0.2s;
  min-width: 0;
  width: auto;
  overflow: hidden;
  text-overflow: ellipsis;
}

.example-graph-chip-button:hover {
  background: #bbdefb;
  color: #0d47a1;
}

</style>
