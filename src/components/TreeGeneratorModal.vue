<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Algorithm Tree Generator</h2>
        <button class="close-btn" @click="closeModal">×</button>
      </div>
      
      <div class="modal-body">
        <!-- Root Node Selection -->
        <div class="form-group">
          <label>Starting Node:</label>
          <select v-model="selectedRootNodeId" class="form-control">
            <option value="">-- Select a node --</option>
            <option v-for="node in availableNodes" :key="node.id" :value="node.id">
              {{ node.data.label || node.id }}
            </option>
          </select>
        </div>

        <!-- Levels Configuration -->
        <div class="levels-section">
          <h3>Algorithm Levels</h3>
          <p class="help-text">
            Enter algorithms for each level (comma-separated). 
            The generator will create all permutations, checking for confluence at each step.
            Add a semicolon (;) after an algorithm to disable future branching from that alg (e.g. R U R';, R' U' R, F U R'). 
          </p>
          
          <div v-for="(_level, index) in levels" :key="index" class="level-group">
            <div class="level-header">
              <label>Level {{ index + 1 }}:</label>
              <button 
                v-if="levels.length > 1" 
                class="remove-level-btn" 
                @click="removeLevel(index)"
                title="Remove this level"
              >
                Remove
              </button>
            </div>
            <input
              v-model="levels[index]"
              type="text"
              class="form-control"
              placeholder="e.g., R U R';, R' U' R, F U R'"
              @input="validateLevel(index)"
            />
            <div v-if="levelErrors[index]" class="error-message">
              {{ levelErrors[index] }}
            </div>
          </div>

          <button class="add-level-btn" @click="addLevel">
            + Add Level
          </button>
        </div>

        <!-- User-Defined Algorithms Quick Reference -->
        <div v-if="algStore.presets.length > 0" class="user-algs-section">
          <h3>Your Algorithms</h3>
          <p class="help-text">
            Click an algorithm to add it to the last level, or copy and paste manually.
          </p>
          <div class="alg-chips">
            <button
              v-for="preset in algStore.presets"
              :key="preset.id"
              class="alg-chip"
              :style="{ borderColor: preset.color }"
              @click="addAlgorithmToLevel(preset.algorithm)"
              :title="`Click to add '${preset.algorithm}' to Level ${levels.length}`"
            >
              <span class="alg-chip-name" v-if="preset.name">{{ preset.name }}</span>
              <span class="alg-chip-algorithm">{{ preset.algorithm }}</span>
            </button>
          </div>
        </div>

        <!-- Preview Section -->
        <div v-if="previewStats" class="preview-section">
          <div class="preview-items">
            <div class="preview-item">
              <strong>Root:</strong> {{ selectedRootNode?.data.label || 'None' }}
            </div>
            <div class="preview-item">
              <strong>Levels:</strong> {{ levels.length }}
            </div>
            <div class="preview-item">
              <strong>Est. nodes:</strong> {{ previewStats.estimatedNodes }}
            </div>
            <div class="preview-item">
              <strong>Est. edges:</strong> {{ previewStats.estimatedEdges }}
            </div>
          </div>
          <p class="warning-text" v-if="previewStats.estimatedNodes > 50">
            ⚠️ Warning: This will create many nodes. Consider reducing levels or algorithms.
          </p>
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-btn" @click="closeModal">Cancel</button>
        <button 
          class="generate-btn" 
          @click="startGeneration"
          :disabled="!canGenerate || isGenerating"
        >
          {{ isGenerating ? 'Generating...' : 'Generate Tree' }}
        </button>
      </div>

      <!-- Progress Indicator -->
      <div v-if="isGenerating" class="progress-overlay">
        <div class="progress-content">
          <div class="spinner"></div>
          <p>{{ progressMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Node } from '@vue-flow/core';
import { Alg } from 'cubing/alg';
import { useAlgPresetsStore } from '../stores/algPresetsStore';

const props = defineProps<{
  isOpen: boolean;
  availableNodes: Node[];
}>();

const emit = defineEmits<{
  close: [];
  generate: [config: { rootNodeId: string; levels: string[][] }];
}>();

// Stores
const algStore = useAlgPresetsStore();

// State
const selectedRootNodeId = ref('');
const levels = ref<string[]>(['']);
const levelErrors = ref<Record<number, string>>({});
const isGenerating = ref(false);
const progressMessage = ref('');

// Computed
const selectedRootNode = computed(() => {
  return props.availableNodes.find(n => n.id === selectedRootNodeId.value);
});

const parsedLevels = computed(() => {
  return levels.value.map(levelStr => {
    return levelStr
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  });
});

const previewStats = computed(() => {
  if (!selectedRootNodeId.value || parsedLevels.value.length === 0) {
    return null;
  }

  // Calculate estimated nodes (multiplicative per level)
  let estimatedNodes = 1; // Root
  let estimatedEdges = 0;
  
  for (const levelAlgs of parsedLevels.value) {
    if (levelAlgs.length === 0) continue;
    const newNodes = estimatedNodes * levelAlgs.length;
    estimatedEdges += estimatedNodes * levelAlgs.length;
    estimatedNodes = newNodes;
  }

  return {
    estimatedNodes,
    estimatedEdges,
  };
});

const canGenerate = computed(() => {
  return selectedRootNodeId.value && 
         levels.value.some(l => l.trim().length > 0) &&
         Object.keys(levelErrors.value).length === 0 &&
         !isGenerating.value;
});

// Methods
function addLevel() {
  levels.value.push('');
}

function removeLevel(index: number) {
  levels.value.splice(index, 1);
  delete levelErrors.value[index];
}

function validateLevel(index: number) {
  const levelStr = levels.value[index];
  if (!levelStr || levelStr.trim().length === 0) {
    delete levelErrors.value[index];
    return;
  }

  const algs = levelStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
  
  // Try to parse each algorithm (after removing terminal marker)
  for (const algStr of algs) {
    // Remove terminal marker (;) if present before validation
    const cleanAlg = algStr.endsWith(';') ? algStr.slice(0, -1).trim() : algStr;
    try {
      new Alg(cleanAlg);
    } catch (e) {
      // Show clean algorithm without semicolon in error message
      levelErrors.value[index] = `Invalid algorithm: ${cleanAlg}. You may be missing a comma after a semicolon (;,)`;
      return;
    }
  }
  
  delete levelErrors.value[index];
}

function closeModal() {
  if (isGenerating.value) {
    if (!confirm('Tree generation is in progress. Are you sure you want to cancel?')) {
      return;
    }
  }
  
  emit('close');
  resetForm();
}

function addAlgorithmToLevel(algorithm: string) {
  // Add to the last level (largest numbered level)
  const lastLevelIndex = levels.value.length - 1;
  const currentValue = levels.value[lastLevelIndex].trim();
  
  // Add comma if there's already content
  if (currentValue.length > 0 && !currentValue.endsWith(',')) {
    levels.value[lastLevelIndex] = currentValue + ', ' + algorithm;
  } else if (currentValue.endsWith(',')) {
    levels.value[lastLevelIndex] = currentValue + ' ' + algorithm;
  } else {
    levels.value[lastLevelIndex] = algorithm;
  }
  
  // Validate the updated level
  validateLevel(lastLevelIndex);
}

function resetForm() {
  selectedRootNodeId.value = '';
  levels.value = [''];
  levelErrors.value = {};
  isGenerating.value = false;
  progressMessage.value = '';
}

async function startGeneration() {
  if (!canGenerate.value) return;

  isGenerating.value = true;
  progressMessage.value = 'Starting tree generation...';

  try {
    emit('generate', {
      rootNodeId: selectedRootNodeId.value,
      levels: parsedLevels.value,
    });

    // Keep the modal open during generation to show progress
    // The parent component will close it when done
  } catch (error) {
    console.error('Tree generation failed:', error);
    alert(`Tree generation failed: ${error}`);
    isGenerating.value = false;
  }
}

// Watch for changes
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    // Reset form when modal opens
    resetForm();
    
    // Auto-select first node if available
    if (props.availableNodes.length > 0 && !selectedRootNodeId.value) {
      selectedRootNodeId.value = props.availableNodes[0].id;
    }
  }
});

