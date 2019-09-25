<script lang="ts">
import Vue from 'vue'
import { locks, auth } from '../store'
import Create from './Create.vue'
import { common } from '../common'
import { nextLockDraw } from './util'
import { router } from '../router'
import { ClientLock } from '../store/lock'

export default Vue.extend({
  components: { Create },
  data() {
    return {
      auth: auth.state,
      locks: locks.state,
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
    nextDraw(lock: ClientLock) {
      const { text } = nextLockDraw(lock)
      return text
    },
    clickLock(lock: ClientLock) {
      if (this.nextDraw(lock) === 'now') {
        router.push(`/locks/${lock.id}`)
      }
    },
    format: common.formatDate,
  },
  mounted() {
    locks.getLocks()
  },
})
</script>

<template>
  <div class="page">
    <div>
      <button @click="openCreate">Create</button>
      <Create :onHide="closeCreate" v-model="createOpen" />
    </div>

    <div class="grid-4">
      <div class="card" v-for="lock in locks.locks" :key="lock.id">
        <div class="title" :class="{ locked: !lock.isOpen, unlocked: lock.isOpen }">{{lock.id}}</div>
        <div class="content">
          <div>Cards: {{lock.totalActions}}</div>
          <div>Next draw: {{nextDraw(lock)}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.card:hover {
  cursor: pointer;
}

.page {
  display: flex;
  flex-direction: column;
  > div {
    padding: 8px;
  }
}

.locked {
  background-color: $color-locked;
}

.unlocked {
  background-color: $color-unlocked;
}
</style>