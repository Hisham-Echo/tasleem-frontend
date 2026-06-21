<template>
  <div>
    <div class="page-header">
      <div class="container">
        <h1 class="text-cream mb-0"><i class="bi bi-search me-2 text-gold"></i>Search Results</h1>
      </div>
    </div>

    <div class="container py-4">
      <!-- Search Input -->
      <div class="row mb-4">
        <div class="col-lg-8 mx-auto">
          <form @submit.prevent="performSearch" class="d-flex gap-2">
            <input 
              type="text" 
              class="form-control form-control-lg bg-dark border-secondary text-cream" 
              placeholder="Search for products..." 
              v-model="localQuery" 
            />
            <button class="btn btn-gold px-4" type="submit">
              <i class="bi bi-search me-2"></i>Search
            </button>
          </form>
        </div>
      </div>

      <!-- Results Header -->
      <div class="d-flex justify-content-between align-items-center mb-3" v-if="query">
        <h5 class="text-cream mb-0">
          Results for "<span class="text-gold">{{ query }}</span>" 
          <span class="text-muted fs-6 ms-2">({{ products.length }} found)</span>
        </h5>
      </div>

      <!-- Loading State -->
      <LoadingSpinner v-if="loading" height="300px" />

      <!-- Empty State -->
      <div v-else-if="products.length === 0 && query" class="text-center py-5">
        <i class="bi bi-emoji-frown text-muted" style="font-size: 4rem;"></i>
        <h4 class="text-muted mt-3">No products found</h4>
        <p class="text-muted">Try adjusting your search terms or browse our categories.</p>
        <RouterLink to="/products" class="btn btn-gold mt-2">Browse All Products</RouterLink>
      </div>

      <!-- Initial State (No query yet) -->
      <div v-else-if="!query" class="text-center py-5">
        <i class="bi bi-search text-muted" style="font-size: 4rem;"></i>
        <h4 class="text-muted mt-3">Start your search</h4>
        <p class="text-muted">Enter a keyword above to find what you're looking for.</p>
      </div>

      <!-- Products Grid -->
      <div v-else class="row g-4">
        <div class="col-6 col-md-4 col-lg-3" v-for="product in products" :key="product.id">
          <ProductCard :product="product" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productService } from '@/services/api'
import ProductCard from '@/components/ui/ProductCard.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()

const query = ref('')
const localQuery = ref('')
const products = ref([])
const loading = ref(false)

async function fetchProducts() {
  if (!query.value) {
    products.value = []
    return
  }
  
  loading.value = true
  try {
    const res = await productService.getAll({ search: query.value, per_page: 24 })
    products.value = res.data?.data || res.data || []
  } catch (error) {
    console.error('Search error:', error)
    products.value = []
  } finally {
    loading.value = false
  }
}

function performSearch() {
  if (localQuery.value.trim()) {
    // Update URL query parameter to trigger the watcher
    router.push({ name: 'Search', query: { q: localQuery.value.trim() } })
  }
}

// FIX: Watch route query changes to fetch new results
watch(() => route.query.q, (newQ) => {
  query.value = newQ || ''
  localQuery.value = newQ || ''
  fetchProducts()
}, { immediate: true })

onMounted(() => {
  // Ensure localQuery is synced on initial load
  localQuery.value = route.query.q || ''
})
</script>

<style scoped>
.form-control:focus {
  border-color: var(--gold);
  box-shadow: 0 0 0 0.25rem rgba(212, 175, 55, 0.25);
}
</style>