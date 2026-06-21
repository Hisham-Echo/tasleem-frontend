<template>
  <div class="loading-spinner-wrap d-flex flex-column align-items-center justify-content-center" :style="{ height: height }">
    <div class="spinner-border text-gold" role="status" style="width: 3rem; height: 3rem;">
      <span class="visually-hidden">Loading...</span>
    </div>
    <p v-if="text" class="text-muted mt-3 mb-0">{{ text }}</p>
  </div>
</template>

<script setup>
defineProps({
  height: {
    type: String,
    default: '200px'
  },
  text: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.loading-spinner-wrap {
  width: 100%;
}

/* FIX 2: Ensure the spinner uses the theme gold color */
.text-gold {
  color: var(--gold) !important;
}
</style>