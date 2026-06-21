<template>
  <div class="auth-container d-flex align-items-center justify-content-center min-vh-100">
    <div class="card auth-card p-4 p-md-5 shadow-lg">
      <div class="text-center mb-4">
        <h2 class="text-cream mb-1">Reset Password</h2>
        <p class="text-muted">Enter your new password</p>
      </div>

      <form @submit.prevent="handleReset">
        <div class="mb-3">
          <label class="form-label text-cream">Email Address</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-envelope"></i></span>
            <input type="email" class="form-control" v-model="email" required readonly />
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label text-cream">New Password</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-lock"></i></span>
            <input :type="showPassword ? 'text' : 'password'" class="form-control" v-model="password" required placeholder="••••••••" />
            <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
        </div>

        <div class="mb-4">
          <label class="form-label text-cream">Confirm New Password</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-lock-fill"></i></span>
            <input :type="showPassword ? 'text' : 'password'" class="form-control" v-model="passwordConfirmation" required placeholder="••••••••" />
          </div>
          <div v-if="passwordError" class="text-danger mt-1" style="font-size: .85rem;">{{ passwordError }}</div>
        </div>

        <button type="submit" class="btn btn-gold w-100 mb-3" :disabled="loading || !isTokenValid">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ loading ? 'Resetting...' : 'Reset Password' }}
        </button>

        <div v-if="!isTokenValid" class="alert alert-danger text-center py-2 mb-0">
          Invalid or missing reset token. Please request a new link.
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authService } from '@/services/api'
import { useToast } from 'vue-toastification'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const token = ref('')
const showPassword = ref(false)
const loading = ref(false)
const passwordError = ref('')

// FIX: Extract token and email from URL query parameters on mount
onMounted(() => {
  token.value = route.query.token || ''
  email.value = route.query.email || ''
})

const isTokenValid = computed(() => !!token.value && !!email.value)

async function handleReset() {
  passwordError.value = ''
  
  if (password.value !== passwordConfirmation.value) {
    passwordError.value = 'Passwords do not match.'
    return
  }

  if (password.value.length < 8) {
    passwordError.value = 'Password must be at least 8 characters.'
    return
  }

  loading.value = true
  try {
    await authService.resetPassword({
      email: email.value,
      token: token.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value
    })
    
    toast.success('Password reset successfully! Please login with your new password.')
    router.push({ name: 'Login' })
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to reset password. The link may have expired.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container { background: var(--navy-bg); }
.auth-card { background: var(--navy-card); border: 1px solid var(--navy-border); width: 100%; max-width: 450px; border-radius: 1rem; }
</style>