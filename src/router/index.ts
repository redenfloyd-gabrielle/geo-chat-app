import { createRouter, createWebHistory } from 'vue-router'
import Chat from '../components/chat.vue'
import Map from '../components/Map.vue'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('../components/form/LoginForm.vue'), // LOGIN PAGE
    },
    {
      path: '/:uuid',
      name: 'home',
      component: () => import('../components/view/MainView.vue'),
      props: true,
      children: [
        {
          path: 'chat',
          name: 'chat',
          component: Chat,
          props: true,
        },
        {
          path: 'map',
          name: 'map',
          component: Map,
          props: true,
        },
      ],
    },
    {
      path: '/registration',
      name: 'registration',
      component: () => import('../components/form/UserForm.vue')
    }
  ]
})

export default router
