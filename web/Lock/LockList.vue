<script lang="ts">
import Vue from 'vue'
import { locksApi, authApi } from '../store'
import Create from './CreateLock.vue'
import { common } from '../common'
import { navigate } from '../router'
import { ClientLock, getDrawSecs } from '../store/lock'
import { Dropdown } from '../elements'
import { AuthState } from '../store/auth'
import ListCard from './ListCard.vue'

type Data = {
  interval?: NodeJS.Timer
  joinLockId: string
  locks: ClientLock[]
  auth: AuthState
  filter: {
    unlocked: boolean
    drawable: boolean
  }
}

export default Vue.extend({
  components: { Create, Dropdown, ListCard },
  data(): Data {
    return {
      joinLockId: '',
      locks: [],
      auth: authApi.state,
      filter: {
        unlocked: false,
        drawable: false,
      },
    }
  },
  methods: {
    async joinLock() {
      await locksApi.joinLock(this.joinLockId)
      this.joinLockId = ''
    },
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
    openCreate() {
      navigate('/locks/create')
    },

    toDuration: common.toDuration,

    updateLocks() {
      this.locks = this.locks.filter(isVisible)

      for (const lock of this.locks) {
        lock.draw = locksApi.state.locks[lock.id].draw
        lock.name = locksApi.state.locks[lock.id].name
        lock.drawSeconds = getDrawSecs(lock.draw)
      }
    },
  },
  computed: {
    filteredLocks(): ClientLock[] {
      return this.locks.filter(lock => {
        if (lock.deleted) return false
        if (this.filter.unlocked && lock.isOpen) return false
        if (this.filter.drawable) {
          if (lock.isOpen) return false
          if (lock.drawSeconds !== 0) return false
        }
        return true
      })
    },
  },
  async mounted() {
    this.locks = await locksApi.getLocks()
    this.interval = setInterval(this.updateLocks, 1000)

    const persisted = common.hydrate<Partial<Data['filter']>>('lock-filters')
    this.filter = { ...this.filter, ...persisted }
  },
  beforeDestroy() {
    clearInterval(this.interval!)
  },
})

function isVisible(lock: ClientLock) {
  return !lock.deleted
}
</script>

<template>
  <div class="locks">
    <div style="margin-bottom: 8px">
      <div style="display: flex">
        <div>
          <Dropdown text="Options ▼">
            <a>
              <div class="group">
                <div class="group__button" @click="joinLock">Join</div>
                <input type="text" style="width: 92px" placeholder="Enter Lock ID" v-model="joinLockId" />
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

    <div class="grid-4">
      <ListCard v-for="lock in filteredLocks" :key="lock.id" :lock="lock" :viewMode="viewMode(lock)" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.lock-id {
  color: $color-subtext;
  font-size: 10px;
}

.locks {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;

  @include mobile {
    padding: 8px;
  }
}

.card {
  background-color: $color-primary;
  width: 100%;
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
</style>
