<template>
  <div class="auth-container d-flex align-items-center justify-content-center min-vh-100">
    <div class="card auth-card p-4 p-md-5 shadow-lg">
      <div class="text-center mb-4">
        <h2 class="text-cream mb-1">Forgot Password?</h2>
        <p class="text-muted">Enter your email to receive a reset link</p>
      </div>

      <!-- FIX 1: Show success message after submission -->
      <div v-if="emailSent" class="alert alert-success text-center">
        <i class="bi bi-check-circle-fill me-2"></i>
        If an account with that email exists, we have sent a password reset link. Please check your inbox.
      </div>

      <form @submit.prevent="handleForgot" v-else>
        <div class="mb-4">
          <label class="form-label text-cream">Email Address</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-envelope"></i></span>
            <input type="email" class="form-control" v-model="email" required placeholder="you@example.com" />
          </div>
          <!-- FIX 3: Show validation error -->
          <div v-if="emailError" class="text-danger mt-1" style="font-size: .85rem;">{{ emailError }}</div>
        </div>

        <button type="submit" class="btn btn-gold w-100 mb-3" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ loading ? 'Sending...' : 'Send Reset Link' }}
        </button>

        <p class="text-center text-muted mb-0">
          Remember your password? <RouterLink to="/login" class="text-gold text-decoration-none fw-bold">Sign In</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { authService } from '@/services/api'

const email = ref('')
const emailError = ref('')
const loading = ref(false)
const emailSent = ref(false)

async function handleForgot() {
  emailError.value = ''
  
  // FIX 3: Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    emailError.value = 'Please enter a valid email address.'
    return
  }

  loading.value = true
  try {
    await authService.forgotPassword({ email: email.value })
    emailSent.value = true
  } catch (error) {
    // FIX 2: Always show success message to prevent email enumeration
    emailSent.value = true
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container { background: var(--navy-bg); }
.auth-card { background: var(--navy-card); border: 1px solid var(--navy-border); width: 100%; max-width: 450px; border-radius: 1rem; }
</style>