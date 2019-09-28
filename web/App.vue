<script lang="ts">
import Vue from 'vue'
import Header from './Header.vue'
import { locksApi } from './store'

export default Vue.extend({
  components: { Header },
  mounted() {
    // Initialise shared app state
    locksApi.getLocks()
  },
})
</script>

<template>
  <div class="page">
    <Header />

    <div class="content">
      <router-view></router-view>
    </div>
  </div>
</template>


<style lang="scss" scoped>
.content {
  height: calc(100vh);
  width: calc(100% - 32px);
  padding: 16px;

  @include mobile {
    // width: 100%;
  }
}
</style>
