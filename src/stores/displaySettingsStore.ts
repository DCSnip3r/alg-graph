import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDisplaySettingsStore = defineStore('displaySettings', () => {
  const showColorizedEdgeLabels = ref(true);
  const twistyVisualizationMode = ref("3D"); // Default visualization mode
  const repositionOnConfluence = ref(false);
  const matchIfAUF = ref(true); // New option: match if AUF (U/U'/U2)
  const createConfluenceEdges = ref(true); // New option: create visual confluence edges
  const deleteDuplicateOnConfluence = ref(true); // New option: delete the duplicate node when confluence is detected
  // Configurable size for twisty nodes (width & height of the twisty-player square). Default changed from 350px to 200px.
  const twistyNodeSize = ref(200);
  
  // 3D Graph cube rotation settings (for shift+drag independent rotation)
  const cubeRotationX = ref(0); // Independent cube rotation X axis (radians)
  const cubeRotationY = ref(0); // Independent cube rotation Y axis (radians)
  const cubeRotationZ = ref(0); // Independent cube rotation Z axis (radians)

  return {
    showColorizedEdgeLabels,
    twistyVisualizationMode,
    repositionOnConfluence,
    matchIfAUF,
    createConfluenceEdges,
    deleteDuplicateOnConfluence,
    twistyNodeSize,
    cubeRotationX,
    cubeRotationY,
    cubeRotationZ,
  };
});
