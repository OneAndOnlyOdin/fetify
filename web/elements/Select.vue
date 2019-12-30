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
  height: 40px;
}

.select {
  position: relative;
  display: inline-block;
  height: 40px;
}

.select select {
  height: 40px;
  background-color: white;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
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
  height: 1em;
  font-size: 0.8em;
  line-height: 0;
  right: 14px;
  top: 23px;
}

.select select[disabled] {
  background-color: $color-primary;
}

.select::before {
  border: 0;
  width: 40px;
  height: 40px;
  right: 0;

  background-color: $color-accent;
}
</style>
