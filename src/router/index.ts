import { createRouter, createWebHistory } from 'vue-router'
import Chat from '../components/Chat.vue'
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
      path: '/:uuid', //login user UUID
      name: 'home',
      component: () => import('../components/view/MainView.vue'),
      props: true,
      children: [
        {
          path: '',
          name: 'sidebar',
          component: () => import('../components/SidePanel.vue'),
          props: true,
        },
        {
          path: 'chat/:uuid',
          name: 'chat',
          component: Chat,
          props: true,
        },
        {
          path: 'map/:uuid',
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
