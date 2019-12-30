import VueRouter from 'vue-router'

export { router }

const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/locks/create', component: () => import('./Lock/CreateLock.vue') },
    {
      path: '/locks/:id',
      component: () => import('./Lock/LockDetail.vue'),
      props: true,
    },
    {
      path: '/locks',
      component: () => import('./Lock/LockList.vue'),
    },
    { path: '/', component: () => import('./Home') },
  ],
})

export function navigate(path: string) {
  if (router.currentRoute.path === path) return
  router.push(path)
}
