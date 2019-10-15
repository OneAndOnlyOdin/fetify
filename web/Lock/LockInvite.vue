<script lang="ts">
import Vue, { PropType } from 'vue'
import { Modal } from '../elements'
import { ClientLock } from '../store/lock'

export default Vue.extend({
  components: { Modal },
  props: {
    lock: { type: Object as PropType<ClientLock> },
    isOpen: Boolean,
    onHide: { type: Function as PropType<() => void> },
  },
  data() {
    return {
      loading: false,
      userId: '',
    }
  },
  methods: {
    async sendInvite() {
      try {
        this.loading = true
        this.onHide()
      } finally {
        this.loading = false
      }
    },
  },
})
</script>

<template>
  <Modal v-model="isOpen" :onHide="onHide">
    <template slot="header">Invite to Lock</template>

    <input type="text" v-model="userId" placeholder="User ID" />

    <template slot="footer">
      <div class="invite__footer">
        <div>
          <button @click="onHide">Cancel</button>
        </div>
        <div>
          <button @click="sendInvite" class="danger">Invite</button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<style lang="scss" scoped>
.invite__footer {
  display: flex;
  justify-content: space-between;
}
</style>