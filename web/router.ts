import VueRouter from 'vue-router'
import Home from './Home'
import LockList from './Lock/LockList.vue'
import LockDetail from './Lock/LockDetail.vue'
import LockCreate from './Lock/CreateLock.vue'

export { router }

const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/locks/create', component: LockCreate },
    {
      path: '/locks/:id',
      component: LockDetail,
      props: true,
    },
    {
      path: '/locks',
      component: LockList,
    },
    { path: '/', component: Home },
  ],
})

export function navigate(path: string) {
  if (router.currentRoute.path === path) return
  router.push(path)
}
