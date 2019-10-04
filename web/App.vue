<script lang="ts">
import Vue from 'vue'
import Header from './Header.vue'
import Guest from './Home/Guest.vue'
import Toast from './Toast.vue'
import { authApi } from './store'

export default Vue.extend({
  components: { Header, Guest, Toast },
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

    <Toast />
  </div>
</template>


<style lang="scss" scoped>
.content {
  height: calc(100vh - 98px);
  width: calc(100% - 32px);
  padding: 16px;

  @include mobile {
    // width: 100%;
  }
}
</style>
