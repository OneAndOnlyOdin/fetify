<script lang="ts">
import Vue from 'vue'
import { auth } from './store'

export default Vue.extend({
  data() {
    return {
      auth: auth.state,
    }
  },
  methods: {
    logout() {
      auth.logout()
    },
  },
})
</script>

<template>
  <header>
    <div class="left">
      <h3>Fetify</h3>
    </div>

    <div class="mid">
      <router-link to="/">Home</router-link>
      <router-link to="/locks">Locks</router-link>
    </div>

    <div class="right">
      <button @click="logout">Logout</button>
    </div>
  </header>
</template>

<style lang="scss" scoped>
header {
  padding: 12px;
  background-color: $color-primary;
  width: 100vw;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  .left {
    width: 200px;

    @include mobile {
      display: none;
    }
  }

  .mid {
    width: calc(100vw - 400px - 24px);
    @include mobile {
      width: calc(100vw - 200px - 24px);
    }
  }

  .right {
    text-align: right;
    float: right;
    width: 200px;
  }

  h3 {
    margin: 0;
  }

  a {
    padding: 12px;
    text-decoration: none;
    color: black;
    font-weight: 600;
    cursor: pointer;
    min-width: 60px;

    &:hover {
      background-color: $color-accent;
    }
  }
}
</style>