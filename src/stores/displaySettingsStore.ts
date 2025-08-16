import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDisplaySettingsStore = defineStore('displaySettings', () => {
  const showColorizedEdgeLabels = ref(true);
  const twistyVisualizationMode = ref("3D"); // Default visualization mode
  const repositionOnConfluence = ref(true);
  const matchIfAUF = ref(true); // New option: match if AUF (U/U'/U2)
  const createConfluenceEdges = ref(true); // New option: create visual confluence edges

  return {
    showColorizedEdgeLabels,
    twistyVisualizationMode,
    repositionOnConfluence,
    matchIfAUF,
  createConfluenceEdges,
  };
});
