<script lang="ts">
import Vue from 'vue'

type Data = {
  show: boolean
  parent: any
}

export default Vue.extend({
  props: {
    text: String,
  },
  data(): Data {
    return {
      show: false,
      parent: null,
    }
  },
  methods: {
    toggle() {
      this.show = !this.show
    },
    hide() {
      this.show = false
    },
  },
})
</script>

<template>
  <div class="dropdown" v-click-outside="hide">
    <button @click="toggle">{{text}}</button>
    <div class="dropdown-content" :class="{ show }">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: $color-primary;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.dropdown-content a {
  padding: 12px 12px;
  text-decoration: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dropdown-content a:hover {
  background-color: $color-secondary;
}

.show {
  display: block;
}
</style>