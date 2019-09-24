<script lang="ts">
import Vue, { PropType } from 'vue'
import { Modal, Dropdown } from '../elements'
import { LockConfig, LockAction } from '../../src/domain/game/types'

interface Data {
  owner: 'self' | 'other'
  time: {
    type: LockConfig['time']['type']
    amount: string
    multiplier: 'hours' | 'days'
  }
  interval: {
    amount: string
    type: 'mins' | 'hours' | 'days'
  }
  actions: Array<LockAction & { value: string; desc: string }>
}

export default Vue.extend({
  components: { Modal, Dropdown },
  props: {
    value: Boolean,
    onHide: { type: Function as PropType<() => void> },
  },
  methods: {
    upper(value: string) {
      return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`
    },
  },
  data(): Data {
    return {
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
      actions: [
        { type: 'blank', value: '10', desc: 'has no effect' },
        {
          type: 'freeze',
          value: '2',
          desc: 'freezes the lock for 2x the interval',
        },
        {
          type: 'increase',
          value: '10',
          desc: 'increase the number of blanks by 1-3 ',
        },
        {
          type: 'decrease',
          value: '5',
          desc: 'decrease the number of blanks by 1-3',
        },
        { type: 'double', value: '2', desc: 'double the number of blanks' },
        { type: 'half', value: '1', desc: 'halve the number of blanks' },
        { type: 'unlock', value: '1', desc: 'collect all of these to unlock' },
        { type: 'task', value: '0', desc: 'do a task! has no other effect' },
      ],
    }
  },
})
</script>

<template>
  <Modal v-model="value" :onHide="onHide">
    <template slot="header">Create Lock</template>

    <content>
      <div>
        <label>Owner</label>
        <Dropdown v-model="owner">
          <option value="self">Self</option>
          <option value="other">Other</option>
        </Dropdown>
      </div>

      <div>
        <label>
          Lock Type
          <br />
          <span v-if="time.type === 'fixed'">
            <b>Fixed</b>: The lock runs for a fixed length of time
          </span>

          <span v-if="time.type === 'variable'">
            <b>Game</b>: A card game determines when the lock opens
          </span>
        </label>

        <Dropdown v-model="time.type">
          <option value="variable">Game</option>
          <option value="fixed">Fixed</option>
        </Dropdown>
      </div>

      <div v-if="time.type === 'fixed'">
        <label>Fixed Lock Duration</label>
        <input style="width: 60px" type="number" v-model="time.amount" />
        <Dropdown v-model="time.multiplier">
          <option value="hours">Hours</option>
          <option value="days">Days</option>
        </Dropdown>
      </div>

      <div v-if="time.type === 'variable'">
        <label>Draw Card Interval</label>
        <input style="width: 60px" type="number" v-model="interval.amount" />
        <Dropdown v-model="interval.type">
          <option value="mins">Minutes</option>
          <option value="hours">Hours</option>
          <option value="days">Days</option>
        </Dropdown>
      </div>

      <div v-if="time.type === 'variable'">
        <label>Cards</label>
      </div>

      <div v-for="action in actions" :key="action.type">
        <template v-if="time.type === 'variable'">
          <label class="small">{{upper(action.type)}}: {{action.desc}}</label>
          <input type="number" v-model="action.value" />
        </template>
      </div>
    </content>

    <template slot="footer">
      <div style="float:right">
        <button>Cancel</button>
        <button>Create</button>
      </div>
    </template>
  </Modal>
</template>

<style lang="scss" scoped>
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
}
</style>