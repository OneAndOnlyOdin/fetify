<script lang="ts">
import Vue from 'vue'
import { auth } from '../store'
import LockList from '../Lock/List.vue'

export default Vue.extend({
  components: { LockList },
  data() {
    return {
      auth: auth.state,
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
  padding: 16px;
}

section {
  border: 1px solid $color-accent;
  .title {
    background-color: $color-accent;
  }
}
</style>