<script lang="ts">
import Vue from 'vue'
import { Modal, Dropdown } from '../elements'
import { CreateData, create, toLockConfig, estimate } from './util'
import { webSockets } from '../store/socket'
import { navigate } from '../router'
import { common } from '../common'
import { ActionType } from '../../src/domain/game/lock/types'
import { actionOptions } from '../../src/domain/game/lock/util'

type Data = CreateData & {
  loading: boolean
  simResults: {
    valid: boolean
    min: number
    avg: number
    max: number
  }
}

export default Vue.extend({
  components: { Modal, Dropdown },
  data(): Data {
    return {
      loading: false,
      simResults: {
        valid: false,
        min: 0,
        avg: 0,
        max: 0,
      },
      owner: 'self',
      time: {
        type: 'variable',
        amount: '24',
        multiplier: 'hours',
      },
      interval: {
        amount: '10',
        type: 'mins',
      },
      showActions: true,
      actions: { ...actionOptions },
    }
  },
  mounted() {
    this.loading = false
  },
  methods: {
    toDuration: common.toDuration,
    upper(value: string) {
      return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`
    },
    toggleShowActions() {
      this.showActions = !this.showActions
    },
    async create() {
      const id = await create(this.$data as any)
      await webSockets.subscribe({ type: 'lock', id })
      navigate('/locks')
    },
    options() {
      return Object.entries(actionOptions).map(([type, { desc, max }]) => ({
        max,
        type,
        desc,
      }))
    },
    validateAction(type: ActionType, value: number) {
      const max = actionOptions[type].max
      if (!max) return

      if (value > max) {
        this.actions[type].value = max
      }

      if (value < 0) {
        this.actions[type].value = 0
      }
    },
  },
  computed: {
    estimate() {
      const cfg = toLockConfig(this.$data as any)
      const intervals = estimate(cfg)
      const seconds = cfg.intervalMins * 60
      return common.toDuration(intervals * seconds, true)
    },
  },
})
</script>

<template>
  <div class="page">
    <div style="display: flex; justify-content: center;">
      <h1>Create Lock</h1>
    </div>

    <content>
      <div>
        <label>Lock For</label>
        <Dropdown v-model="owner">
          <option value="self">Self</option>
          <option value="other">Other</option>
        </Dropdown>
      </div>

      <div>
        <label>Lock Type</label>

        <Dropdown v-model="time.type">
          <option value="variable">Game</option>
          <option value="fixed">Fixed</option>
        </Dropdown>
      </div>

      <div>
        <span v-if="time.type === 'fixed'">
          <b>Fixed</b>: The lock runs for a fixed length of time
        </span>

        <span v-if="time.type === 'variable'">
          <b>Game</b>: A card game determines when the lock opens
        </span>
      </div>

      <div v-if="time.type === 'fixed'">
        <label>Fixed Lock Duration</label>
        <input style="width: 60px" type="number" v-model="time.amount" />
        <Dropdown v-model="time.multiplier">
          <option value="hours">Hours</option>
          <option value="days">Days</option>
        </Dropdown>
      </div>

      <div class="variable" v-if="time.type === 'variable'">
        <div>
          <label>Estimate</label>
          <div style="padding: 12px 0">{{estimate}}</div>
        </div>
        <div>
          <label>Cards</label>
        </div>

        <div>
          <label>Draw Card Interval</label>
          <div style="height: 42px;">
            <input style="width: 50px" type="number" v-model="interval.amount" />
            <Dropdown v-model="interval.type">
              <option value="mins">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
            </Dropdown>
          </div>
        </div>

        <div>
          <label>Show actions to locked player?</label>
          <input type="checkbox" v-model="showActions" />
          <span class="checkbox" @click="toggleShowActions" />
        </div>

        <div v-for="action in options()" :key="action.type">
          <label class="small">{{upper(action.type)}}: {{action.desc}} [{{action.max}}]</label>
          <input
            type="number"
            v-model.number="actions[action.type].value"
            v-on:input="validateAction(action.type, Number($event.target.value))"
          />
        </div>
      </div>
    </content>

    <div style="display: flex; justify-content: center;">
      <button style="width: 120px;" @click="create" :disabled="loading">Create</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page {
  max-width: 800px;
}

content {
  display: flex;
  flex-direction: column;
  text-align: center;

  > div {
    display: flex;
    justify-content: space-between;
    text-align: center;
    margin-bottom: 8px;
  }

  label {
    font-size: 16px;
    text-align: left;
    padding: 12px 0;

    > span {
      font-size: 12px;
    }

    &.small {
      font-size: 14px;
      padding: 8px 0;
    }
  }

  label.small + input {
    width: 40px;
    height: 30px;
  }

  .variable {
    width: 100%;
    display: flex;
    flex-direction: column;

    text-align: center;

    > div {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
  }
}
</style>