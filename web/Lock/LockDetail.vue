<script lang="ts">
import Vue from 'vue'
import { Dropdown } from '../elements'
import LockCard from './LockCard.vue'
import LockOptions from './LockOptions.vue'
import { locksApi, authApi, toastApi } from '../store'
import { ClientLock } from '../store/lock'
import { LockHistory } from '../../src/domain/lock/types'
import { common } from '../common'
import { SocketMsg, Payload } from '../../src/sockets/types'
import { webSockets } from '../store/socket'
import { mapHistory, toCountsArray, ActionCount } from './util'
import { getRand } from '../../src/domain/lock/util'

type Data = {
  timer?: NodeJS.Timeout
  listener: number
  loading: boolean
  lock?: ClientLock
  drawSeconds: number
  manualCard: number
  draw: {
    loading: boolean
    lastCard: number
    card: number
    drawn?: string
    task?: string
  }
  counts?: ActionCount[]
  history: Array<LockHistory & { since: string }>
  showCard: {
    open: boolean
  }
  newName: string
  nameLoading: boolean
  isOptionsOpen: boolean
}

export default Vue.extend({
  components: { LockCard, LockOptions, Dropdown },
  props: { id: String },
  data(): Data {
    return {
      manualCard: 1,
      listener: -1,
      drawSeconds: -1,
      loading: true,
      draw: { loading: false, card: -1, lastCard: -1 },
      history: [],
      showCard: { open: false },
      newName: '',
      nameLoading: false,
      isOptionsOpen: false,
    }
  },
  methods: {
    format: common.formatDate,
    elapsed: common.elapsedSince,
    toDuration: common.toDuration,
    openOptions() {
      this.isOptionsOpen = true
    },
    closeOptions() {
      this.isOptionsOpen = false
    },
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
    async getLock(refresh?: boolean) {
      if (refresh) {
        await locksApi.getLocks()
      }

      const lock = locksApi.state.locks[this.id]
      if (lock) {
        this.lock = { ...lock }
        this.updateLock()
        this.$forceUpdate()
      }

      if (!this.lock && !refresh) {
        this.getLock(true)
      }
    },
    validateManual(num: number) {
      const total = this.lock ? this.lock.totalActions : 0
      if (num > total) this.manualCard = total
      if (num < 1) this.manualCard = 1
    },
    drawRandomCard() {
      if (!this.canDraw || !this.lock) return
      const randomCard = getRand(0, this.lock.totalActions - 1)
      return this.drawCard(randomCard)
    },
    async drawCard(card: number) {
      if (!this.canDraw) return
      this.draw.loading = true
      try {
        await locksApi.drawLockCard(this.lock!.id, card)
        this.draw.lastCard = card
        this.draw.drawn = '???'
        this.draw.card = card
      } catch (ex) {
        if (ex.code === 'CANNOT_DRAW') {
          toastApi.error('Cannot draw yet. Try again soon.')
        } else {
          const message = ex.message || 'Try again soon.'
          toastApi.error(`Failed to draw: ${message}`)
        }
        return this.getLock()
      } finally {
        setTimeout(this.unsetDrawn, 1000)
      }
    },
    unsetDrawn() {
      this.draw.card = -1
    },
    updateLock() {
      if (!this.lock) return
      this.history = mapHistory(this.lock.history)
      this.counts = toCountsArray(this.lock.counts)
    },
    recvLock(dto: Payload<'lock'>) {
      if (!this.lock || this.lock.id !== dto.id) return
      this.lock = { ...dto, drawSeconds: locksApi.getDrawSecs(dto.draw) }
      this.updateLock()
    },
    recvDraw(draw: Payload<'lock-draw'>) {
      if (this.id !== draw.lockId) return
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
    updateTime() {
      if (!this.lock) return
      this.drawSeconds = locksApi.getDrawSecs(this.lock.draw)
      for (const hist of this.history) {
        hist.since = common.elapsedSince(hist.date)
      }
    },
  },
  async mounted() {
    this.listener = webSockets.on(this.onMessage)
    await this.getLock()
    this.loading = false
    this.newName = this.lock ? this.lock.name || '' : ''
    this.updateLock()
    this.updateTime()
    this.timer = setInterval(this.updateTime, 1000)
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

      if (!lock || this.loading) return false
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
    <div v-if="lock" class="lock__box">
      <div class="card__grid" v-if="counts">
        <div class="card__count" :class="card.type" v-for="card in counts" :key="card.type">
          <div>
            <b>{{ card.type }}</b>
          </div>
          <div>{{ card.count }}</div>
          <div>{{ card.chance }}%</div>
        </div>
      </div>

      <div class="lock__info">
        <div>
          <div v-if="!lock.isOpen">
            <b>Next card available:</b>
            {{ toDuration(drawSeconds, true) || 'now' }}
          </div>
          <div>
            <b>Total cards:</b>
            {{ lock.totalActions }}
          </div>
        </div>

        <div>
          <button @click="openOptions">Options</button>
        </div>
      </div>

      <div v-if="!lock.isOpen" class="excess">
        <div v-if="lock.totalActions > 500" style="margin-bottom: 12px">
          You have too many cards to display all of them!
        </div>
        <div class="excess__opts">
          <button style="margin-right: 12px" @click="drawRandomCard" :disabled="!canDraw">Draw Random Card</button>

          <div class="input__group">
            <div @click="drawCard(manualCard)" class="input__prefix--btn" :class="{ disabled: !canDraw }">Draw</div>
            <input
              type="number"
              v-model.number="manualCard"
              v-on:inpu="validateManual"
              v-on:keyup.enter="drawCard(manualCard - 1)"
              style="width: 90px"
              :disabled="!canDraw"
            />
          </div>
        </div>
      </div>

      <div class="cards" v-if="!lock.isOpen">
        <div v-if="lock.totalActions <= 500" class="action-grid">
          <div v-for="card in lock.totalActions" :key="card">
            <div class="card" :class="{ locked: !canDraw }" @click="drawCard(card - 1)">
              <div class="card__inner" :class="{ 'card--flipped': draw.card === card - 1 }">
                <div class="card__front">{{ cardText }}</div>
                <div :class="'card__back ' + draw.drawn">
                  <div>{{ draw.drawn }}</div>
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
              <td>{{ history.since }} ago ({{ format(history.date) }})</td>
              <td>{{ history.type }}</td>
              <td>{{ history.extra }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <LockCard :open="showCard.open" :onHide="closeCard" :card="draw.drawn" :task="draw.task" :cardNo="draw.lastCard" />
    <LockOptions
      v-if="lock && isOptionsOpen"
      :lock="lock"
      :onHide="closeOptions"
      :onOpen="openOptions"
      :isOpen="isOptionsOpen"
    />
  </div>
</template>

<style lang="scss" scoped>
.page {
  width: 100%;
}

.excess {
  display: flex;
  align-items: center;
  flex-direction: column;

  .excess__opts {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
}

.card__grid {
  width: 100%;
  display: grid;
  column-gap: 16px;
  row-gap: 16px;
  grid-template-columns: repeat(auto-fit, 72px);
  justify-content: center;

  @include mobile {
    column-gap: 8px;
    row-gap: 8px;
  }
}

.card__count {
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  justify-content: center;
  align-items: center;
  height: 60px;
  width: 100%;
}

.lock__opts {
  @include mobile {
    margin-top: 8px;
  }
}
.lock__info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.lock__box {
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
  justify-content: center;

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
    border: 1px solid $color-accent;
    border-radius: 5px;
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
    color: $color-text;
    transform: rotateY(180deg);
  }

  .locked {
    cursor: default;
  }

  .small {
    font-size: 12px;
  }
}
</style>
