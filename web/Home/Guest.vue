<script lang="ts">
import Vue from 'vue'
import { auth } from '../store'

type Data = {
  username: string
  password: string
  confirm: string
  register: boolean
  error: string
}

export default Vue.extend({
  data(): Data {
    return {
      username: '',
      password: '',
      confirm: '',
      register: false,
      error: '',
    }
  },
  computed: {
    canSignin() {
      return this.$data.username && this.$data.password
    },
    canSignup() {
      return (
        this.$data.username &&
        this.$data.password &&
        this.$data.confirm &&
        this.$data.password === this.$data.confirm
      )
    },
  },

  methods: {
    flipRegister() {
      this.register = !this.register
    },
    async signup() {
      try {
        await auth.register(this.username, this.password, this.confirm)
      } catch (ex) {
        this.error = ex.message
      }
    },
    async signin() {
      try {
        await auth.login(this.username, this.password)
      } catch (ex) {
        this.error = ex.message
      }
    },
  },
})
</script>

<template>
  <div class="page">
    <div class="box">
      <div>
        <input type="text" placeholder="Username" v-model="username" />
      </div>

      <div>
        <input type="password" placeholder="Password" v-model="password" />
      </div>

      <div>
        <input type="password" placeholder="Confirm" :disabled="!register" v-model="confirm" />
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between">
        <label>First time?</label>
        <input type="checkbox" v-model="register" />
        <span class="checkbox" @click="flipRegister" />
      </div>

      <div style="color: red" v-if="error.length > 0">{{error}}</div>

      <div class="center">
        <button :disabled="!canSignin" @click="signin" v-if="!register">Login</button>
        <button :disabled="!canSignup" @click="signup" v-if="register">Register</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page {
  display: flex;
  justify-content: space-around;
}

.box {
  display: flex;
  flex-direction: column;
  border: 1px solid $color-accent;
  color: black;

  > div {
    padding: 12px;
  }
}

.center {
  display: flex;
  justify-content: space-around;
}
</style>