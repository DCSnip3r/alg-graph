<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useAlgPresetsStore } from '../stores/algPresetsStore';
import { arrangementCount, chunkVariants, createPLLClassifier, generateArrangements, type ArrangementNode, type Chunk } from '../utils/pllExplorer';

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits<{ close: []; generate: [nodes: ArrangementNode[]] }>();
const presets = useAlgPresetsStore();
const chunks = ref<Chunk[]>([]);
const depth = ref(2);
const interrupted = ref(false);
const loading = ref(false);
const error = ref('');

watch(() => props.isOpen, open => {
  if (open) {
    chunks.value = [
      { name: 'Y setup', algorithm: "F R U' R' U' R U R' F'" },
      { name: 'Sexy Sledge', algorithm: "R U R' U' R' F R F'" },
    ];
    depth.value = 2;
    interrupted.value = false;
    error.value = '';
  }
});

async function generate() {
  error.value = '';
  loading.value = true;
  await nextTick();
  try {
    if (new Set(chunks.value.map(chunk => chunk.name.trim())).size !== chunks.value.length) {
      throw new Error('Chunk names must be unique.');
    }
    const variants = chunkVariants(chunks.value, interrupted.value);
    arrangementCount(variants.length, Number(depth.value));
    const classify = await createPLLClassifier();
    const nodes = generateArrangements(variants, Number(depth.value), classify);
    emit('generate', nodes);
    emit('close');
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div v-if="isOpen" class="overlay" @click.self="!loading && emit('close')">
    <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="chunk-title">
      <header>
        <h2 id="chunk-title">Chunk Explorer</h2>
        <button type="button" aria-label="Close" :disabled="loading" @click="emit('close')">×</button>
      </header>
      <div class="body">
        <p>Arrange named chunks from a solved cube. Each step can repeat a chunk or use its inverse. The defaults produce T and Y.</p>
        <div v-for="(chunk, index) in chunks" :key="index" class="chunk">
          <label>Name <input v-model="chunk.name" type="text" /></label>
          <label>Algorithm <input v-model="chunk.algorithm" type="text" /></label>
          <button type="button" :aria-label="`Remove chunk ${index + 1}`" @click="chunks.splice(index, 1)">×</button>
        </div>
        <button type="button" @click="chunks.push({ name: '', algorithm: '' })">Add chunk</button>
        <label class="preset">Add a saved algorithm:
          <select @change="e => { const value = (e.target as HTMLSelectElement).value; const i = Number(value); if (value !== '' && Number.isInteger(i) && presets.presets[i]) chunks.push({ name: presets.presets[i].name, algorithm: presets.presets[i].algorithm }); (e.target as HTMLSelectElement).value = ''; }">
            <option value="">Select…</option>
            <option v-for="(preset, i) in presets.presets" :key="preset.id" :value="i">{{ preset.name || preset.algorithm }}</option>
          </select>
        </label>
        <label class="option">Steps (1–4): <input v-model.number="depth" type="number" min="1" max="4" /></label>
        <label class="option"><input v-model="interrupted" type="checkbox" /> Include interruptions</label>
        <p>Interruptions insert one whole chunk (or its inverse) at each expanded move boundary inside another. They count as one step; the original chunk and split are shown on the node. Choose one step to explore larger interruption sets.</p>
        <p>Results are labeled against 21 PLLs, ignoring AUF and whole-cube orientation. Non-PLL states remain visible. Explorations are limited to 200 generated nodes and 40 moves per chunk.</p>
        <p v-if="error" class="error" role="alert">{{ error }}</p>
      </div>
      <footer>
        <button type="button" :disabled="loading" @click="emit('close')">Cancel</button>
        <button type="button" :disabled="loading" @click="generate">{{ loading ? 'Generating…' : 'Add graph' }}</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; background: #000b; display: flex; justify-content: center; align-items: center; z-index: 10000; }
.dialog { background: #2c2c2c; color: #f0f0f0; border: 2px solid #444; border-radius: 8px; width: min(700px, 90vw); max-height: 90vh; display: flex; flex-direction: column; }
header, footer { display: flex; align-items: center; justify-content: space-between; padding: 16px; }
header h2 { margin: 0; }
.body { overflow-y: auto; padding: 0 16px; }
.chunk { display: flex; gap: 8px; align-items: end; margin-bottom: 10px; }
.chunk label { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
input[type="text"], select { background: #333; color: white; border: 1px solid #666; padding: 7px; width: 100%; box-sizing: border-box; }
button { cursor: pointer; padding: 6px 10px; }
.preset, .option { display: block; margin-top: 12px; }
.preset select { display: block; margin-top: 4px; }
.option input[type="number"] { width: 4em; }
.error { color: #ff8c8c; }
footer { justify-content: flex-end; gap: 10px; }
</style>
