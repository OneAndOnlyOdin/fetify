<script lang="ts">
import Vue, { PropType } from 'vue'
import { ClientLock } from '../store/lock'
import { common } from '../common'
import { navigate } from '../router'
import { authApi } from '../store'

export default Vue.extend({
  props: {
    lock: { type: Object as PropType<ClientLock> },
    viewMode: { type: String as PropType<'player' | 'owner'> },
  },
  methods: {
    ...common,
    nextDraw(lock: ClientLock) {
      return common.toDuration(lock.drawSeconds, true)
    },
    clickLock(lock: ClientLock) {
      navigate(`/locks/${lock.id}`)
    },
    getStatus(lock: ClientLock) {
      if (lock.isOpen) return 'Open'
      if (lock.config.owner === 'self') return 'In Play'
      if (lock.ownerId && lock.playerId) return 'In Play'
      return 'Pending'
    },
    getLockFor(lock: ClientLock) {
      if (lock.config.owner === 'self') return 'you'

      if (lock.ownerId !== authApi.state.userId && !lock.playerId) return '...'
      return lock.playerId === authApi.state.userId ? 'you' : lock.playerId
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
})
</script>

<template>
  <div class="lockcard">
    <div class="lockcard__title" :class="{ locked: !lock.isOpen, unlocked: lock.isOpen }">
      <div class="card__title">
        <div>{{lock.name || 'unnamed'}}</div>
        <div class="card__title--id">ID: {{lock.id}}</div>
      </div>
    </div>

    <div class="content">
      <div v-if="viewMode === 'player'" class="card-row">
        <div>Locked by</div>
        <div>{{lock.config.owner === 'self' ? 'you' : lock.ownerId}}</div>
      </div>
      <div v-if="viewMode === 'owner'" class="card-row">
        <div>Lock for</div>
        <div>{{getLockFor(lock)}}</div>
      </div>
      <div class="card-row">
        <div>Locked</div>
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
        <button v-if="!lock.isOpen" @click="clickLock(lock)">
          <template v-if="viewMode === 'owner' && lock.playerId">View</template>
          <template v-if="viewMode === 'owner' && !lock.playerId">Pending</template>
          <template v-if="viewMode === 'player'">
            <span v-if="lock.drawSeconds === 0">Draw</span>
            <span v-if="lock.drawSeconds > 0">{{nextDraw(lock)}}</span>
          </template>
        </button>
        <button @click="clickLock(lock)" v-if="lock.isOpen">Unlocked!</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.lockcard {
  background-color: $color-primary;
}

.content {
  padding: 8px;
}

.lockcard__title {
  padding: 8px;
}

.card__title--id {
  font-size: 12px;
  color: #ddd;
}

.card__title {
  width: 100%;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-row {
  width: 100%;
  display: flex;
  justify-content: space-between;
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

.locked {
  background-color: $color-locked;
}

.unlocked {
  background-color: $color-unlocked;
}
</style>