import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Node, Edge } from '@vue-flow/core';
import { useAlgPresetsStore } from './algPresetsStore';
import type { SavedGraphManifest, SavedGraphState } from '../types/SavedGraphTypes';

const LOCAL_STORAGE_KEY_PREFIX = 'vueFlowGraph_';
const SAVED_GRAPHS_LIST_KEY = 'vueFlowGraphsList';


export const useSavedGraphsStore = defineStore('savedGraphs', () => {
  const algPresetsStore = useAlgPresetsStore();
  const savedGraphsManifest = ref<SavedGraphManifest[]>([]);

  const loadManifest = () => {
    const manifestJSON = localStorage.getItem(SAVED_GRAPHS_LIST_KEY);
    if (manifestJSON) {
      try {
        savedGraphsManifest.value = JSON.parse(manifestJSON);
      } catch (e) {
        console.error("Error parsing saved graphs manifest:", e);
        savedGraphsManifest.value = [];
      }
    } else {
      savedGraphsManifest.value = [];
    }
  };

  const _updateManifestInStorage = () => {
    localStorage.setItem(SAVED_GRAPHS_LIST_KEY, JSON.stringify(savedGraphsManifest.value));
  };

  const saveGraph = (name: string, nodes: Node[], edges: Edge[] /*, viewport?: Viewport */) => {
    if (!name.trim()) {
      // alert("Please provide a name for the graph."); // This alert can remain as it's for user error
      return false;
    }

    const graphState: SavedGraphState = {
      name,
      nodes: JSON.parse(JSON.stringify(nodes)), // Deep clone
      edges: JSON.parse(JSON.stringify(edges)), // Deep clone
      algPresets: JSON.parse(JSON.stringify(algPresetsStore.presets)), // Deep clone
      // viewport: viewport ? JSON.parse(JSON.stringify(viewport)) : undefined,
    };

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + name, JSON.stringify(graphState));
      
      const existingEntryIndex = savedGraphsManifest.value.findIndex(g => g.name === name);
      const newEntry: SavedGraphManifest = { name, savedAt: new Date().toISOString() };

      if (existingEntryIndex > -1) {
        savedGraphsManifest.value.splice(existingEntryIndex, 1, newEntry);
      } else {
        savedGraphsManifest.value.push(newEntry);
      }
      _updateManifestInStorage();
      return true;
    } catch (e) {
      console.error("Error saving graph to localStorage:", e);
      // alert("Failed to save graph. Storage might be full."); // This alert can remain for critical errors
      return false;
    }
  };

  const loadGraph = (name: string): SavedGraphState | null => {
    const graphJSON = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + name);
    if (graphJSON) {
      try {
        const graphState: SavedGraphState = JSON.parse(graphJSON);
        // Restore presets to the algPresetsStore
        algPresetsStore.replaceAllPresets(graphState.algPresets || []);
        return graphState; // Return nodes, edges, (and viewport) to be applied by AlgGraph
      } catch (e) {
        console.error("Error parsing saved graph data:", e);
        return null;
      }
    }
    return null;
  };

  const getGraphForExport = (name: string): SavedGraphState | null => {
    const graphJSON = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + name);
    if (graphJSON) {
      try {
        // Just parse and return, don't modify algPresetsStore here
        const graphState: SavedGraphState = JSON.parse(graphJSON);
        return graphState;
      } catch (e) {
        console.error("Error parsing saved graph data for export:", e);
        return null;
      }
    }
    return null;
  };

  const deleteGraph = (name: string) => {
    localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + name);
    savedGraphsManifest.value = savedGraphsManifest.value.filter(g => g.name !== name);
    _updateManifestInStorage();
  };

  // Initialize manifest on store creation
  loadManifest();

  return {
    savedGraphsManifest,
    saveGraph,
    loadGraph,
    getGraphForExport, // Expose the new method
    deleteGraph,
    loadManifest, // Expose if needed for manual refresh
  };
});
