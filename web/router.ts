import VueRouter from 'vue-router'
import Home from './Home'
import LockList from './Lock/List.vue'
import LockDetail from './Lock/Detail.vue'
import LockCreate from './Lock/Create.vue'

export { router }

const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/locks/create', component: LockCreate },
    { path: '/locks/:id', component: LockDetail, props: true },
    { path: '/locks', component: LockList },
    { path: '/', component: Home },
  ],
})

export function navigate(path: string) {
  console.log(router.currentRoute, path)
  if (router.currentRoute.path === path) return
  router.push(path)
}
