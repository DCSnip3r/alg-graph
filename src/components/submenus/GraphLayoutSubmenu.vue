<template>
  <div class="submenu">
    <CollapsibleHeader title="Layout" v-model="isVisible" />

    <div v-if="isVisible" class="submenu-layout">
      <!-- LEFT: controls -->
      <div class="controls submenu-content compact">
        <!-- SNAP -->
        <div class="row grid-row">
          <span class="row-label" title="Snap all node positions to the nearest grid multiple">Snap</span>
          <label class="input-with-unit" title="Grid size (pixels)">
            <input id="grid-size-input" type="number" v-model.number="gridSize" min="5" step="5" class="mini-input" aria-label="Grid size in pixels" @input="onGridSizeInput" />
            <span class="unit">px</span>
          </label>
          <button @click="emit('snap-to-grid-request', gridSize)" class="snap-button" aria-label="Snap all nodes to grid" title="Snap nodes">Snap</button>
        </div>
        <hr style="grid-column: 1 / -1; width: 100%; border: none; border-top: 1px solid #444; margin: 6px 0;" />
        <!-- AUTO ARRANGE OPTIONS -->
        <div class="row auto-arrange-header">
          <span class="row-label" title="Hierarchical layout settings">Auto Arrange</span>
          <button @click="applyCustomLayout" class="apply-button mini" aria-label="Apply hierarchical layout" title="Apply layout">Apply</button>
        </div>
        <div class="row option-row top-row">
          <select v-model="direction" class="mini-select" aria-label="Layout direction" title="Direction">
            <option value="TB">Top↓</option>
            <option value="BT">Bottom↑</option>
            <option value="LR">Left→</option>
            <option value="RL">Right←</option>
          </select>
          <select v-model="ranker" class="mini-select" aria-label="Ranker" title="Ranker">
            <option value="tight-tree">Tight</option>
            <option value="network-simplex">Simplex</option>
            <option value="longest-path">Longest</option>
          </select>
          <select v-model="align" class="mini-select" aria-label="Align" title="Align">
            <option :value="undefined">Align Auto</option>
            <option value="UL">UL</option>
            <option value="UR">UR</option>
            <option value="DL">DL</option>
            <option value="DR">DR</option>
          </select>
        </div>
        <div class="row option-row spacing-row">
          <label class="input-with-unit" title="Node separation (pixels)">
            <input type="number" v-model.number="nodeSep" min="10" step="10" class="mini-input" aria-label="Node separation" />
            <span class="unit">node px</span>
          </label>
          <label class="input-with-unit" title="Rank separation (pixels)">
            <input type="number" v-model.number="rankSep" min="20" step="20" class="mini-input" aria-label="Rank separation" />
            <span class="unit">rank px</span>
          </label>
        </div>
      </div>
      <!-- RIGHT: helper text -->
      <div class="help-column">
        <div class="help-block">
          <h5>Snap</h5>
          <p>Aligns every node to the nearest grid multiple using the size you set.</p>
        </div>
        <div class="help-block">
          <h5>Auto Arrange</h5>
            <p>Repositions nodes into hierarchical layers. WARNING: Overwrites layout. Save first.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import CollapsibleHeader from '../shared/CollapsibleHeader.vue';
import { useDisplaySettingsStore } from '../../stores/displaySettingsStore';

const emit = defineEmits(['custom-layout-request', 'snap-to-grid-request']);

const isVisible = ref(false);
// Layout controls state
const direction = ref<'TB' | 'BT' | 'LR' | 'RL'>('TB');
const ranker = ref<'tight-tree' | 'network-simplex' | 'longest-path'>('tight-tree');
const nodeSep = ref(80);
const rankSep = ref(160);
const align = ref<'UL' | 'UR' | 'DL' | 'DR' | undefined>(undefined);

// New: gridSize syncs with twisty node size until user overrides
const displaySettingsStore = useDisplaySettingsStore();
const gridSize = ref(displaySettingsStore.twistyNodeSize);
const userModifiedGridSize = ref(false);
watch(() => displaySettingsStore.twistyNodeSize, (v) => { if (!userModifiedGridSize.value) gridSize.value = v; });
function onGridSizeInput() { userModifiedGridSize.value = true; }

function applyCustomLayout() {
  emit('custom-layout-request', { direction: direction.value, ranker: ranker.value, nodeSep: nodeSep.value, rankSep: rankSep.value, align: align.value });
}
</script>

<style scoped>
.submenu-layout { display:flex; gap:14px; align-items:flex-start; }
.controls.submenu-content.compact { display:flex; flex-direction:column; gap:6px; padding:4px 6px; }
.row { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
.row-label { font-size:0.6rem; font-weight:600; text-transform:uppercase; letter-spacing:.5px; padding-right:4px; }
.apply-button {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 4px 8px;
  font-size: 0.85rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.apply-button:hover { background-color: #0062cc; }
.grid-row { margin-bottom:2px; }
.mini-input, .mini-select { font-size:0.65rem; padding:2px 4px; height:22px; }
.snap-button { background:#17a2b8; color:#fff; border:none; padding:2px 8px; font-size:0.65rem; border-radius:4px; cursor:pointer; height:22px; }
.snap-button:hover { background:#138496; }
.apply-button.mini { padding:2px 8px; font-size:0.65rem; height:22px; }
.advanced-help { display:none; }
.input-with-unit { display:inline-flex; align-items:center; gap:2px; background:#333; padding:0 4px; border-radius:4px; }
.input-with-unit .mini-input { border:none; background:transparent; width:50px; }
.input-with-unit .unit { font-size:0.55rem; opacity:.8; }
 .auto-arrange-header { margin-top:2px; }
 .option-row.top-row { margin-top:-2px; }
 .spacing-row { margin-top:-6px; }

/* Help column */
.help-column { font-size:0.55rem; line-height:1.05; opacity:.85; display:flex; flex-direction:column; gap:10px; max-width:260px; padding:4px 4px 4px 0; }
.help-block { background:#262626; padding:6px 8px; border-radius:6px; box-shadow:0 0 0 1px #333 inset; }
.help-block h5 { margin:0 0 2px; font-size:0.6rem; text-transform:uppercase; letter-spacing:.5px; }
.help-block p { margin:0; }

@media (max-width: 560px) {
  .submenu-layout { flex-direction:column; }
  .help-column { max-width:none; }
}
</style>
