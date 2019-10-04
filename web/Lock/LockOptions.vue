<script lang="ts">
import Vue, { PropType } from 'vue'
import { Modal } from '../elements'
import { ClientLock } from '../store/lock'
import DeleteLock from './DeleteLock.vue'
import { locksApi, toastApi } from '../store'
import { navigate } from '../router'

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
  },
  mounted() {
    this.newName = this.lock.name || ''
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

    <button @click="openDelete" style="margin-top: 16px">Delete Lock</button>

    <template slot="footer">
      <button @click="onHide">Close</button>
    </template>

    <DeleteLock
      :id="lock.id"
      :isOpen="isDeleteOpen"
      :confirm="confirmDelete"
      :onHide="closeDelete"
    />
  </Modal>
</template>