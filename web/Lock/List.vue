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
    }
  },
  methods: {
    openCreate() {
      router.push('/locks/create')
    },
    nextDraw(lock: ClientLock) {
      return common.toDuration(lock.drawSeconds)
    },
    clickLock(lock: ClientLock) {
      if (lock.drawSeconds === 0) {
        router.push(`/locks/${lock.id}`)
      }
    },
    format(lock: ClientLock) {
      if (lock.unlockDate) {
        const diff =
          new Date(lock.unlockDate).valueOf() - new Date(lock.created).valueOf()
        return common.toDuration(diff / 1000)
      }
      return common.elapsedSince(lock.created)
    },
  },
  mounted() {
    locks.getLocks()
  },
})
</script>

<template>
  <div class="page">
    <div style="margin-bottom: 16px">
      <button @click="openCreate">Create</button>
    </div>

    <div class="grid-4">
      <div class="card" v-for="lock in locks.locks" :key="lock.id" @click="clickLock(lock)">
        <div class="title" :class="{ locked: !lock.isOpen, unlocked: lock.isOpen }">
          <div class="card-row">
            <div>Owner: {{lock.ownerId === auth.userId ? 'you' : lock.ownerId}}</div>
            <div style="font-size: 10px; color: #777">#{{lock.id}}</div>
          </div>
        </div>

        <div class="content">
          <div class="card-row">
            <div>Locked:</div>
            <div>{{format(lock)}}</div>
          </div>

          <div class="card-row">
            <div>Cards</div>
            <div>{{lock.totalActions}}</div>
          </div>

          <div class="draw-button">
            <button v-if="!lock.isOpen" :disabled="lock.drawSeconds > 0">
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

.content > .card-row {
  margin-bottom: 8px;
}

.draw-button {
  display: flex;
  width: 100%;
  justify-content: center;

  button {
    width: 100%;
  }
}

.page {
  display: flex;
  flex-direction: column;
}

.locked {
  background-color: $color-locked;
}

.unlocked {
  background-color: $color-unlocked;
}
</style>