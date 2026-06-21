<template>
  <div class="not-found-container d-flex align-items-center justify-content-center min-vh-100 text-center">
    <div class="container">
      <h1 class="display-1 text-gold fw-bold mb-3">404</h1>
      <h2 class="text-cream mb-3">Page Not Found</h2>
      <p class="text-muted fs-5 mb-4">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <div class="d-flex justify-content-center gap-3">
        <button class="btn btn-outline-gold px-4" @click="goBack">
          <i class="bi bi-arrow-left me-2"></i>Go Back
        </button>
        <RouterLink to="/" class="btn btn-gold px-4" @click="goHome">
          <i class="bi bi-house-door me-2"></i>Go Home
        </RouterLink>
      </div>
      
      <div class="mt-5">
        <i class="bi bi-compass text-muted" style="font-size: 8rem; opacity: 0.1;"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

function goHome() {
  // FIX 1: Ensure clean navigation to home
  router.push({ name: 'Home' })
}
</script>

<style scoped>
.not-found-container {
  background: var(--navy-bg);
  padding: 2rem;
}
</style>