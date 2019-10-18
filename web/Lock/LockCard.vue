<script lang="ts">
import Vue, { PropType } from 'vue'
import { Modal } from '../elements'
import { actionOptions } from '../../src/domain/lock/util'

export default Vue.extend({
  components: { Modal },
  props: {
    open: Boolean,
    onHide: { type: Function as PropType<() => void> },
    task: { type: String },
    card: { type: String },
    cardNo: Number,
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
    <template slot="header">Card #{{cardNo}}</template>
    <div class="page">
      <div>You drew</div>
      <div :class="'card--back ' + card">
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
  border-radius: 5px;
  border: 1px solid $color-accent;
  padding: 16px;
}
</style>