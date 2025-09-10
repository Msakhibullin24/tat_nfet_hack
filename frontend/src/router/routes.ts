export default [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home/index.vue'),
    meta: {
      layout: 'main',
    },
  },
  {
    path: '/diagram/:id',
    name: 'diagram',
    component: () => import('@/views/DiagramEdit/index.vue'),
    meta: {
      layout: 'main',
      showAgentButton: true,
    },
  },
]