import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDisplaySettingsStore = defineStore('displaySettings', () => {
  const showColorizedEdgeLabels = ref(true);

  return {
    showColorizedEdgeLabels,
  };
});
