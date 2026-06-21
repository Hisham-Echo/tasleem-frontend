<template>
  <div class="auth-container d-flex align-items-center justify-content-center min-vh-100">
    <div class="card auth-card p-4 p-md-5 shadow-lg text-center">
      <div v-if="verifying" class="py-4">
        <div class="spinner-border text-gold mb-3" style="width: 3rem; height: 3rem;"></div>
        <h4 class="text-cream mb-2">Verifying your email...</h4>
        <p class="text-muted">Please wait a moment.</p>
      </div>

      <div v-else-if="verified" class="py-4">
        <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
        <h4 class="text-cream mt-3 mb-2">Email Verified!</h4>
        <p class="text-muted">Your email has been successfully verified. You can now access all features.</p>
        <RouterLink to="/" class="btn btn-gold mt-2">Go to Home</RouterLink>
      </div>

      <div v-else-if="error" class="py-4">
        <i class="bi bi-exclamation-triangle-fill text-danger" style="font-size: 4rem;"></i>
        <h4 class="text-cream mt-3 mb-2">Verification Failed</h4>
        <p class="text-muted">{{ error }}</p>
        <button class="btn btn-gold mt-2" @click="resendVerification" :disabled="resending">
          <span v-if="resending" class="spinner-border spinner-border-sm me-2"></span>
          Resend Verification Email
        </button>
        <div v-if="resent" class="alert alert-success mt-3 py-2 mb-0">Verification email sent!</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api, { authService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const verifying = ref(true)
const verified = ref(false)
const error = ref('')
const resending = ref(false)
const resent = ref(false)

async function verifyEmail() {
  verifying.value = true
  error.value = ''
  
  // FIX 1: Extract parameters from URL
  const id = route.params.id || route.query.id
  const hash = route.params.hash || route.query.hash
  const token = route.query.token

  try {
    // Try standard Laravel email verification first
    if (id && hash) {
      await api.get(`/email/verify/${id}/${hash}`)
    } else if (token) {
      // Fallback for token-based verification
      await authService.resendVerification({ token }) // Assuming backend handles token verification here or via a specific endpoint
    } else {
      throw new Error('Invalid verification link.')
    }
    
    verified.value = true
    // FIX 3: Update local user state so the banner disappears
    if (auth.user) {
      auth.user.email_verified_at = new Date().toISOString()
      localStorage.setItem('tasleem_user', JSON.stringify(auth.user))
    }
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'The verification link is invalid or has expired.'
  } finally {
    verifying.value = false
  }
}

async function resendVerification() {
  resending.value = true
  resent.value = false
  try {
    await authService.resendVerification()
    resent.value = true
    toast.success('Verification email sent!')
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to resend verification email.')
  } finally {
    resending.value = false
  }
}

onMounted(() => {
  // If already verified, redirect
  if (auth.user?.email_verified_at) {
    router.push('/')
    return
  }
  verifyEmail()
})
</script>

<style scoped>
.auth-container { background: var(--navy-bg); }
.auth-card { background: var(--navy-card); border: 1px solid var(--navy-border); width: 100%; max-width: 500px; border-radius: 1rem; }
</style>