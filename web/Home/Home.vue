<script lang="ts">
import Vue from 'vue'
import { authApi } from '../store'
import Guest from './Guest.vue'
import User from './User.vue'

export default Vue.extend({
  components: { Guest, User },
  data() {
    return {
      auth: authApi.state,
    }
  },
})
</script>

<template>
  <div class="content">
    <Guest v-if="!auth.loggedIn" />
    <User v-if="auth.loggedIn" />
  </div>
</template>

<style lang="scss" scoped>
.content {
  width: 100%;
}
</style>
