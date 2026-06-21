import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService, userService } from '@/services/api'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('tasleem_user') || 'null'))
  const token = ref(localStorage.getItem('tasleem_token') || '')

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  // FIX 1: Safely check if user exists before accessing email_verified_at
  const needsVerification = computed(() => {
    return isAuthenticated.value && user.value && !user.value.email_verified_at
  })
  const fullName = computed(() => user.value?.name || '')

  function setAuth(userData, authToken) {
    user.value = userData
    token.value = authToken
    localStorage.setItem('tasleem_user', JSON.stringify(userData))
    localStorage.setItem('tasleem_token', authToken)
  }

  function clearAuth() {
    user.value = null
    token.value = ''
    localStorage.removeItem('tasleem_user')
    localStorage.removeItem('tasleem_token')
  }

  async function login(credentials) {
    try {
      const res = await authService.login(credentials)
      const data = res.data?.data || res.data
      setAuth(data.user, data.token)
      return { success: true }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' }
    }
  }

  async function register(userData) {
    try {
      const res = await authService.register(userData)
      const data = res.data?.data || res.data
      if (data.token) {
        setAuth(data.user, data.token)
      }
      return { success: true, data }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' }
    }
  }

  async function logout() {
    try {
      await authService.logout()
    } catch (_) {
      // Ignore logout API errors
    } finally {
      clearAuth()
      router.push({ name: 'Login' })
    }
  }

  async function fetchMe() {
    if (!token.value) return
    try {
      const res = await authService.me()
      const userData = res.data?.data || res.data
      user.value = userData
      localStorage.setItem('tasleem_user', JSON.stringify(userData))
    } catch (error) {
      // FIX 3: Catch error to prevent unhandled rejections.
      // The 401 interceptor will handle redirecting to login.
      clearAuth()
    }
  }

  async function updateProfile(payload) {
    try {
      const res = await userService.update(user.value.id, payload)
      const updatedUser = res.data?.data || res.data
      
      // FIX 2: Update local state with the new user data
      user.value = { ...user.value, ...updatedUser }
      localStorage.setItem('tasleem_user', JSON.stringify(user.value))
      
      return { success: true }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Update failed' }
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    needsVerification,
    fullName,
    login,
    register,
    logout,
    fetchMe,
    updateProfile
  }
})