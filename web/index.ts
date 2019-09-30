import './store'
import './styles/main.scss'
import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import { router } from './router'
import * as clickOutside from 'v-click-outside'

Vue.use(VueRouter)
Vue.use(clickOutside)

new Vue({
  render: h => h(App),
  router,
}).$mount('#root')
