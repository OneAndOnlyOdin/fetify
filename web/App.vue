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
.body {
  width: 100vw;
  height: 100vh;
}

.content {
  height: calc(100vh - 80px);
  padding: 16px;
}
</style>
