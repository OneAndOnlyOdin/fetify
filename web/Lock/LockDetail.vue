<script lang="ts">
import Vue from 'vue'
import { Modal } from '../elements'
import LockCard from './LockCard.vue'
import { locksApi, authApi } from '../store'
import { ClientLock } from '../store/lock'
import { LockHistory } from '../../src/domain/game/lock/types'
import { common } from '../common'
import { SocketMsg, LockDraw } from '../../src/sockets/types'
import { webSockets } from '../store/socket'
import { mapHistory } from './util'
import { LockDTO } from '../../src/domain/game/lock/store'

type Data = {
  timer?: NodeJS.Timeout
  listener: number
  loading: boolean
  lock?: ClientLock
  drawSeconds: number
  draw: {
    loading: boolean
    card: number
    drawn?: string
    task?: string
  }
  cards: number[]
  history: Array<LockHistory & { since: string }>
  showCard: {
    open: boolean
  }
}

export default Vue.extend({
  components: { Modal, LockCard },
  props: { id: String },
  data(): Data {
    return {
      listener: -1,
      drawSeconds: -1,
      loading: true,
      draw: { loading: false, card: -1 },
      cards: [],
      history: [],
      showCard: { open: false },
    }
  },
  methods: {
    format: common.formatDate,
    elapsed: common.elapsedSince,
    toDuration: common.toDuration,
    closeCard() {
      this.showCard.open = false
      this.draw.drawn = undefined
      this.draw.task = undefined
    },
    reveal(card: number): boolean {
      return this.draw.card === card
    },
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
      return locksApi.state.locks[this.id]
    },
    async drawCard(card: number) {
      if (!this.canDraw) return
      this.draw.loading = true
      this.draw.drawn = '???'
      this.draw.card = card
      await locksApi.drawLockCard(this.lock!.id, card)

      setTimeout(this.unsetDrawn, 3000)
    },
    unsetDrawn() {
      this.draw.card = -1
    },
    recvLock(dto: LockDTO) {
      if (!this.lock || this.lock.id !== dto.id) return
      this.lock = { ...dto, drawSeconds: locksApi.getDrawSecs(dto.draw) }
      this.history = mapHistory(dto.history)
      this.setCards()
    },
    recvDraw(draw: LockDraw) {
      if (this.id !== draw.lockId) return
      console.log(draw)
      this.draw.drawn = draw.action.type
      this.draw.task = draw.task

      if (this.draw.loading) {
        this.showCard.open = true
        this.draw.loading = false
      }

      setTimeout(this.unsetDrawn, 3000)
    },
    onMessage(msg: SocketMsg) {
      if (!this.lock) return

      switch (msg.type) {
        case 'lock':
          this.recvLock(msg.payload)
          return

        case 'lock-draw':
          this.recvDraw(msg.payload)
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
    if (this.lock) {
      this.history = mapHistory(this.lock.history)
    }

    this.timer = setInterval(() => {
      if (!this.lock) return
      this.drawSeconds = locksApi.getDrawSecs(this.lock.draw)
      for (const hist of this.history) {
        hist.since = common.elapsedSince(hist.date)
      }
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
    isOwner(): boolean {
      return this.lock ? authApi.state.userId === this.lock.ownerId : false
    },
    canDraw(): boolean {
      const lock = this.lock

      if (!lock) return false
      if (this.draw.card > -1) return false
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
      <div v-if="!lock.isOpen">
        <b>Next card available:</b>
        {{toDuration(drawSeconds, true) || 'now'}}
      </div>
      <div class="cards" v-if="!lock.isOpen">
        <div class="action-grid">
          <div v-for="(card, i) in cards" :key="card">
            <div class="card" :class="{ locked: !canDraw }" @click="drawCard(i)">
              <div class="card__inner" :class="{ 'card--flipped': draw.card === i }">
                <div class="card__front">{{cardText}}</div>
                <div class="card__back">
                  <div>{{draw.drawn}}</div>
                </div>
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
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(history, i) in history" :key="i">
              <td>{{history.since}} ago ({{format(history.date)}})</td>
              <td>{{history.type}}</td>
              <td>{{history.extra}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <LockCard :open="showCard.open" :onHide="closeCard" :card="draw.drawn" :task="draw.task" />
  </div>
</template>

<style lang="scss" scoped>
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
    cursor: pointer;

    height: 60px;
    background-color: transparent;
    perspective: 1000px;
    border: 0;
  }

  .card__inner {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 0.8s;
    transform-style: preserve-3d;
  }

  .card__back {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 0.8s;
    transform-style: preserve-3d;
  }

  .card--flipped {
    transform: rotateY(180deg);
  }

  .card__front,
  .card__back {
    position: absolute;
    box-shadow: 3px 3px 3px #999;
    border: 1px solid $color-accent;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: space-around;
  }

  /* Style the front side (fallback if image is missing) */
  .card__front {
    background-color: $color-secondary;
    color: black;
  }

  /* Style the back side */
  .card__back {
    background-color: $color-unlocked;
    color: $color-text;
    transform: rotateY(180deg);
  }

  .locked {
    cursor: not-allowed;
  }

  .small {
    font-size: 12px;
  }
}
</style>