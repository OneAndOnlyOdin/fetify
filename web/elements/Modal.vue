
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {
    value: Boolean,
    onHide: { type: Function as () => void },
    disabled: Boolean,
  },
})
</script>

<template>
  <div v-bind:class="{ active: value }" v-if="value" class="modal">
    <div class="overlay" v-on:click="onHide"></div>
    <div class="container">
      <div class="header">
        <slot name="header"></slot>
        <button v-on:click="onHide" class="close">✕</button>
      </div>
      <div class="body">
        <div class="content">
          <slot></slot>
        </div>
      </div>

      <div class="footer" v-if="!!$slots.footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>


<style lang="scss" scoped>
.modal {
  display: flex;
  align-items: center;
  top: 0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}
.overlay {
  width: 100%;
  height: 100%;
  opacity: 0.46;
  position: absolute;
  background-color: black;
  top: 0;
  right: 0;
}

.header {
  color: black;
  font-size: 18px;
}

.container {
  z-index: 1;
  width: 416px;
  padding: 16px;
  background-color: white;
  grid-gap: 0px;
  overflow-y: auto;
  border: none;
  border-radius: 0;
  margin: auto;
  display: block;
  max-height: calc(100vh - 42px + 16px + 32px);

  @include mobile {
    max-height: unset;
    width: 100%;
    height: 100%;
  }
}

.close {
  float: right;
  cursor: pointer;
  border: 0;
  outline: 0;
  background: transparent;
}

.content {
  overflow-y: auto;
  width: 100%;
}

.footer {
  margin-top: 16px;
}
</style>
