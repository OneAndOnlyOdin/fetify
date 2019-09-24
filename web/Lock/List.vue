<script lang="ts">
import Vue from 'vue'
import { locks } from '../store'
import Create from './Create.vue'

export default Vue.extend({
  components: { Create },
  data() {
    return {
      locks: locks.state.locks,
      createOpen: false,
    }
  },
  methods: {
    closeCreate() {
      this.createOpen = false
    },
    openCreate() {
      this.createOpen = true
    },
  },
})
</script>

<template>
  <div class="page">
    <div>
      <button @click="openCreate">Create</button>
      <Create :onHide="closeCreate" v-model="createOpen" />
    </div>

    <div class="grid-auto">
      <div class="card" v-for="lock in locks" :key="lock.id">
        <div class="title">{{lock.id}}</div>
        <div class="content">Lock stuff</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page {
  display: flex;
  flex-direction: column;
}
</style>