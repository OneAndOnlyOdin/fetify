<script lang="ts">
import Vue from 'vue'
import { Modal } from '../elements'
import { locksApi, authApi } from '../store'
import { ClientLock } from '../store/lock'
import { LockAction } from '../../src/domain/game/lock/types'
import { common } from '../common'
import { SocketMsg } from '../../src/sockets/types'
import { webSockets } from '../store/socket'

type Data = {
  timer?: NodeJS.Timeout
  listener: number
  loading: boolean
  lock?: ClientLock
  drawSeconds: number
  draw: {
    loading: boolean
    card: number
    drawn: string | null
  }
  remote: {
    card: number
    action?: LockAction
  }
  cards: number[]
}

export default Vue.extend({
  components: { Modal },
  props: {
    id: String,
  },
  data(): Data {
    return {
      listener: -1,
      drawSeconds: 0,
      loading: true,
      draw: {
        loading: false,
        card: -1,
        drawn: null,
      },
      remote: {
        card: -1,
      },
      cards: [],
    }
  },
  methods: {
    format: common.formatDate,
    elapsed: common.elapsedSince,
    toDuration: common.toDuration,
    isHolder(): boolean {
      if (!this.lock) return false
      if (this.lock.config.owner === 'self') return false
      return authApi.state.userId === this.lock.ownerId
    },
    setCards() {
      if (!this.lock) return
      const length = this.lock.totalActions
      this.cards = Array.from({ length }, (_, i) => i)
    },
    getLock() {
      return locksApi.state.locks.find(lock => lock.id === this.id)
    },
    async drawCard(card: number) {
      if (!this.canDraw) return

      this.draw.loading = true

      const result = await locksApi.drawLockCard(this.lock!.id, card)
      this.draw.card = card
      this.draw.drawn = result.type
      this.draw.loading = false
      this.setCards()

      setTimeout(() => {
        this.draw.card = -1
        this.draw.drawn = null
        this.setCards()
      }, 3000)
    },
    onMessage(msg: SocketMsg) {
      if (!this.lock) return

      switch (msg.type) {
        case 'lock':
          if (!this.lock) return
          if (this.lock.id !== this.id) return
          this.lock = { ...this.lock, ...msg.payload }
          this.drawSeconds = locksApi.getDrawSecs(this.lock)
          return

        case 'lock-draw':
          if (this.id !== msg.payload.lockId) return
          this.remote.card = msg.payload.card
          this.remote.action = msg.payload.action

          setTimeout(() => {
            this.remote.card = -1
            this.remote.action = undefined
          }, 3000)
          return
      }
    },
  },
  async mounted() {
    this.listener = webSockets.on(this.onMessage)
    this.lock = this.getLock()
    if (!this.lock) {
      await locksApi.getLocks()
      this.lock = this.getLock()
    }
    this.setCards()
    this.loading = false
    this.timer = setInterval(() => {
      if (!this.lock) return
      this.drawSeconds = locksApi.getDrawSecs(this.lock)
    }, 750)
  },
  beforeDestroy() {
    clearInterval(this.timer!)
    webSockets.remove(this.listener)
  },
  computed: {
    cardText(): string {
      if (!this.lock || this.isHolder()) return '✗'
      return this.canDraw ? '?' : '✗'
    },
    history(): ClientLock['history'] {
      if (!this.lock) return []
      return this.lock.history
        .slice()
        .sort((l, r) => (l.date > r.date ? -1 : l.date === r.date ? 0 : 1))
    },
    isOwner(): boolean {
      return this.lock ? authApi.state.userId === this.lock.ownerId : false
    },
    canDraw(): boolean {
      const lock = this.lock

      if (!lock) return false
      if (this.draw.drawn) return false
      if (this.drawSeconds !== 0) return false
      if (lock.config.owner === 'self') return true
      return lock.playerId === authApi.state.userId
    },
  },
})
</script>

<template>
  <div class="page">
    <div v-if="!lock && !loading">Lock not found</div>
    <div v-if="!lock && loading">Loading...</div>
    <div v-if="lock" class="lockdetail">
      <div>Time til next card: {{toDuration(drawSeconds, true) || 'now'}}</div>
      <div class="cards" v-if="!lock.isOpen">
        <div class="action-grid">
          <div v-for="(card, i) in cards" :key="card">
            <div class="card" :class="{ locked: !canDraw }" @click="drawCard(i)">
              <div class="card-holder">
                <div v-if="remote.card === i">{{remote.action.type}}</div>
                <div v-if="remote.card !== i">{{draw.card === i ? draw.drawn : cardText}}</div>
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
            <tr v-for="(history, i) in history" :key="i">
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