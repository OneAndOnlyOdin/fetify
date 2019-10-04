<script lang="ts">
import Vue from 'vue'
import { toastApi } from './store'
import { ToastState } from './store/toast'

type Data = {
  interval?: NodeJS.Timer
  toasts: ToastState['toasts']
}

export default Vue.extend({
  data(): Data {
    return {
      toasts: toastApi.state.toasts.slice(),
    }
  },
  methods: {
    updateToasts() {
      this.toasts = toastApi.state.toasts.slice()
    },
  },
  mounted() {
    this.interval = setInterval(this.updateToasts, 1000)
  },
  beforeDestroy() {
    clearInterval(this.interval!)
  },
})
</script>

<template>
  <div>
    <div class="toast">
      <div class="toast--show" :class="toast.type" v-for="(toast, i) in toasts" :key="i">
        <div class="toast--title">{{toast.title}}</div>
        <div class="toast--msg">{{toast.message}}</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.toast {
  visibility: hidden;
  color: #fff;
  border-radius: 2px;
  padding: 16px;
  position: fixed;
  z-index: 1;
  right: 8px;
  bottom: 8px;

  .toast--show {
    display: flex;
    justify-content: left;
    flex-direction: column;
    margin: 8px;
    min-width: 300px;
    visibility: visible;
    -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s;
    animation: fadein 0.5s, fadeout 0.5s 3.5s;

    @include mobile {
      display: none;
    }
  }

  .toast--title {
    font-weight: 600;
    padding: 8px;
  }

  .toast--msg {
    background-color: $color-primary;
    padding: 8px;
  }

  .info {
    background-color: $color-multiply;
  }

  .warn {
    background-color: $color-change;
  }

  .success {
    background-color: $color-unlocked;
  }

  .error {
    background-color: $color-locked;
  }
}

@-webkit-keyframes fadein {
  from {
    bottom: 0;
    opacity: 0;
  }
  to {
    bottom: 30px;
    opacity: 1;
  }
}

@keyframes fadein {
  from {
    bottom: 0;
    opacity: 0;
  }
  to {
    bottom: 30px;
    opacity: 1;
  }
}

@-webkit-keyframes fadeout {
  from {
    bottom: 30px;
    opacity: 1;
  }
  to {
    bottom: 0;
    opacity: 0;
  }
}

@keyframes fadeout {
  from {
    bottom: 30px;
    opacity: 1;
  }
  to {
    bottom: 0;
    opacity: 0;
  }
}
</style>