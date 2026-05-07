import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const TOKEN_KEY = 'periokit_access_token'
const USER_KEY = 'periokit_user_profile'

export interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  student_id?: string
  role?: string
  profile_image_url?: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const savedUser = localStorage.getItem(USER_KEY)
  const initialUser = (savedUser && savedUser !== 'undefined') ? JSON.parse(savedUser) : null
  const user = ref<UserProfile | null>(initialUser)
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const userProfile = computed(() => user.value)

  // Actions
  async function login(email: string, password: string) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      // 1. รับ access token/session
      // โครงสร้างที่ส่งกลับมาจาก backend คือ { success: true, data: { user, session: { access_token, ... } } }
      const rawUser = data.data?.user
      const session = data.data?.session
      const access_token = session?.access_token

      if (!access_token || !rawUser) {
        console.error('Data Structure Error:', data)
        throw new Error('Invalid response from server structure')
      }

      // 2. แปลงข้อมูล user ให้ตรงกับ UserProfile interface
      // ดึงข้อมูลจาก user_metadata ที่ Supabase เก็บไว้
      const userData: UserProfile = {
        id: rawUser.id,
        email: rawUser.email || '',
        first_name: rawUser.user_metadata?.firstName || '',
        last_name: rawUser.user_metadata?.lastName || '',
        student_id: rawUser.user_metadata?.studentId,
        role: rawUser.user_metadata?.role,
        profile_image_url: rawUser.user_metadata?.profileImageUrl
      }

      // 3. เก็บ token ใน local storage
      localStorage.setItem(TOKEN_KEY, access_token)
      localStorage.setItem(USER_KEY, JSON.stringify(userData))

      // 3. เก็บ user profile ใน auth state
      token.value = access_token
      user.value = userData

      return { success: true, user: userData, token: access_token }
    } catch (error: any) {
      console.error('Login Error:', error)
      return { 
        success: false, 
        message: error.message || 'Cannot connect to server' 
      }
    }
  }

  async function logout() {
    try {
      if (token.value) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: getAuthHeaders()
        })
      }
    } catch (error) {
      console.error('Logout Error:', error)
    } finally {
      // Clear local storage
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      token.value = null
      user.value = null
    }
  }

  function getAuthHeaders(): Record<string, string> {
    return token.value ? { 'Authorization': `Bearer ${token.value}` } : {}
  }

  return {
    user,
    token,
    isAuthenticated,
    userProfile,
    login,
    logout,
    getAuthHeaders
  }
})
