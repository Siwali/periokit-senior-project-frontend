import { reactive, computed } from 'vue'

const TOKEN_KEY = 'periokit_access_token'
const USER_KEY = 'periokit_user_profile'

export interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  student_id?: string
  role?: string
}

interface AuthState {
  user: UserProfile | null
  token: string | null
}

// Initialize state from localStorage
const state = reactive<AuthState>({
  user: JSON.parse(localStorage.getItem(USER_KEY) || 'null'),
  token: localStorage.getItem(TOKEN_KEY)
})

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const authService = {
  // Reactive state
  state,

  // Computed properties
  isAuthenticated: computed(() => !!state.token),
  user: computed(() => state.user),

  /**
   * Login function
   * @param email 
   * @param password 
   */
  async login(email: string, password: string) {
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
      const { access_token, user } = data

      // 2. เก็บ token ใน local storage
      localStorage.setItem(TOKEN_KEY, access_token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))

      // 3. เก็บ user profile ใน auth state
      state.token = access_token
      state.user = user

      return { success: true, data }
    } catch (error: any) {
      console.error('Login Error:', error)
      return { 
        success: false, 
        message: error.message || 'Cannot connect to server' 
      }
    }
  },

  /**
   * Logout function
   */
  logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    state.token = null
    state.user = null
  },

  /**
   * Helper to get auth headers
   */
  getAuthHeaders() {
    return state.token ? { 'Authorization': `Bearer ${state.token}` } : {}
  }
}
