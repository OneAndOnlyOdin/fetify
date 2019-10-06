<script lang="ts">
import Vue, { PropType } from 'vue'
import { Modal } from '../elements'
import { ClientLock } from '../store/lock'
import DeleteLock from './DeleteLock.vue'
import { locksApi, toastApi } from '../store'
import { navigate } from '../router'
import { ActionType } from '../../src/domain/game/lock/types'
import { actionOptions } from '../../src/domain/game/lock/util'

const cardConfig: { [type in ActionType]: number } = {
  blank: 0,
  freeze: 0,
  increase: 0,
  decrease: 0,
  double: 0,
  half: 0,
  unlock: 0,
  task: 0,
  reset: 0,
}

export default Vue.extend({
  components: { Modal, DeleteLock },
  props: {
    lock: { type: Object as PropType<ClientLock> },
    isOpen: Boolean,
    onOpen: { type: Function as PropType<() => void> },
    onHide: { type: Function as PropType<() => void> },
  },
  data() {
    return {
      nameLoading: false,
      isDeleteOpen: false,
      newName: '',
      cards: {
        loading: false,
        config: { ...cardConfig },
      },
    }
  },
  methods: {
    openDelete() {
      this.isDeleteOpen = true
    },
    closeDelete() {
      this.isDeleteOpen = false
      this.onOpen()
    },
    async addCards() {
      try {
        this.cards.loading = true
        await locksApi.addCards(this.lock.id, this.cards.config)
        this.cards.config = { ...cardConfig }
      } finally {
        this.cards.loading = false
      }
    },
    async confirmDelete() {
      await locksApi.deleteLock(this.lock.id)
      this.isDeleteOpen = false
      navigate('/locks')
    },
    async renameLock() {
      if (this.newName === this.lock.name) return
      try {
        this.nameLoading = true
        await locksApi.renameLock(this.lock.id, this.newName)
        toastApi.success('Lock has been renamed')
      } finally {
        this.nameLoading = false
      }
    },
    validateAddCard(type: string, value: number) {
      if (value < 0 || !this.lock.counts) {
        this.cards.config[type] = 0
        return
      }

      const curr = this.lock.counts![type]!
      const max = actionOptions[type].max! - curr
      if (value > max) {
        this.cards.config[type] = max
      }
    },
  },
  mounted() {
    this.newName = this.lock.name || ''
  },
  computed: {
    canAddCards(): boolean {
      if (this.cards.loading) return false

      let sum = 0
      for (const key in this.cards.config) {
        sum += this.cards.config[key]
      }
      return sum > 0
    },
  },
})
</script>

<template>
  <Modal v-model="isOpen" :onHide="onHide">
    <template slot="header">Lock Options</template>

    <div class="input__group">
      <div @click="renameLock" class="input__prefix--btn" :class="{ disabled: nameLoading }">Rename</div>
      <input type="text" v-model="newName" v-on:keyup.enter="renameLock" :disabled="nameLoading" />
    </div>

    <div class="option__btn">
      <button @click="openDelete" style="margin-top: 16px">Delete Lock</button>
    </div>

    <div v-if="lock.counts">
      <h3>Add Cards</h3>

      <div class="add__grid">
        <div class="input__group" v-for="type in Object.keys(cards.config)" :key="type">
          <div class="input__prefix" style="width: 72px">{{type}}</div>
          <input
            type="number"
            style="width: 40px"
            v-model.number="cards.config[type]"
            v-on:input="validateAddCard(type, Number($event.target.value))"
          />
        </div>
      </div>

      <div class="option__btn">
        <button @click="addCards" :disabled="!canAddCards">Add Cards</button>
      </div>
    </div>

    <template slot="footer">
      <div class="footer">
        <button @click="onHide">Close</button>
      </div>
    </template>

    <DeleteLock
      :id="lock.id"
      :isOpen="isDeleteOpen"
      :confirm="confirmDelete"
      :onHide="closeDelete"
    />
  </Modal>
</template>

<style lang="scss" scoped>
.footer {
  display: flex;
  justify-content: flex-end;
}

.add__grid {
  display: grid;
  grid-template-areas: '. .';
  grid-template-columns: 1fr 1fr;
  justify-items: center;
  row-gap: 4px;
}

.option__btn {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}
</style>