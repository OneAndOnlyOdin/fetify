<script lang="ts">
import Vue from 'vue'
import Header from './Header.vue'

export default Vue.extend({
  components: { Header },
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
  height: calc(100vh - 80px);
  width: calc(100% - 32px);
  padding: 16px;

  @include mobile {
    // width: 100%;
  }
}
</style>
