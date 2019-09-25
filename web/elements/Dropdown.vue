<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: ['value', 'disabled'],
})
</script>
<template>
  <span class="select">
    <select :disabled="disabled" :value="value" @input="$emit('input', $event.target.value)">
      <slot></slot>
    </select>
  </span>
</template>

<style lang="scss" scoped>
select {
  border-radius: 0;
  outline: 0;
  height: 42px;
}

.select {
  position: relative;
  display: inline-block;
  height: 42px;
}

.select select {
  background-color: white;
  color: black;
  font-size: 14px;
  padding: 12px;
  border: 1px solid $color-accent;
  min-width: 120px;
  text-overflow: '';
  -webkit-appearance: button; /* hide default arrow in chrome OSX */
}

.select::before,
.select::after {
  content: '';
  position: absolute;
  pointer-events: none;
}

.select::after {
  content: '\25BC';
  color: white;
  height: 1em;
  font-size: 0.8em;
  line-height: 0;
  right: 16px;
  top: 23px;
}

.select select[disabled] {
  background-color: $color-primary;
}

.select::before {
  border: 0;
  width: 42px;
  height: 41px;
  right: 1px;

  background-color: $color-accent;
}
</style>