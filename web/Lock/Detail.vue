<script lang="ts">
import Vue from 'vue'
import { Modal } from '../elements'
import { locks } from '../store'
import { ClientLock } from '../store/lock'
import { LockAction } from '../../src/domain/game/lock/types'
import { common } from '../common'

type Data = {
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
    async drawCard(card: number) {
      if (!this.lock) return
      this.draw.loading = true
      this.draw.card = card

      const result = await locks.drawLockCard(this.lock.id, card)
      this.draw.drawn = result
      this.draw.loading = false

      setTimeout(() => {
        this.draw.card = -1
        this.draw.drawn = null
        this.setLock()
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
    this.loading = true
    await this.setLock()
    this.loading = false
  },
})
</script>

<template>
  <div>
    <div v-if="!lock && !loading">Lock not found</div>
    <div v-if="!lock && loading">Loading...</div>
    <div v-if="lock" class="lockdetail">
      <div>Drawable: {{lock.drawSeconds === 0 ? 'yes' : 'no'}}</div>

      <div class="action-grid">
        <div v-for="card in cards" :key="card">
          <div class="card" @click="drawCard(card)">
            <div v-if="card === draw.card" class="content">
              <div v-if="!draw.drawn">...</div>
              <div v-if="draw.drawn">{{draw.drawn.type}}</div>
            </div>

            <div v-if="card !== draw.card" class="content">#{{card + 1}}</div>
          </div>
        </div>
      </div>

      <div>
        History
        <div
          v-for="(history, i) in lock.history"
          :key="i"
        >{{format(history.date)}}: {{history.type}}</div>
      </div>
    </div>
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
}
.action-grid {
  display: grid;
  align-items: center;
  grid-template-columns: repeat(auto-fit, 80px);
  row-gap: 12px;
  column-gap: 12px;

  .card {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: 80px;

    &:hover {
      background-color: lighten($color-accent, 10%);
    }
  }
}
</style>