<script lang="ts">
import Vue from 'vue'
import { auth } from '../store'
import Guest from './Guest.vue'
import User from './User.vue'

export default Vue.extend({
  components: { Guest, User },
  data() {
    return {
      auth: auth.state,
    }
  },
})
</script>

<template>
  <div>
    <Guest v-if="!auth.loggedIn" />
    <User v-if="auth.loggedIn" />
  </div>
</template>