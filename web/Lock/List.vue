<script lang="ts">
import Vue from 'vue'
import { locksApi, authApi } from '../store'
import Create from './Create.vue'
import { common } from '../common'
import { navigate } from '../router'
import { ClientLock, getDrawSecs } from '../store/lock'
import { Dropdown } from '../elements'
import { AuthState } from '../store/auth'

type Data = {
  interval?: NodeJS.Timer
  joinLockId: string
  knownLocks: Set<string>
  locks: ClientLock[]
  auth: AuthState
  filter: {
    unlocked: boolean
    drawable: boolean
  }
}

export default Vue.extend({
  components: { Create, Dropdown },
  data(): Data {
    return {
      joinLockId: '',
      knownLocks: new Set<string>(),
      locks: [],
      auth: authApi.state,
      filter: {
        unlocked: false,
        drawable: false,
      },
    }
  },
  methods: {
    toggleFilter(filter: string) {
      switch (filter) {
        case 'unlocked':
          this.filter.unlocked = !this.filter.unlocked
          break

        case 'drawable':
          this.filter.drawable = !this.filter.drawable
          break
      }
      common.persist('lock-filters', this.filter)
    },
    viewMode(lock: ClientLock) {
      switch (lock.config.owner) {
        case 'self':
          return 'player'

        case 'other':
          return lock.ownerId === authApi.state.userId ? 'owner' : 'player'

        default:
          return 'player'
      }
    },
    getLockFor(lock: ClientLock) {
      if (lock.config.owner === 'self') return 'you'

      if (lock.ownerId !== authApi.state.userId && !lock.playerId) return '...'
      return lock.playerId === authApi.state.userId ? 'you' : lock.playerId
    },
    getStatus(lock: ClientLock) {
      if (lock.isOpen) return 'Open'
      if (lock.config.owner === 'self') return 'In Play'
      if (lock.ownerId && lock.playerId) return 'In Play'
      return 'Pending'
    },
    openCreate() {
      navigate('/locks/create')
    },
    nextDraw(lock: ClientLock) {
      return common.toDuration(lock.drawSeconds)
    },
    clickLock(lock: ClientLock) {
      navigate(`/locks/${lock.id}`)
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
      await locksApi.joinLock(this.joinLockId)
      this.joinLockId = ''
    },
    updateLocks() {
      for (const [id, lock] of Object.entries(locksApi.state.locks))
        if (!this.knownLocks.has(id)) {
          this.knownLocks.add(id)
          this.locks.unshift(lock)
        }

      for (const lock of this.locks) {
        lock.draw = locksApi.state.locks[lock.id].draw
        lock.drawSeconds = getDrawSecs(lock.draw)
      }
    },
  },
  computed: {
    filteredLocks(): ClientLock[] {
      return this.locks.filter(lock => {
        if (this.filter.unlocked && lock.isOpen) return false
        if (this.filter.drawable) {
          if (lock.isOpen) return false
          if (lock.drawSeconds !== 0) return false
        }
        return true
      })
    },
  },
  mounted() {
    this.updateLocks()
    if (!locksApi.state.locks.length) locksApi.getLocks()
    setInterval(this.updateLocks, 750)

    const persisted = common.hydrate<Partial<Data['filter']>>('lock-filters')
    this.filter = { ...this.filter, ...persisted }
  },
  beforeDestroy() {
    clearInterval(this.interval!)
  },
})
</script>

<template>
  <div class="page">
    <div style="margin-bottom: 8px">
      <div style="display: flex">
        <div>
          <Dropdown text="Options ▼">
            <a>
              <div class="input__group">
                <div class="input__prefix--btn" @click="joinLock">Join</div>
                <input
                  type="text"
                  style="width: 92px"
                  placeholder="Enter Lock ID"
                  v-model="joinLockId"
                />
              </div>
            </a>
            <a @click="openCreate">
              <button style="width: 100%">Create Lock</button>
            </a>
          </Dropdown>
        </div>
        <div style="margin-left: 8px">
          <Dropdown text="Filters ▼">
            <a>
              <label>Unlocked</label>
              <input type="checkbox" v-model="filter.unlocked" />
              <span class="checkbox" @click="() => toggleFilter('unlocked')" />
            </a>
            <a>
              <label>Can Draw</label>
              <input type="checkbox" v-model="filter.drawable" />
              <span class="checkbox" @click="() => toggleFilter('drawable')" />
            </a>
          </Dropdown>
        </div>
      </div>
    </div>

    <div class="grid-4-8">
      <div class="card" v-for="lock in filteredLocks" :key="lock.id">
        <div class="title" :class="{ locked: !lock.isOpen, unlocked: lock.isOpen }">
          <div class="card-row">
            <div>#{{lock.id}}</div>
            <div class="lock-id">Edit Name</div>
          </div>
        </div>

        <div class="content">
          <div class="card-row">
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
              <template v-if="viewMode(lock) === 'owner' && lock.playerId">View</template>
              <template v-if="viewMode(lock) === 'owner' && !lock.playerId">Pending</template>
              <template v-if="viewMode(lock) === 'player'">
                <span v-if="lock.drawSeconds === 0">Draw</span>
                <span v-if="lock.drawSeconds > 0">{{nextDraw(lock)}}</span>
              </template>
            </button>
            <button @click="clickLock(lock)" v-if="lock.isOpen">Unlocked!</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.lock-id {
  color: $color-subtext;
  font-size: 10px;
}
.page {
  height: 100%;
}

.card {
  background-color: $color-primary;
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