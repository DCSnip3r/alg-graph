import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AlgPreset } from '../types/AlgPresetTypes';

export const useAlgPresetsStore = defineStore('algPresets', () => {
  const presets = ref<AlgPreset[]>([
    // Default initial presets - these can be removed if you want users to define all
    { id: `default-${Date.now()}-1`, algorithm: 'R U R\' U R U2 R\'', name: 'Sune', color: '#ffcc00' },
    { id: `default-${Date.now()}-2`, algorithm: 'R U R\' U\'', name: 'Sexy Move', color: '#3399ff' },
  ]);

  const addPreset = () => {
    presets.value.push({
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      algorithm: '',
      name: '',
      color: '#ffffff', // Default color for new presets
    });
  };

  const replaceAllPresets = (newPresets: AlgPreset[]) => {
    presets.value = newPresets;
  };

  // If you need to update presets by ID, you can add an updatePreset action
  // For v-model directly on array elements, Pinia's reactivity should handle it.

  const getSortedPresetsForHighlighting = computed(() => {
    // Filter out presets with empty algorithms and sort by algorithm length (descending)
    return presets.value
      .filter(p => p.algorithm && p.algorithm.trim() !== '')
      .sort((a, b) => b.algorithm.trim().length - a.algorithm.trim().length);
  });

  return {
    presets,
    addPreset,
    replaceAllPresets,
    getSortedPresetsForHighlighting,
  };
});
