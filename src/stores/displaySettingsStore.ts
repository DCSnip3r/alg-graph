import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDisplaySettingsStore = defineStore('displaySettings', () => {
  const showColorizedEdgeLabels = ref(true);
  const twistyVisualizationMode = ref("3D"); // Default visualization mode
  const repositionOnConfluence = ref(false);
  const matchIfAUF = ref(true); // New option: match if AUF (U/U'/U2)
  const createConfluenceEdges = ref(true); // New option: create visual confluence edges
  // Configurable size for twisty nodes (width & height of the twisty-player square). Default changed from 350px to 200px.
  const twistyNodeSize = ref(200);

  return {
    showColorizedEdgeLabels,
    twistyVisualizationMode,
    repositionOnConfluence,
    matchIfAUF,
    createConfluenceEdges,
    twistyNodeSize,
  };
});