// Expose method for parent to update progress
defineExpose({
  setProgress: (message: string) => {
    progressMessage.value = message;
  },
  finishGeneration: () => {
    isGenerating.value = false;
    setTimeout(() => {
      emit('close');
      resetForm();
    }, 500);
  },
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.modal-content {
  background-color: #2c2c2c;
  border: 2px solid #444;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  color: #f0f0f0;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #444;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.3rem;
}

.close-btn {
  background: none;
  border: none;
  color: #f0f0f0;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #ff4444;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.form-control {
  width: 100%;
  padding: 10px;
  background-color: #333;
  color: #f0f0f0;
  border: 1px solid #555;
  border-radius: 4px;
  font-size: 1rem;
}

.form-control:focus {
  outline: none;
  border-color: #4CAF50;
}

.levels-section {
  margin-top: 20px;
}

.levels-section h3 {
  margin-bottom: 10px;
}

.help-text {
  color: #aaa;
  font-size: 0.9rem;
  margin-bottom: 15px;
}

.level-group {
  margin-bottom: 15px;
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.remove-level-btn {
  background-color: #c00;
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.remove-level-btn:hover {
  background-color: #ff4444;
}

.error-message {
  color: #ff4444;
  font-size: 0.85rem;
  margin-top: 5px;
}

.add-level-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;
  margin-top: 10px;
}

.add-level-btn:hover {
  background-color: #45a049;
}

.preview-section {
  margin-top: 20px;
  padding: 12px;
  background-color: #1a1a1a;
  border: 1px solid #444;
  border-radius: 4px;
}

.preview-items {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 10px;
}

.preview-item {
  font-size: 0.9rem;
}

.preview-item strong {
  margin-right: 4px;
}

.warning-text {
  color: #ff9800;
  font-weight: bold;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #444;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn,
.generate-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
}

.cancel-btn {
  background-color: #555;
  color: white;
}

.cancel-btn:hover {
  background-color: #666;
}

.generate-btn {
  background-color: #4CAF50;
  color: white;
}

.generate-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.generate-btn:disabled {
  background-color: #333;
  color: #666;
  cursor: not-allowed;
}

.progress-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
}

.progress-content {
  text-align: center;
}

.spinner {
  border: 4px solid #333;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.user-algs-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #1a1a1a;
  border: 1px solid #444;
  border-radius: 4px;
}

.user-algs-section h3 {
  margin: 0 0 10px 0;
  font-size: 1.1rem;
  color: #4CAF50;
}

.alg-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.alg-chip {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 6px 10px;
  background-color: #2c2c2c;
  border: 2px solid;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.85rem;
  color: #f0f0f0;
  text-align: left;
}

.alg-chip:hover {
  background-color: #333;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.alg-chip:active {
  transform: translateY(0);
}

.alg-chip-name {
  font-weight: bold;
  font-size: 0.75rem;
  opacity: 0.8;
}

.alg-chip-algorithm {
  font-family: monospace;
  font-size: 0.9rem;
}
</style>
