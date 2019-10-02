<script lang="ts">
import Vue from 'vue'
import { authApi } from '../store'
import LockList from '../Lock/LockList.vue'

export default Vue.extend({
  components: { LockList },
  data() {
    return {
      auth: authApi.state,
    }
  },
})
</script>

<template>
  <content>
    <section class="card">
      <div class="title">Locks</div>
      <div class="content">
        <LockList />
      </div>
    </section>
  </content>
</template>

<style lang="scss" scoped>
content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100%, 100%));
  grid-gap: 16px;
}

section {
  border: 1px solid $color-accent;
  .title {
    background-color: $color-accent;
  }
}
</style>