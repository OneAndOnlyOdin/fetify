<script lang="ts">
import Vue from 'vue'
import { authApi } from './store'
import { Dropdown } from './elements'

export default Vue.extend({
  components: { Dropdown },
  data() {
    return {
      auth: authApi.state,
    }
  },
  methods: {
    logout() {
      authApi.logout()
    },
  },
})
</script>

<template>
  <header>
    <div class="container hide-mobile">
      <div class="left">
        <h3>Game</h3>
      </div>

      <div class="mid">
        <router-link to="/">Home</router-link>
        <router-link to="/locks">Locks</router-link>
        <router-link to="/locks">{{auth.userId}} {{auth.connected ? '✓' : '✗'}}</router-link>
      </div>

      <div class="right">
        <button v-if="auth.loggedIn" @click="logout">Logout</button>
      </div>
    </div>

    <div class="container hide-desktop">
      <Dropdown text="Menu">
        <a>
          <router-link to="/">Home</router-link>
        </a>
        <a>
          <router-link to="/locks">Locks</router-link>
        </a>
        <a>
          <router-link to="/locks">{{auth.userId}} {{auth.connected ? '✓' : '✗'}}</router-link>
        </a>
      </Dropdown>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.container {
  width: 100%;
  background-color: $color-primary;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

header {
  padding: 12px;
  background-color: $color-primary;

  .left {
    width: 200px;

    @include mobile {
      display: none;
    }
  }

  .mid {
    width: calc(100vw - 400px - 24px);

    @include mobile {
      width: calc(100% - 100px - 24px);
    }
  }

  .right {
    text-align: right;
    float: right;
    width: 200px;

    @include mobile {
      width: 100px;
    }
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