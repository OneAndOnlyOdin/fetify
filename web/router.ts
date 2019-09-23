import VueRouter from 'vue-router'
import Home from './Home'

export { router }

const router = new VueRouter({
  mode: 'history',
  routes: [{ path: '/', component: Home }]
})
