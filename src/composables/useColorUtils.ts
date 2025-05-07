import { useAlgPresetsStore } from '../stores/algPresetsStore';

export function useColorUtils() {
  const getTextColorForBackground = (hexColor: string): string => {
    if (!hexColor || hexColor.length < 7) return '#000000'; // Default to black
    try {
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);
      // Simple luminance formula
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5 ? '#000000' : '#ffffff'; // Black for light bg, white for dark
    } catch (e) {
      return '#000000'; // Fallback
    }
  };

  const getBackgroundColorForAlgorithm = (algorithm: string): string => {
    const algStore = useAlgPresetsStore();
    const preset = algStore.presets.find(p => p.algorithm === algorithm);
    return preset?.color || '#ffffff'; // Default to white if no match
  };

  const colorizeLabel = (label: string) => {
    const algStore = useAlgPresetsStore();
    const presetsToHighlight = algStore.getSortedPresetsForHighlighting;

    let colorizedLabel = label;

    presetsToHighlight.forEach(presetEntry => {
      const trimmedPresetAlg = presetEntry.algorithm.trim();
      const escapedPresetAlg = trimmedPresetAlg.replace(/[']/g, "\\'");
      const regex = new RegExp(escapedPresetAlg + '(?=\\s|$)', 'g');

      colorizedLabel = colorizedLabel.replace(regex, (match) => {
        const textColor = getTextColorForBackground(presetEntry.color);
        return `<span class="highlight" style="background-color: ${presetEntry.color}; color: ${textColor};">${match}</span>`;
      });
    });

    return colorizedLabel;
  };

  return { getTextColorForBackground, getBackgroundColorForAlgorithm, colorizeLabel };
}
