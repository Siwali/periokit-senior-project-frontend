import { createRouter, createWebHistory } from 'vue-router'
import RegisterView from '../views/RegisterView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/dashboard/home',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: () => import('../views/AdminDashboardView.vue')
    },
    {
      path: '/',
      redirect: '/login'
    }
  ]
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('periokit_access_token')
  const isAuthPage = to.name === 'login' || to.name === 'register'
  const isDashboardRoute = to.path.startsWith('/dashboard') || to.path.startsWith('/admin')

  if (isDashboardRoute && !token) {
    // If trying to access dashboard without token, redirect to login
    next({ name: 'login' })
  } else if (isAuthPage && token) {
    // If already logged in and trying to access auth pages, redirect to dashboard
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
