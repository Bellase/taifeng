import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/test',
    name: 'test',
    component: () => import('@/viewer/test.vue'),
  },
  {
    path: '/',
    redirect: () => {
      return '/test'
    },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})
export default router
