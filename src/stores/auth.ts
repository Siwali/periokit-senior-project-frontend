import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apolloClient } from '../services/apollo-client'
import { loginUser, logoutUser, registerUser, type RegisterInput } from '../services/api/auth.api'
import {
  clearSessionStorage,
  getAccessToken,
  getAuthHeaders as getStoredAuthHeaders,
  getStoredUserProfile,
  saveSession,
} from '../services/token-storage'
import { useNotificationStore } from './notification'
import router from '../router'
import type { UserProfile } from '../types/auth'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<UserProfile | null>(getStoredUserProfile())
  const token = ref<string | null>(getAccessToken())

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const userProfile = computed(() => user.value)

  // Actions
  async function login(email: string, password: string) {
    try {
      const result = await loginUser(email, password)

      saveSession(result.token, result.user)
      token.value = result.token
      user.value = result.user

      return { success: true, user: result.user, token: result.token }
    } catch (error: any) {
      console.error('Login Error:', error)
      return { 
        success: false, 
        message: error.message || 'Cannot connect to server' 
      }
    }
  }

  async function register(input: RegisterInput) {
    try {
      await registerUser(input)
      return { success: true }
    } catch (error: any) {
      console.error('Register Error:', error)
      return {
        success: false,
        message: error.message || 'Cannot connect to server',
        status: error.status,
        errors: error.errors,
      }
    }
  }

  async function logout() {
    try {
      if (token.value) {
        await logoutUser()
      }
    } catch (error) {
      console.error('Logout Error:', error)
    } finally {
      // Reset Apollo cache to prevent stale data/token usage
      try {
        await apolloClient.resetStore()
      } catch (e) {
        console.error('Apollo reset error:', e)
      }

      clearSessionStorage()
      token.value = null
      user.value = null
    }

  }

  /**
   * เคลียร์ session และ redirect ไปหน้า login เมื่อ token หมดอายุ หรือไม่ถูกต้อง (401)
   */
  let isHandlingUnauthorized = false
  async function handleUnauthorized() {
    // ป้องกัน Loop และการทำงานซ้ำซ้อน
    if (isHandlingUnauthorized || router.currentRoute.value.name === 'login') {
      return
    }

    isHandlingUnauthorized = true

    try {
      // 1. เคลียร์ state ทั้งหมด
      clearSessionStorage()
      token.value = null
      user.value = null

      // 2. แจ้งเตือนผู้ใช้
      const notificationStore = useNotificationStore()
      notificationStore.error('Please login again (Session expired)')

      // 3. Redirect ไปหน้า login
      await router.push({ name: 'login' })
      
      // 4. Reset Apollo cache
      try {
        await apolloClient.resetStore()
      } catch (e) {
        console.error('Apollo reset error:', e)
      }
    } finally {
      isHandlingUnauthorized = false
    }
  }

  function getAuthHeaders(): Record<string, string> {
    return getStoredAuthHeaders()
  }

  return {
    user,
    token,
    isAuthenticated,
    userProfile,
    login,
    register,
    logout,
    handleUnauthorized,
    getAuthHeaders
  }
})
