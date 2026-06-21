<template>
  <div class="auth-container d-flex align-items-center justify-content-center min-vh-100 py-5">
    <div class="card auth-card p-4 p-md-5 shadow-lg">
      <div class="text-center mb-4">
        <h2 class="text-cream mb-1">Create Account</h2>
        <p class="text-muted">Join Tasleem today</p>
      </div>

      <div v-if="isLockedOut" class="alert alert-danger text-center">
        <i class="bi bi-lock-fill me-2"></i>
        Too many failed attempts. Please try again in <strong>{{ countdown }}s</strong>.
      </div>

      <form @submit.prevent="handleRegister" v-else>
        <div class="mb-3">
          <label class="form-label text-cream">Full Name</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-person"></i></span>
            <input type="text" class="form-control" v-model="name" required placeholder="John Doe" />
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label text-cream">Email Address</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-envelope"></i></span>
            <input type="email" class="form-control" v-model="email" required placeholder="you@example.com" />
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label text-cream">Password</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-lock"></i></span>
            <input :type="showPassword ? 'text' : 'password'" class="form-control" v-model="password" required placeholder="••••••••" />
            <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label text-cream">Confirm Password</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-lock-fill"></i></span>
            <input :type="showPassword ? 'text' : 'password'" class="form-control" v-model="passwordConfirmation" required placeholder="••••••••" />
          </div>
          <div v-if="passwordError" class="text-danger mt-1" style="font-size: .85rem;">{{ passwordError }}</div>
        </div>

        <div class="mb-4">
          <label class="form-label text-cream">Account Type</label>
          <select class="form-select" v-model="role">
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>
        </div>

        <button type="submit" class="btn btn-gold w-100 mb-3" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ loading ? 'Creating Account...' : 'Sign Up' }}
        </button>

        <p class="text-center text-muted mb-0">
          Already have an account? <RouterLink to="/login" class="text-gold text-decoration-none fw-bold">Sign In</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAuthLockout } from '@/composables/useAuthLockout'
import { useToast } from 'vue-toastification'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const role = ref('buyer')
const showPassword = ref(false)
const loading = ref(false)
const passwordError = ref('')

const { isLockedOut, countdown, recordFailure, recordSuccess } = useAuthLockout(5, 120) // Stricter lockout for registration

async function handleRegister() {
  passwordError.value = ''
  
  // FIX 1: Validate password match before sending to API
  if (password.value !== passwordConfirmation.value) {
    passwordError.value = 'Passwords do not match.'
    return
  }

  if (password.value.length < 8) {
    passwordError.value = 'Password must be at least 8 characters.'
    return
  }

  loading.value = true
  
  const res = await auth.register({
    name: name.value,
    email: email.value,
    password: password.value,
    password_confirmation: passwordConfirmation.value,
    role: role.value
  })
  
  if (res.success) {
    recordSuccess()
    toast.success('Account created successfully!')
    
    // FIX 3: Check if email verification is required and redirect accordingly
    if (res.data?.user && !res.data.user.email_verified_at) {
      router.push({ name: 'VerifyEmail' })
    } else {
      router.push({ name: 'Home' })
    }
  } else {
    recordFailure() // FIX 2: Record failure for lockout
    toast.error(res.message)
  }
  
  loading.value = false
}
</script>

<style scoped>
.auth-container { background: var(--navy-bg); }
.auth-card { background: var(--navy-card); border: 1px solid var(--navy-border); width: 100%; max-width: 450px; border-radius: 1rem; }
</style>