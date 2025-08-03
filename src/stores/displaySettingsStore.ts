import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDisplaySettingsStore = defineStore('displaySettings', () => {
  const showColorizedEdgeLabels = ref(true);
  const twistyVisualizationMode = ref("3D"); // Default visualization mode
  const repositionOnConfluence = ref(true);

  return {
    showColorizedEdgeLabels,
    twistyVisualizationMode,
    repositionOnConfluence,
  };
});
