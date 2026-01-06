<template>
  <div class="submenu">
    <CollapsibleHeader title="Display and Layout" v-model="isVisible" />

    <div v-if="isVisible" class="submenu-layout">
      <!-- 3D VIEW ROW (MOVED TO TOP) -->
      <div class="action-row">
        <div class="action-col">
          <div class="row">
            <button @click="emit('render-3d-request')" class="render-3d-button" aria-label="Render graph in 3D" title="Open 3D Force Graph Viewer">
              🎨 Render in 3D
            </button>
          </div>
        </div>
        <div class="desc-col">
          <p class="help-inline"><strong>3D View:</strong> Opens an interactive 3D force-directed graph visualization of your current graph.</p>
        </div>
      </div>

      <!-- Display Toggles -->
      <div class="partition-block">
        <div class="block-heading">Display</div>
        <div class="setting-item inline-setting">
          <label for="colorized-edge-labels">
            <input 
              id="colorized-edge-labels"
              type="checkbox" 
              v-model="displaySettingsStore.showColorizedEdgeLabels" 
            />
            Show colorized edge labels
          </label>
        </div>
        <div class="setting-item inline-setting">
          <label for="visualization-mode">Visualization Mode:</label>
          <select id="visualization-mode" v-model="displaySettingsStore.twistyVisualizationMode">
            <option value="3D">3D</option>
            <option value="experimental-2D-LL">Experimental 2D LL</option>
          </select>
        </div>
      </div>

      <!-- Sizing -->
      <div class="partition-block">
        <div class="block-heading">Sizing</div>
        <div class="setting-item">
          <div class="inline-setting">
            <label for="twisty-node-size">Twisty Node Size: {{ displaySettingsStore.twistyNodeSize }}px</label>
            <input
              id="twisty-node-size"
              type="range"
              min="100"
              max="450"
              step="10"
              v-model.number="displaySettingsStore.twistyNodeSize"
            />
          </div>
        </div>
      </div>

      <!-- SNAP ROW -->
      <div class="action-row">
        <div class="action-col">
          <div class="row grid-row">
            <span class="row-label" title="Snap all node positions to the nearest grid multiple">Snap</span>
            <label class="input-with-unit" title="Grid size (pixels)">
              <input id="grid-size-input" type="number" v-model.number="gridSize" min="5" step="5" class="mini-input" aria-label="Grid size in pixels" @input="onGridSizeInput" />
              <span class="unit">px</span>
            </label>
            <button @click="emit('snap-to-grid-request', gridSize)" class="snap-button" aria-label="Snap all nodes to grid" title="Snap nodes">Snap</button>
          </div>
        </div>
        <div class="desc-col">
          <p class="help-inline"><strong>Snap:</strong> Align every node to the nearest grid multiple using the size you set.</p>
        </div>
      </div>

      <!-- SCALE ROW -->
      <div class="action-row">
        <div class="action-col">
          <div class="row scale-row">
            <span class="row-label" title="Scale all node positions about origin">Scale Spacing</span>
            <div class="scale-buttons">
              <button @click="scaleDown" class="scale-button" aria-label="Scale graph down" title="Scale 90%">-</button>
              <span class="scale-display" :title="'Current cumulative scale'">{{ currentScale.toFixed(2) }}x</span>
              <button @click="scaleUp" class="scale-button" aria-label="Scale graph up" title="Scale 110%">+</button>
            </div>
          </div>
        </div>
        <div class="desc-col">
          <p class="help-inline"><strong>Scale:</strong> Multiply all node coordinates around the origin to quickly tighten or expand spacing.</p>
        </div>
      </div>

  <!-- AUTO ARRANGE ROW (all controls grouped on left) -->
  <div class="action-row auto-arrange-row">
        <div class="action-col">
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
        <div class="desc-col">
          <p class="help-inline"><strong>Auto Arrange:</strong> Repositions nodes into hierarchical layers. <span class="warn">Warning:</span> Overwrites your manual layout—save first.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import CollapsibleHeader from '../shared/CollapsibleHeader.vue';
import { useDisplaySettingsStore } from '../../stores/displaySettingsStore';

const emit = defineEmits(['custom-layout-request', 'snap-to-grid-request', 'scale-graph-request', 'render-3d-request']);

const isVisible = ref(false);
// Layout controls state
const direction = ref<'TB' | 'BT' | 'LR' | 'RL'>('TB');
const ranker = ref<'tight-tree' | 'network-simplex' | 'longest-path'>('tight-tree');
const nodeSep = ref(80);
const rankSep = ref(160);
const align = ref<'UL' | 'UR' | 'DL' | 'DR' | undefined>(undefined);

