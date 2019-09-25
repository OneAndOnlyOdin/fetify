import VueRouter from 'vue-router'
import Home from './Home'
import LockList from './Lock/List.vue'
import LockDetail from './Lock/Detail.vue'

export { router }

const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/locks/:id', component: LockDetail, props: true },
    { path: '/locks', component: LockList },
    { path: '/', component: Home },
  ],
})
