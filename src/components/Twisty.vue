<template>
  <div class="twisty-container">
    <twisty-player
      class="twisty-c"
      :alg="alg || 'U U\''"
      :experimental-setup-anchor="setupAnchor"
      :visualization="vis"
      experimental-setup-alg="x2"
      background="null"
    ></twisty-player>
  </div>
</template>

<script>
import { defineComponent, onMounted } from "vue";
import { TwistyPlayer } from "cubing/twisty";
import { Alg } from "cubing/alg";

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
      default: "3D", //experimental-2D-LL
    },
    alg: {
      type: String,
      required: false,
      default: "",
    },
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