// Display settings store
const displaySettingsStore = useDisplaySettingsStore();

// New: gridSize syncs with twisty node size until user overrides
const gridSize = ref(displaySettingsStore.twistyNodeSize);
const userModifiedGridSize = ref(false);
watch(() => displaySettingsStore.twistyNodeSize, (v) => { if (!userModifiedGridSize.value) gridSize.value = v; });
function onGridSizeInput() { userModifiedGridSize.value = true; }

// Graph scaling state
const currentScale = ref(1);
function scaleGraph(factor: number) {
  currentScale.value = +(currentScale.value * factor).toFixed(3);
  emit('scale-graph-request', { factor });
}
function scaleDown() { scaleGraph(0.9); }
function scaleUp() { scaleGraph(1.1); }

function applyCustomLayout() {
  emit('custom-layout-request', { direction: direction.value, ranker: ranker.value, nodeSep: nodeSep.value, rankSep: rankSep.value, align: align.value });
}
</script>

<style scoped>
.submenu-layout { display:flex; flex-direction:column; gap:10px; padding:4px 6px; }
.action-row { display:grid; grid-template-columns: minmax(260px, 1fr) minmax(140px, 220px); align-items:center; gap:10px; background:#1f1f1f; padding:8px 10px; border-radius:6px; box-shadow:0 0 0 1px #2e2e2e inset; }
.action-row.auto-arrange-row { align-items:center; }
.action-col { display:flex; flex-direction:column; gap:4px; }
.desc-col { font-size:0.55rem; line-height:1.1; opacity:.85; display:flex; align-items:center; }
.desc-col .help-inline { margin:0; }
.desc-col .warn { color:#ffb347; font-weight:600; }
.row { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
.row-label { font-size:0.6rem; font-weight:600; text-transform:uppercase; letter-spacing:.5px; padding-right:4px; }
.apply-button { background-color:#007bff; color:#fff; border:none; padding:4px 8px; font-size:0.85rem; border-radius:4px; cursor:pointer; transition:background-color .2s ease; }
.apply-button:hover { background-color:#0062cc; }
.grid-row { margin-bottom:2px; }
.scale-row { margin-top:2px; }
.mini-input, .mini-select { font-size:0.65rem; padding:2px 4px; height:22px; }
.snap-button { background:#17a2b8; color:#fff; border:none; padding:2px 8px; font-size:0.65rem; border-radius:4px; cursor:pointer; height:22px; }
.snap-button:hover { background:#138496; }
.render-3d-button { background:#28a745; color:#fff; border:none; padding:6px 16px; font-size:0.85rem; border-radius:4px; cursor:pointer; font-weight:600; transition:background-color .2s ease; width:100%; }
.render-3d-button:hover { background:#218838; }
.scale-buttons { display:inline-flex; align-items:center; gap:4px; }
.scale-button { background:#555; color:#fff; border:none; width:22px; height:22px; border-radius:4px; font-size:0.85rem; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; line-height:1; }
.scale-button:hover { background:#666; }
.scale-display { font-size:0.6rem; min-width:34px; text-align:center; background:#333; padding:2px 4px; border-radius:4px; }
.apply-button.mini { padding:2px 8px; font-size:0.65rem; height:22px; }
.input-with-unit { display:inline-flex; align-items:center; gap:2px; background:#333; padding:0 4px; border-radius:4px; }
.input-with-unit .mini-input { border:none; background:transparent; width:50px; }
.input-with-unit .unit { font-size:0.55rem; opacity:.8; }
.auto-arrange-header { margin-top:2px; }
.option-row.top-row { margin-top:2px; }
.spacing-row { margin-top:4px; }

/* Slightly taller inputs for clarity */
.auto-arrange-row .mini-select, .auto-arrange-row .mini-input { height:24px; }

/* Partition blocks reused styling */
.partition-block { background:#1f1f1f; padding:8px 10px 10px; border-radius:6px; box-shadow:0 0 0 1px #2e2e2e inset; margin:8px 4px; }
.partition-block:first-of-type { margin-top:6px; }
.block-heading { font-size:0.55rem; letter-spacing:.5px; text-transform:uppercase; opacity:.75; margin:0 0 6px; font-weight:600; }
.partition-block .setting-item { margin:6px 0; padding-left:0; }
.partition-block .inline-setting { gap:8px; }

.setting-item {
  margin: 10px 0;
  text-align: left;
  padding-left: 10px;
}

.inline-setting {
  display: flex;
  align-items: center;
  gap: 10px;
}

.inline-setting label {
  margin: 0;
  white-space: nowrap;
}

@media (max-width: 560px) {
  .action-row { grid-template-columns: 1fr; }
  .desc-col { order:2; }
}
</style>
