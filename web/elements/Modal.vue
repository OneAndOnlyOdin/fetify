
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
    <div class="overlay hide-mobile" v-on:click="onHide"></div>
    <div class="container">
      <div class="header">
        <slot name="header"></slot>
        <button v-on:click="onHide" class="close">✕</button>
      </div>

      <div class="content">
        <slot></slot>
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
  font-weight: 600;
  font-size: 16px;
  min-height: 16px;
  padding: 16px 0 16px 16px;

  @include mobile {
    padding: 24px 0 16px 16px;
  }
}

.container {
  z-index: 1;
  width: 416px;
  background-color: white;
  grid-gap: 0px;
  border: none;
  border-radius: 0;
  margin: auto;
  display: block;
  max-height: calc(100vh - 200px);
  overflow-y: none;

  @include mobile {
    max-height: unset;
    margin: unset;
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
  font-size: 16px;
  margin-right: 16px;
}

.content {
  overflow-y: scroll;
  height: calc(100vh - 200px - 140px);
  width: calc(100% - 32px);
  padding: 0 16px;

  @include mobile {
    height: calc(100% - 140px);
  }
}

.footer {
  padding: 16px 16px 24px 16px;
}
</style>
