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
}

.select {
  position: relative;
  display: inline-block;
  vertical-align: middle;
}

.select select {
  background-color: white;
  color: black;
  font-size: 14px;
  padding: 12px;
  padding-right: 2.5em;
  border: 1px solid $color-primary;
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
  font-size: 0.625em;
  line-height: 1;
  right: 16px;
  top: 23px;
  margin-top: -0.5em;
}

.select select[disabled] {
  background-color: $color-accent;
}

.select::before {
  border: 1px solid $color-primary;
  width: 42px;
  height: 41px;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: lighten($color-primary, 15%);
}
</style>