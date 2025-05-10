<template>
  <div class="submenu">
    <CollapsibleHeader title="Algorithms" v-model="isVisible" />
    <div v-if="isVisible" class="submenu-content">
      <h5>User-Defined Algorithms (Drag in to add node)</h5>
      <div 
        v-for="(algEntry) in algStore.presets" 
        :key="algEntry.id" 
        class="algorithm-entry"
        draggable="true"
        @dragstart="onDragStart($event, algEntry)"
      >
        <button
          class="mirror-btn"
          @click="onMirrorAlg(algEntry)"
          title="Mirror this algorithm"
        >
          M
        </button>
        <button
          class="invert-btn"
          @click="onInvertAlg(algEntry)"
          title="Invert this algorithm"
        >
          i
        </button>
        <input type="text" v-model="algEntry.algorithm" placeholder="Algorithm (e.g., R U R' U')">
        <input type="text" v-model="algEntry.name" placeholder="Shorthand Name (e.g., Sune)">
        <input type="color" v-model="algEntry.color" title="Algorithm Color">
      </div>
      <button @click="algStore.addPreset()">Add Algorithm</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CollapsibleHeader from '../shared/CollapsibleHeader.vue';
import { useAlgPresetsStore } from '../../stores/algPresetsStore';
import { useDragAndDrop } from '../../composables/useDragAndDrop';
import { useAlg } from '../../composables/useAlg';

const isVisible = ref(true);
const algStore = useAlgPresetsStore();
const { onDragStart } = useDragAndDrop();
const { mirrorAlg, invertAlg } = useAlg();

// Helper to invert a hex or rgb color string and return as hex
function invertColor(color: string): string {
  let r = 0, g = 0, b = 0;
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else if (color.startsWith('rgb')) {
    [r, g, b] = color.match(/\d+/g)!.map(Number);
  }
  // Clamp and convert to hex
  const toHex = (n: number) => {
    const h = (255 - n).toString(16).padStart(2, '0');
    return h.length > 2 ? 'ff' : h;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Helper to convert hex/rgb to HSL and rotate hue by 180deg for a "mirror" color
function mirrorColor(color: string): string {
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
  // Rotate hue by 180deg (0.5)
  h = (h + 0.25) % 1;
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

const defaultSwapPair: [string, string] = ["F", "B"];

function onMirrorAlg(algEntry: { algorithm: string, name: string, color: string }) {
  const mirroredAlg = mirrorAlg(algEntry.algorithm, defaultSwapPair);
  algStore.addPreset({
    algorithm: mirroredAlg.toString(),
    name: `Mirror ${algEntry.name}`,
    color: mirrorColor(algEntry.color)
  });
}

function onInvertAlg(algEntry: { algorithm: string, name: string, color: string }) {
  // Use Alg's invert method directly
  const invertedAlg = invertAlg(algEntry.algorithm)

  algStore.addPreset({
    algorithm: invertedAlg.toString(),
    name: `Inverse ${algEntry.name}`,
    color: invertColor(algEntry.color)
  });
}
</script>

<style scoped>
.algorithm-entry {
  display: flex;
  gap: 5px;
  align-items: center;
  padding: 5px;
  border: 1px dashed transparent;
  cursor: grab;
}

.mirror-btn,
.invert-btn {
  border: none;
  border-radius: 50%;
  width: 1em;
  height: 1em;
  font-weight: bold;
  font-size: 0.8em;
  margin-right: 0.5em;
  cursor: pointer;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: filter 0.2s;
  background: #222;
}
.mirror-btn:hover,
.invert-btn:hover {
  filter: brightness(1.2);
}

.algorithm-entry:hover {
  border-color: #555;
}

.algorithm-entry input[type="text"] {
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
</style>
