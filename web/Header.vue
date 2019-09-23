<script lang="ts">
import Vue from 'vue'
import { auth } from './store'

export default Vue.extend({
  data() {
    return {
      auth: auth.state,
    }
  },
})
</script>

<template>
  <header>
    <div class="left">Logo</div>

    <div class="mid">Nav</div>

    <div class="right">N/A</div>
  </header>
</template>

<style lang="scss" scoped>
header {
  padding: 12px;
  background-color: $color-primary;
  width: 100vw;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  .left {
    width: 200px;
  }

  .mid {
    width: calc(100vw - 400px - 24px);
  }

  .right {
    text-align: right;
    float: right;
    width: 200px;
  }
}
</style>