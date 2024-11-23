<template>
  <div class="menu-overlay" v-if="visible">
    <button @click="hideMenu">Hide</button>
    
    <!-- Add more menu items here -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      visible: true
    };
  },
  methods: {
    hideMenu() {
      this.visible = false;
    }
  }
};
</script>

<style>
.menu-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: white;
  border: 1px solid #ccc;
  padding: 10px;
  z-index: 1000;
}
</style>