import VueRouter from 'vue-router'
import Home from './Home.vue'

export { router }

const router = new VueRouter({
  mode: 'history',
  routes: [{ path: '/', component: Home }]
})
