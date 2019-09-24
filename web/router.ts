import VueRouter from 'vue-router'
import Home from './Home'
import Locks from './Lock/List.vue'

export { router }

const router = new VueRouter({
  mode: 'history',
  routes: [{ path: '/locks', component: Locks }, { path: '/', component: Home }]
})
