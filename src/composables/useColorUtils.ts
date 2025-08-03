import { useAlgPresetsStore } from '../stores/algPresetsStore';

export function useColorUtils() {
  // Generate a random pure shade of Red, Green, or Blue with value above 125
  const randomPureRGB = (): string => {
    // Pick one channel to be high, others to be zero
    const channels = [0, 0, 0];
    const idx = Math.floor(Math.random() * 3); // 0=R, 1=G, 2=B
    channels[idx] = 126 + Math.floor(Math.random() * (256 - 126));
    const toHex = (x: number) => x.toString(16).padStart(2, '0');
    return `#${toHex(channels[0])}${toHex(channels[1])}${toHex(channels[2])}`;
  };
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

  // Rotate color hue by a given degree (0-360)
  const rotateColor = (color: string, degree: number): string => {
    let r = 0, g = 0, b = 0;
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else if (color.startsWith('rgb')) {
      [r, g, b] = color.match(/\d+/g)!.map(Number);
    }
    // Convert RGB to HSL
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    // Rotate hue
    h = (h + degree / 360) % 1;
    if (h < 0) h += 1;
    // Convert HSL back to RGB
    let r1, g1, b1;
    if (s === 0) {
      r1 = g1 = b1 = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r1 = hue2rgb(p, q, h + 1/3);
      g1 = hue2rgb(p, q, h);
      b1 = hue2rgb(p, q, h - 1/3);
    }
    const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
    return `#${toHex(r1)}${toHex(g1)}${toHex(b1)}`;
  }

  const invertColor = (color: string): string => rotateColor(color, 180);
  const mirrorColor = (color: string): string => rotateColor(color, 90);

  // Utility: max RGB blend of two colors
  const maxRGBColor = (colorA: string, colorB: string): string => {
    const parse = (color: string) => {
      if (color.startsWith('#')) {
        const hex = color.replace('#', '');
        return [
          parseInt(hex.substring(0, 2), 16),
          parseInt(hex.substring(2, 4), 16),
          parseInt(hex.substring(4, 6), 16)
        ];
      } else if (color.startsWith('rgb')) {
        return color.match(/\d+/g)!.map(Number);
      }
      return [0, 0, 0];
    };
    const [r1, g1, b1] = parse(colorA);
    const [r2, g2, b2] = parse(colorB);
    const r = Math.max(r1, r2);
    const g = Math.max(g1, g2);
    const b = Math.max(b1, b2);
    const toHex = (x: number) => x.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  return { getTextColorForBackground, getBackgroundColorForAlgorithm, colorizeLabel, mirrorColor, invertColor, maxRGBColor, randomPureRGB };
}



