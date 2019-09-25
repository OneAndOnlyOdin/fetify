<script lang="ts">
import Vue from 'vue'
import { locks, auth } from '../store'
import Create from './Create.vue'
import { common } from '../common'
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
      return common.toDuration(lock.drawSeconds)
    },
    clickLock(lock: ClientLock) {
      if (lock.drawSeconds === 0) {
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
      <div class="card" v-for="lock in locks.locks" :key="lock.id" @click="clickLock(lock)">
        <div class="title" :class="{ locked: !lock.isOpen, unlocked: lock.isOpen }">
          <div class="card-row">
            <div>Owner: {{lock.ownerId === auth.userId ? 'you' : lock.ownerId}}</div>
            <div style="padding-top: 3px; font-size: 10px; color: #777">#{{lock.id}}</div>
          </div>
        </div>

        <div class="content">
          <div>Cards: {{lock.totalActions}}</div>
          <div class="draw-button">
            <button v-if="!lock.isOpen" :class="{ success: lock.drawSeconds === 0 }">
              <span v-if="lock.drawSeconds === 0">Draw</span>
              <span v-if="lock.drawSeconds > 0">{{nextDraw(lock)}}</span>
            </button>
            <button v-if="lock.isOpen" disabled="true">Unlocked!</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.card:hover {
  cursor: pointer;
}

.card-row {
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.draw-button {
  display: flex;
  width: 100%;
  justify-content: center;

  button {
    width: 50%;
  }
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