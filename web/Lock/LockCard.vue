<script lang="ts">
import Vue, { PropType } from 'vue'
import { Modal } from '../elements'
import { actionOptions } from '../../src/domain/game/lock/util'

export default Vue.extend({
  components: { Modal },
  props: {
    open: Boolean,
    onHide: { type: Function as PropType<() => void> },
    task: { type: String },
    card: { type: String },
  },
  computed: {
    cardType(): string {
      return this.card || ''
    },
    cardInfo(): string {
      const opts = actionOptions[this.card]
      return opts ? opts.desc : ''
    },
  },
})
</script>

<template>
  <Modal v-model="open" :onHide="onHide">
    <template v-slot:header>Lock Card</template>
    <div class="page">
      <div>You drew</div>
      <div class="card--back" :class="card">
        <h1>{{cardType}}</h1>
      </div>
      <div>{{cardInfo}}</div>
      <div v-if="task">
        <b>Task:</b>
        {{task}}
      </div>
    </div>

    <template v-slot:footer>
      <button @click="onHide">Close</button>
    </template>
  </Modal>
</template>

<style lang="scss" scoped>
.page {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-direction: column;
}

.card--back {
  margin: 16px 0;
  background-color: $color-secondary;
  border-radius: 5px;
  border: 1px solid $color-accent;
  padding: 16px;
}

.blank {
  background-color: $color-locked;
}

.task {
  background-color: $color-task;
}

.half,
.double {
  background-color: $color-multiply;
}

.decrease,
.increase {
  background-color: $color-change;
}

.unlock {
  background-color: $color-unlocked;
}
</style>