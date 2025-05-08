<template>
  <div class="twisty-container">
    <twisty-player
      class="twisty-c"
      :alg="alg || 'U U\''"
      :experimental-setup-anchor="setupAnchor"
      :visualization="displaySettingsStore.twistyVisualizationMode"
      experimental-setup-alg="x2"
      background="null"
    ></twisty-player>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { TwistyPlayer } from "cubing/twisty";
import { useDisplaySettingsStore } from "../stores/displaySettingsStore";

export default defineComponent({
  name: "Twisty",
  props: {
    setupAnchor: {
      type: String,
      required: false,
      default: "end", //start-end
    },
    vis: {
      type: String,
      required: false,
      default: "", // Removed default value as it will now be controlled by the store
    },
    alg: {
      type: String,
      required: false,
      default: "",
    },
  },
  setup() {
    const displaySettingsStore = useDisplaySettingsStore();
    return { displaySettingsStore };
  },
  mounted() {
    if (!customElements.get("twisty-player")) {
      customElements.define("twisty-player", TwistyPlayer);
    }
  },
});
</script>

<style scoped>
.twisty-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.twisty-c {
  height: 350px;
  width: 350px;
  margin: auto;
}
</style>
