<script lang="ts">
import Vue from 'vue'
import { authApi } from '../store'
import { api } from '../store/api'

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
    canSignin(): boolean {
      return !!this.username && !!this.password
    },
    canSignup(): boolean {
      return !!this.username && !!this.password && !!this.confirm && this.password === this.confirm
    },
  },

  methods: {
    flipRegister() {
      this.register = !this.register
    },
    async signup() {
      try {
        const body = {
          username: this.username,
          password: this.password,
          confirm: this.confirm,
        }
        const token = await api.post<string>('/api/user/register', body)
        authApi.handleToken(token, true)
      } catch (ex) {
        this.error = ex.message
      }
    },
    async signin() {
      try {
        const token = await api.post<string>('/api/user/login', {
          username: this.username,
          password: this.password,
        })
        authApi.handleToken(token, true)
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
      <div class="center">
        <div class="pointer" :class="{ selected: !register }" @click="register = false">
          <h3>Login</h3>
        </div>
        <div class="pointer" :class="{ selected: register }" @click="register = true">
          <h3>Register</h3>
        </div>
      </div>

      <div>
        <input type="text" placeholder="Username" v-model="username" v-on:keyup.enter="signin" />
      </div>

      <div>
        <input type="password" placeholder="Password" v-on:keyup.enter="signin" v-model="password" />
      </div>

      <div>
        <input
          type="password"
          placeholder="Confirm"
          v-on:keyup.enter="register"
          :disabled="!register"
          v-model="confirm"
        />
      </div>

      <div style="color: red" v-if="error.length > 0">{{ error }}</div>

      <div class="center">
        <button :disabled="!canSignin" @click="signin" v-if="!register">Login</button>
        <button :disabled="!canSignup" @click="signup" v-if="register">Register</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.box {
  display: flex;
  flex-direction: column;
  border: 1px solid $color-accent;

  > div {
    padding: 12px;
  }
}

.center {
  display: flex;
  justify-content: space-around;
}

.selected {
  border-bottom: 2px solid $color-unlocked;
}

.pointer {
  cursor: pointer;
}

h3 {
  margin: 0 16px;
}
</style>
