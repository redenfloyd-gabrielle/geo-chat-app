import { createRouter, createWebHistory } from 'vue-router'
import Chat from '../components/Chat.vue'
import Map from '../components/Map.vue'
import { useSeesionStore } from '@/stores/session'
import type { Session } from '@/stores/types'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../components/form/LoginForm.vue'), // LOGIN PAGE
    },
    {
      path: '/:uuid', //login user UUID
      name: 'home',
      component: () => import('../components/view/MainView.vue'),
      props: true,
      children: [
        // {
        //   path: '/:uuid',
        //   name: 'sidebar',
        //   component: () => import('../components/SidePanel.vue'),
        //   props: true,
        // },
        {
          path: 'chat/:chat_uuid',
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
        {
          path: 'user',
          name: 'user-detail',
          props: true,
          component: () => import('../components/form/UserForm.vue')
        }
      ],
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../components/form/UserForm.vue')
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const sessionStore = useSeesionStore()
  const _session = sessionStore.getSession() as Session

  const restrictedPages = ['home', 'map', 'chat', 'sidebar', 'user-detail']
  console.log(`@___ routing from ${from.name as string} to ${to.name as string}`)
  // If no session and trying to access restricted pages or login/register page
  if (!_session) {
    if (to.name === 'login' || to.name === 'register') {
      return next() // allow login/register without session
    }
    return next({ name: 'login' }) // redirect to login if no session
  }

  // If session exists and trying to go to login or register, redirect to home
  if (to.name === 'login' || to.name === 'register') {
    return next({ name: 'home' }) // or some other default page
  }

  // If session exists, allow access to restricted pages or redirect to 'page-not-found'
  if (restrictedPages.includes(to.name as string)) {
    return next() // allow access to restricted pages
  }

  // If the page is not restricted, redirect to 'page-not-found'
  return next({ name: 'page-not-found' })
})

export default router
