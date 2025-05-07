<template>
  <div class="menu-overlay" :class="{ 'is-collapsed': !menuContentVisible }">
    <button @click="toggleMenuContent">
      {{ menuContentVisible ? 'Collapse' : 'Expand' }}
    </button>
    
    <div v-if="menuContentVisible" class="menu-content-wrapper">
      <div class="algorithms-section">
        <h4>User-Defined Algorithms (Drag to add)</h4>
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

      <div class="graphs-management-section">
        <h4>Manage Graphs</h4>
        <div class="save-graph-controls">
          <input type="text" v-model="graphNameToSave" placeholder="Graph Name">
          <button @click="handleSaveGraph">Save Current Graph</button>
        </div>
        <div v-if="props.saveStatus && props.saveStatus.type === 'success'" class="save-feedback success">
          {{ props.saveStatus.message }}
        </div>
        
        <h5>Saved Graphs:</h5>
        <ul v-if="savedGraphsStore.savedGraphsManifest.length > 0">
          <li v-for="graph in savedGraphsStore.savedGraphsManifest" :key="graph.name" class="saved-graph-entry">
            <span>{{ graph.name }} ({{ new Date(graph.savedAt).toLocaleDateString() }})</span>
            <div class="saved-graph-actions">
              <button @click="handleLoadGraph(graph.name)">Load</button>
              <button @click="handleDownloadGraph(graph.name)" class="download-button">Download</button>
              <button @click="handleDeleteGraph(graph.name)" class="delete-button">Delete</button>
            </div>
          </li>
        </ul>
        <p v-else>No graphs saved yet.</p>

        <div class="upload-graph-section">
          <h5>Upload Graph File</h5>
          <input type="file" ref="fileInputRef" @change="handleFileUpload" accept=".json" style="display: none;">
          <button @click="triggerFileInput">Select .json File to Load</button>
        </div>
      </div>
    </div>
    <!-- End of menu-content-wrapper -->

  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps } from 'vue';
import { useAlgPresetsStore, type AlgPreset } from '../stores/algPresetsStore';
import { useSavedGraphsStore, type SavedGraphState } from '../stores/savedGraphsStore';

const props = defineProps<{
  saveStatus: { message: string, type: 'success' | 'error' } | null;
}>();

const algStore = useAlgPresetsStore();
const savedGraphsStore = useSavedGraphsStore();

const menuContentVisible = ref(true);
const graphNameToSave = ref('');
const fileInputRef = ref<HTMLInputElement | null>(null);

const emit = defineEmits(['save-graph-request', 'load-graph-request', 'load-graph-from-file-request']);

const toggleMenuContent = () => { 
  menuContentVisible.value = !menuContentVisible.value;
};

const onDragStart = (event: DragEvent, algEntry: AlgPreset) => {
  if (event.dataTransfer) {
    const dragData = {
      algorithm: algEntry.algorithm,
      name: algEntry.name,
      color: algEntry.color,
    };
    event.dataTransfer.setData('application/json', JSON.stringify(dragData));
    event.dataTransfer.effectAllowed = 'copy';
  }
};

const handleSaveGraph = () => {
  if (!graphNameToSave.value.trim()) {
    alert("Please enter a name for the graph to save.");
    return;
  }
  emit('save-graph-request', graphNameToSave.value);
};

const handleLoadGraph = (name: string) => {
  const graphState = savedGraphsStore.loadGraph(name);
  if (graphState) {
    emit('load-graph-request', { nodes: graphState.nodes, edges: graphState.edges });
    graphNameToSave.value = name; 
  } else {
    alert(`Failed to load graph: ${name}`);
  }
};

const handleDownloadGraph = (graphName: string) => {
  const graphState = savedGraphsStore.getGraphForExport(graphName);
  if (graphState) {
    const jsonString = JSON.stringify(graphState, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `${graphName}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  } else {
    alert(`Failed to retrieve graph data for "${graphName}" for download.`);
  }
};

const handleDeleteGraph = (name: string) => {
  if (confirm(`Are you sure you want to delete the graph "${name}"?`)) {
    savedGraphsStore.deleteGraph(name);
    if (graphNameToSave.value === name) {
      graphNameToSave.value = '';
    }
  }
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileContent = e.target?.result as string;
        const parsedGraphState: SavedGraphState = JSON.parse(fileContent);

        if (
          parsedGraphState &&
          typeof parsedGraphState.name === 'string' &&
          Array.isArray(parsedGraphState.nodes) &&
          Array.isArray(parsedGraphState.edges) &&
          Array.isArray(parsedGraphState.algPresets)
        ) {
          emit('load-graph-from-file-request', parsedGraphState);
        } else {
          alert('Invalid graph file format.');
        }
      } catch (error) {
        console.error('Error parsing uploaded graph file:', error);
        alert('Failed to parse graph file. Ensure it is a valid JSON export.');
      } finally {
        if (target) {
          target.value = '';
        }
      }
    };
    reader.onerror = () => {
      alert('Error reading file.');
       if (target) {
          target.value = '';
        }
    };
    reader.readAsText(file);
  }
};

</script>

<style>
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

.menu-overlay.is-collapsed > button {
  /* Optional styling for button when collapsed */
}

.menu-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.menu-overlay > button, 
.algorithms-section > button, 
.save-graph-controls > button,
.upload-graph-section button { /* General button styling */
  background-color: #007bff; 
  color: white;
  border: none;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.menu-overlay > button:hover, 
.algorithms-section > button:hover, 
.save-graph-controls > button:hover,
.upload-graph-section button:hover {
  background-color: #0056b3;
}

/* Specific overrides for certain buttons */
.upload-graph-section button {
  background-color: #6c757d; /* Grey for upload button */
}
.upload-graph-section button:hover {
  background-color: #5a6268;
}

.download-button {
  background-color: #17a2b8 !important; /* Teal for download */
  color: white !important; /* Ensure text color is white if not inherited */
}
.download-button:hover {
  background-color: #138496 !important;
}

.delete-button {
  background-color: #dc3545 !important; /* Red for delete */
}
.delete-button:hover {
  background-color: #c82333 !important;
}


.algorithms-section {
  border-top: 1px solid #444; 
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

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

.algorithm-entry input[type="text"],
.save-graph-controls input[type="text"] { /* Shared style for text inputs */
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

.algorithms-section h4,
.graphs-management-section h4,
.graphs-management-section h5 {
  margin-top: 0;
  margin-bottom: 5px;
  color: #f0f0f0;
}

.graphs-management-section {
  border-top: 1px solid #444;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.save-graph-controls {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap; 
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

.save-feedback.error {
  background-color: #dc3545; 
  color: white;
}

.saved-graph-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  list-style-type: none;
}

.saved-graph-actions button {
  margin-left: 5px;
  padding: 4px 8px; 
  font-size: 0.9em;
  /* Specific styles for download/delete are handled by their own classes */
}

.graphs-management-section h5 { /* Already covered by shared h5 style above */
  margin-top: 10px; /* Keep this if specific additional margin is needed */
}
.graphs-management-section ul {
  padding-left: 0;
}

.upload-graph-section {
  border-top: 1px solid #444;
  padding-top: 10px;
  margin-top: 10px;
}
</style>