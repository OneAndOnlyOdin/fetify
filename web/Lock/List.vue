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
      joinLockId: '',
      auth: auth.state,
      locks: locks.state,
    }
  },
  methods: {
    viewMode(lock: ClientLock) {
      switch (lock.config.owner) {
        case 'self':
          return 'player'

        case 'other':
          return lock.ownerId === this.auth.userId ? 'owner' : 'player'

        default:
          return 'player'
      }
    },
    getStatus(lock: ClientLock) {
      if (lock.isOpen) return 'Open'
      if (lock.config.owner === 'self') return 'In Play'
      if (lock.ownerId && lock.playerId) return 'In Play'
      return 'Pending'
    },
    canClickLock(lock: ClientLock) {
      if (this.auth.userId === lock.ownerId) return true
      return lock.drawSeconds === 0
    },
    openCreate() {
      router.push('/locks/create')
    },
    nextDraw(lock: ClientLock) {
      return common.toDuration(lock.drawSeconds)
    },
    clickLock(lock: ClientLock) {
      router.push(`/locks/${lock.id}`)
    },
    toDuration: common.toDuration,
    format(lock: ClientLock) {
      if (lock.unlockDate) {
        const diff =
          new Date(lock.unlockDate).valueOf() - new Date(lock.created).valueOf()
        return common.toDuration(diff / 1000)
      }
      return common.elapsedSince(lock.created)
    },
    async joinLock() {
      await locks.joinLock(this.joinLockId)
      this.joinLockId = ''
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
      <div style="display: flex">
        <div>
          <button @click="openCreate">Create</button>
        </div>

        <div class="input__group" style="margin-left: 16px;">
          <div class="input__prefix--btn" @click="joinLock">Join</div>
          <input type="text" placeholder="Enter Lock ID" v-model="joinLockId" />
        </div>
      </div>
    </div>

    <div class="grid-4">
      <div class="card" v-for="lock in locks.locks" :key="lock.id">
        <div class="title" :class="{ locked: !lock.isOpen, unlocked: lock.isOpen }">
          <div class="card-row">
            <div>Owner: {{lock.ownerId === auth.userId ? 'you' : lock.ownerId}}</div>
            <div style="font-size: 10px; color: #777">{{lock.id}}</div>
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

          <div class="card-row">
            <div>Status</div>
            <div>{{getStatus(lock)}}</div>
          </div>

          <div class="card-row">
            <div>Interval</div>
            <div>{{toDuration(lock.config.intervalMins * 60, true)}}</div>
          </div>

          <div class="draw-button">
            <button v-if="!lock.isOpen" :disabled="!canClickLock(lock)" @click="clickLock(lock)">
              <template v-if="viewMode(lock) === 'owner'">View</template>
              <template v-if="viewMode(lock) === 'player'">
                <span v-if="lock.drawSeconds === 0">Draw</span>
                <span v-if="lock.drawSeconds > 0">{{nextDraw(lock)}}</span>
              </template>
            </button>
            <button v-if="lock.isOpen" disabled="true">Unlocked!</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
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