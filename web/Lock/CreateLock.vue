<script lang="ts">
import Vue from 'vue'
import { Modal, Select } from '../elements'
import { CreateData, create, toLockConfig, estimate } from './util'
import { webSockets, toastApi } from '../store'
import { navigate } from '../router'
import { common } from '../common'
import { ActionType } from '../../src/domain/game/lock/types'
import { actionOptions } from '../../src/domain/game/lock/util'

type Data = CreateData & {
  loading: boolean
}

export default Vue.extend({
  components: { Modal, Select },
  data(): Data {
    return {
      loading: false,
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
      tasks: [''],
      actions: { ...actionOptions },
    }
  },
  mounted() {
    this.loading = false
  },
  methods: {
    ...common,
    addTask() {
      this.tasks.push('')
    },
    removeTask(pos: number) {
      this.tasks.splice(pos, 1)
    },
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
      toastApi.raise({ type: 'success', message: `Created lock ${id}` })
    },
    options(): Array<{ type: ActionType; max: number; desc: string }> {
      return Object.entries(actionOptions).map(([type, { desc, max }]) => ({
        max: max!,
        type: type as ActionType,
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
      const { avg, worst } = estimate(cfg)
      return `avg: ${common.toDuration(avg, true)}, worst: ${common.toDuration(
        worst,
        true
      )}`
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
        <Select v-model="owner">
          <option value="self">Self</option>
          <option value="other">Other</option>
        </Select>
      </div>

      <div>
        <label>Lock Type</label>

        <Select v-model="time.type">
          <option value="variable">Game</option>
          <option value="fixed">Fixed</option>
        </Select>
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
        <Select v-model="time.multiplier">
          <option value="hours">Hours</option>
          <option value="days">Days</option>
        </Select>
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
            <Select v-model="interval.type">
              <option value="mins">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
            </Select>
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

        <div>
          <h3>
            Tasks
            <button @click="addTask">Add Task</button>
          </h3>
        </div>
        <div style="text-align: left;">
          Tasks are given randomly to the player when a task card is drawn.
          <br />If no tasks are provided here, the task "Perform a task for the key holder!" will be given.
        </div>
        <div v-for="(task, i) in tasks" :key="i">
          <div style="height: 42px; display: flex;">
            <button @click="removeTask(i)" style="width: 42px">-</button>
            <input
              type="text"
              v-model="tasks[i]"
              style="width: 300px"
              maxlength="255"
              v-on:keyup.enter="addTask"
            />
          </div>
        </div>
      </div>
    </content>

    <div class="lock__create">
      <button style="width: 120px;" @click="create" :disabled="loading">Create</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page {
  max-width: 800px;
}

.lock__create {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
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