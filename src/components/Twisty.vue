<template>
  <div class="twisty-container">
    <div v-if="!isReady" class="twisty-loading">Loading...</div>
    <twisty-player
      v-else
      class="twisty-c"
      :style="{ width: sizePx, height: sizePx }"
      :alg="alg || 'U U\''"
      :experimental-setup-anchor="setupAnchor"
      :visualization="displaySettingsStore.twistyVisualizationMode"
      experimental-setup-alg="x2"
      background="null"
    ></twisty-player>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, toRefs, computed } from 'vue';
import { useDisplaySettingsStore } from '../stores/displaySettingsStore';

interface Props {
  setupAnchor?: string;
  vis?: string;
  alg?: string;
}

const props = withDefaults(defineProps<Props>(), {
  setupAnchor: 'end',
  vis: '',
  alg: ''
});

const displaySettingsStore = useDisplaySettingsStore();
const isReady = ref(false);
// computed pixel value string for inline style
const sizePx = computed(() => displaySettingsStore.twistyNodeSize + 'px');

onMounted(async () => {
  try {
    if (!customElements.get('twisty-player')) {
      const { TwistyPlayer } = await import('cubing/twisty');
      customElements.define('twisty-player', TwistyPlayer);
    }
  } finally {
    isReady.value = true; // ensure we always clear loading
  }
});

// IMPORTANT: avoid plain destructuring which breaks reactivity for future prop updates
// Use toRefs so TwistyPlayer updates when parent passes a new alg after connections change
const { alg, setupAnchor } = toRefs(props);
</script>

<style scoped>
.twisty-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.twisty-c {
  /* dynamic size via inline style */
  margin: auto;
}
.twisty-loading {
  height: v-bind(sizePx);
  width: v-bind(sizePx);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #ccc;
  border: 1px dashed #555;
}
</style>
