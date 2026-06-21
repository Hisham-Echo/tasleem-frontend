<template>
  <div>
    <!-- Hero Section -->
    <section class="hero-section d-flex align-items-center">
      <div class="container">
        <div class="row align-items-center g-5">
          <div class="col-lg-6">
            <span class="badge badge-gold mb-3">Welcome to Tasleem</span>
            <h1 class="text-cream display-4 fw-bold mb-3">Discover, Buy, and Rent Premium Items</h1>
            <p class="text-muted fs-5 mb-4">Your one-stop marketplace for authentic products and seamless rentals.</p>
            
            <!-- AI Search Bar -->
            <form class="ai-search-bar d-flex gap-2" @submit.prevent="handleAiSearch">
              <div class="input-group">
                <span class="input-group-text bg-transparent border-0 text-gold"><i class="bi bi-stars"></i></span>
                <input 
                  type="text" 
                  class="form-control bg-transparent border-0 text-cream" 
                  placeholder="Ask AI to find what you need..." 
                  v-model="aiQuery" 
                />
              </div>
              <button class="btn btn-gold px-4" type="submit" :disabled="aiLoading">
                <span v-if="aiLoading" class="spinner-border spinner-border-sm"></span>
                <span v-else>Search</span>
              </button>
            </form>

            <!-- AI Results -->
            <div v-if="aiAnswer" class="mt-3 p-3 rounded" style="background: rgba(212, 175, 55, 0.05); border: 1px solid var(--gold);">
              <p class="text-cream mb-2" style="font-size: .9rem;">{{ aiAnswer }}</p>
              <div class="d-flex gap-2 flex-wrap" v-if="aiProducts.length > 0">
                <RouterLink v-for="p in aiProducts" :key="p.id" :to="`/products/${p.id}`" class="btn btn-sm btn-outline-gold">
                  {{ p.name }}
                </RouterLink>
              </div>
            </div>
          </div>
          <div class="col-lg-6 d-none d-lg-block text-center">
            <i class="bi bi-bag-heart text-gold" style="font-size: 15rem; opacity: 0.2;"></i>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="py-5" style="background: var(--navy-card);">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h3 class="text-cream mb-0">Shop by Category</h3>
          <RouterLink to="/categories" class="text-gold text-decoration-none">View All <i class="bi bi-arrow-right"></i></RouterLink>
        </div>
        <div class="row g-3">
          <div class="col-6 col-md-3" v-for="cat in categories" :key="cat.id">
            <RouterLink :to="`/products?category_id=${cat.id}`" class="category-card text-decoration-none">
              <i class="bi bi-grid-3x3-gap-fill text-gold mb-2" style="font-size: 2rem;"></i>
              <h6 class="text-cream mb-0">{{ cat.name }}</h6>
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Trending Products -->
    <section class="py-5">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h3 class="text-cream mb-0"><i class="bi bi-fire text-gold me-2"></i>Trending Now</h3>
          <RouterLink to="/products" class="text-gold text-decoration-none">See All <i class="bi bi-arrow-right"></i></RouterLink>
        </div>
        <LoadingSpinner v-if="trendingLoading" height="200px" />
        <div v-else-if="trendingProducts.length === 0" class="text-center py-4 text-muted">No trending products at the moment.</div>
        <div v-else class="row g-4">
          <div class="col-6 col-md-4 col-lg-3" v-for="product in trendingProducts" :key="product.id">
            <ProductCard :product="product" />
          </div>
        </div>
      </div>
    </section>

    <!-- Explore Section -->
    <section class="py-5" style="background: var(--navy-card);">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h3 class="text-cream mb-0"><i class="bi bi-compass text-gold me-2"></i>Explore New Arrivals</h3>
          <RouterLink to="/products" class="text-gold text-decoration-none">See All <i class="bi bi-arrow-right"></i></RouterLink>
        </div>
        <LoadingSpinner v-if="exploreLoading" height="200px" />
        <div v-else-if="exploreProducts.length === 0" class="text-center py-4 text-muted">No new arrivals yet.</div>
        <div v-else class="row g-4">
          <div class="col-6 col-md-4 col-lg-3" v-for="product in exploreProducts" :key="product.id">
            <ProductCard :product="product" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { aiService, categoryService } from '@/services/api'
import ProductCard from '@/components/ui/ProductCard.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { useToast } from 'vue-toastification'

const router = useRouter()
const toast = useToast()

const categories = ref([])
const trendingProducts = ref([])
const exploreProducts = ref([])
const trendingLoading = ref(true)
const exploreLoading = ref(true)

const aiQuery = ref('')
const aiLoading = ref(false)
const aiAnswer = ref('')
const aiProducts = ref([])

let carouselInterval = null

async function fetchCategories() {
  try {
    const res = await categoryService.getAll()
    categories.value = (res.data?.data || res.data || []).slice(0, 4)
  } catch (_) {}
}

async function fetchTrending() {
  trendingLoading.value = true
  try {
    const res = await aiService.trending(8)
    trendingProducts.value = res.data?.data || []
  } catch (_) {
    trendingProducts.value = []
  } finally {
    trendingLoading.value = false
  }
}

async function fetchExplore() {
  exploreLoading.value = true
  try {
    const res = await aiService.explore(8)
    exploreProducts.value = res.data?.data || []
  } catch (_) {
    exploreProducts.value = []
  } finally {
    exploreLoading.value = false
  }
}

async function handleAiSearch() {
  if (!aiQuery.value.trim()) return
  aiLoading.value = true
  aiAnswer.value = ''
  aiProducts.value = []
  
  try {
    const res = await aiService.assistant(aiQuery.value)
    aiAnswer.value = res.data?.answer || 'Here is what I found for you:'
    aiProducts.value = res.data?.products || []
  } catch (e) {
    toast.error('AI search failed. Please try again.')
  } finally {
    aiLoading.value = false
  }
}

onMounted(() => {
  fetchCategories()
  fetchTrending()
  fetchExplore()
})

// FIX: Clear interval on unmount to prevent memory leaks
onBeforeUnmount(() => {
  if (carouselInterval) {
    clearInterval(carouselInterval)
    carouselInterval = null
  }
})
</script>

<style scoped>
.hero-section {
  min-height: 80vh;
  background: linear-gradient(135deg, var(--navy-bg) 0%, #0a192f 100%);
  position: relative;
  overflow: hidden;
}
.ai-search-bar {
  background: var(--navy-card);
  border: 1px solid var(--navy-border);
  border-radius: 2rem;
  padding: 0.5rem;
}
.ai-search-bar .form-control:focus {
  box-shadow: none;
}
.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: var(--navy-bg);
  border: 1px solid var(--navy-border);
  border-radius: 1rem;
  transition: all 0.3s;
}
.category-card:hover {
  border-color: var(--gold);
  transform: translateY(-5px);
}
</style>