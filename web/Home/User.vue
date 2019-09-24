<script lang="ts">
import Vue from 'vue'
import { auth } from '../store'
export default Vue.extend({
  data() {
    return {
      auth: auth.state,
    }
  },
})
</script>

<template>
  <div>{{auth.username}}</div>
</template>