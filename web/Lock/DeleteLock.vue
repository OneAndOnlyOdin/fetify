<script lang="ts">
import Vue, { PropType } from 'vue'
import { Modal } from '../elements'
export default Vue.extend({
  components: { Modal },
  props: {
    id: String,
    isOpen: Boolean,
    confirm: { type: Function as PropType<() => void> },
    onHide: { type: Function as PropType<() => void> },
  },
  methods: {},
})
</script>

<template>
  <Modal v-model="isOpen" :onHide="onHide">
    <template slot="header">Are you sure?</template>
    <div class="delete__box">
      <div>Are you sure you wish to delete this lock?</div>
    </div>

    <template slot="footer">
      <div class="delete__opts">
        <button @click="onHide">Cancel</button>
        <button class="danger" @click="confirm">Delete Lock</button>
      </div>
    </template>
  </Modal>
</template>

<style lang="scss" scoped>
.delete__box {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
}

.delete__opts {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
</style>