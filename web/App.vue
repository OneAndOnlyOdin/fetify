<script lang="ts">
import Vue from 'vue'
import Header from './Header.vue'
import Guest from './Home/Guest.vue'
import { authApi } from './store'

export default Vue.extend({
  components: { Header, Guest },
  data() {
    return { auth: authApi.state }
  },
})
</script>

<template>
  <div class="page">
    <Header />

    <div class="content">
      <router-view v-if="auth.loggedIn"></router-view>
      <Guest v-if="!auth.loggedIn" />
    </div>
  </div>
</template>


<style lang="scss" scoped>
.content {
  height: 100vh;
  width: calc(100% - 32px);
  padding: 16px;

  @include mobile {
    // width: 100%;
  }
}
</style>
