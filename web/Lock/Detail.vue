<script lang="ts">
import Vue from 'vue'
import { Modal } from '../elements'
import { locks, auth } from '../store'
import { ClientLock } from '../store/lock'
import { LockAction } from '../../src/domain/game/lock/types'
import { common } from '../common'
import { AuthState } from '../store/auth'

type Data = {
  lockState: typeof locks.state
  auth: AuthState
  isOwner: boolean
  lock: ClientLock | null
  loading: boolean
  cards: number[]

  draw: {
    loading: boolean
    card: number
    drawn: LockAction | null
  }
}

export default Vue.extend({
  components: { Modal },
  props: {
    id: String,
  },
  data(): Data {
    return {
      auth: auth.state,
      lockState: locks.state,
      isOwner: false,
      loading: true,
      lock: null,
      cards: [],

      draw: {
        loading: false,
        card: -1,
        drawn: null,
      },
    }
  },
  methods: {
    format: common.formatDate,
    elapsed: common.elapsedSince,
    cardText(card: number): string {
      const draw = this.draw

      if (!this.canDraw) return '✗'

      switch (draw.card) {
        case -1: {
          return '?'
        }
        default: {
          if (card !== draw.card) return '?'
          return draw.drawn ? draw.drawn.type : '...'
        }
      }

      const remote = this.lockState.draw
      if (remote.currentId !== this.id) return '✗'
      if (!remote.action) return '✗'
      if (remote.card !== card) return '✗'
      return remote.action!.type
    },
    async drawCard(card: number) {
      if (!this.canDraw) return

      this.draw.loading = true
      this.draw.card = card

      const result = await locks.drawLockCard(this.lock!.id, card)
      this.draw.drawn = result
      this.draw.loading = false

      setTimeout(() => {
        this.setLock()
        this.draw.card = -1
        this.draw.drawn = null
      }, 3000)
    },
    async setLock(noRetry?: boolean) {
      const lock = locks.state.locks.find(lock => lock.id === this.id)
      if (lock) {
        this.lock = lock
        this.cards = Array.from({ length: lock.totalActions }, (_, i) => i)
        return
      }

      if (noRetry) return

      await locks.getLocks()
      this.setLock(true)
    },
  },
  async mounted() {
    locks.state.draw.currentId = this.id
    this.loading = true
    await this.setLock()
    this.loading = false
    if (this.lock) {
      this.isOwner = auth.state.userId === this.lock.ownerId
    }
  },
  computed: {
    canDraw() {
      const lock: ClientLock = this.$data.lock

      if (!lock || !auth) return false
      if (this.draw.drawn) return false
      if (lock.drawSeconds !== 0) return false
      if (lock.config.owner === 'self') return true
      return lock.playerId === this.$data.auth.userId
    },
    remoteCardType(): string | void {
      const state = this.lockState.draw
      if (!state.action) return

      return state.action.type
    },
  },
})
</script>

<template>
  <div class="page">
    <div v-if="!lock && !loading">Lock not found</div>
    <div v-if="!lock && loading">Loading...</div>
    <div v-if="lock" class="lockdetail">
      <div class="cards" v-if="!lock.isOpen">
        <div class="action-grid">
          <div v-for="card in cards" :key="card">
            <div class="card" :class="{ locked: !canDraw }" @click="drawCard(card)">
              <div class="card-holder">
                <div>{{cardText(card)}}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h1>History</h1>
        <table class="table condensed">
          <thead>
            <tr>
              <th>When</th>
              <th>Type</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(history, i) in lock.history" :key="i">
              <td>{{elapsed(history.date)}} ago</td>
              <td>{{history.type}}</td>
              <td>{{format(history.date)}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page {
  margin: -16px;
  padding: 16px;
  background-color: $color-accent;
}

.lockdetail {
  > div {
    margin: 16px 0;
  }

  > div:nth-child(1) {
    margin-top: 0;
  }

  td {
    width: 33%;
  }
}

.cards {
  display: flex;
  justify-content: center;
  width: 100%;
}

.action-grid {
  display: grid;
  align-items: center;
  grid-template-columns: repeat(auto-fit, 64px);
  row-gap: 12px;
  column-gap: 12px;
  width: 100%;

  .card {
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: 60px;
    box-shadow: 3px 3px 3px $color-primary;
    background-color: white;
    border: 1px solid $color-accent;
  }

  .locked {
    cursor: not-allowed;
  }

  .small {
    font-size: 12px;
  }
}
</style>