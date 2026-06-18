<template>
  <div>
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="row align-items-center g-5">
          <div class="col-lg-6">
            <h1 class="hero-title mb-3">
              Welcome to <span class="text-gold">Tasleem</span>
            </h1>
            <p class="hero-subtitle mb-4">
              Your trusted luxury marketplace for buying, selling, and renting premium products across Egypt.
            </p>
            <div class="d-flex gap-3 flex-wrap">
              <RouterLink to="/products" class="btn btn-gold btn-lg px-4">
                <i class="bi bi-bag me-2"></i>Shop Now
              </RouterLink>
              <RouterLink to="/seller" class="btn btn-outline-gold btn-lg px-4">
                <i class="bi bi-shop me-2"></i>Start Selling
              </RouterLink>
            </div>
          </div>
          <div class="col-lg-6 d-none d-lg-block">
            <div class="hero-image-placeholder">
              <i class="bi bi-shop-window text-gold" style="font-size:8rem;"></i>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="py-5" style="background:var(--navy);">
      <div class="container">
        <div class="d-flex align-items-center gap-2 mb-4">
          <i class="bi bi-grid-3x3-gap text-gold fs-4"></i>
          <h2 class="section-title text-cream mb-0">Shop by Category</h2>
        </div>
        <div class="row g-3">
          <div class="col-6 col-md-4 col-lg-3" v-for="cat in categories" :key="cat.id || cat.category_id">
            <RouterLink 
              :to="{ path: '/products', query: { category_id: cat.id || cat.category_id } }" 
              class="category-card text-decoration-none"
            >
              <div class="category-icon">
                <i class="bi bi-tag text-gold fs-3"></i>
              </div>
              <div class="category-name text-cream">{{ cat.name }}</div>
            </RouterLink>
          </div>
          <div class="col-6 col-md-4 col-lg-3" v-if="categoriesLoading" v-for="n in 8" :key="'sk'+n">
            <div class="category-card">
              <div class="skeleton" style="height:80px;"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Trending Section (AI-powered) -->
    <section class="py-5">
      <div class="container">
        <div class="d-flex align-items-center gap-2 mb-4">
          <i class="bi bi-fire text-gold fs-4"></i>
          <h2 class="section-title text-cream mb-0">Trending Now</h2>
        </div>
        <div class="row g-4">
          <div class="col-6 col-md-4 col-xl-3" v-for="product in trendingProducts" :key="product.id">
            <ProductCard :product="product" />
          </div>
          <div class="col-6 col-md-4 col-xl-3" v-if="trendingLoading" v-for="n in 8" :key="'tr'+n">
            <ProductSkeleton />
          </div>
        </div>
        <div v-if="!trendingLoading && trendingProducts.length === 0" class="text-center py-4">
          <p class="text-muted">No trending products available right now.</p>
        </div>
      </div>
    </section>

    <!-- Personalized Recommendations (AI-powered, auth required) -->
    <section class="py-5" v-if="auth.isAuthenticated && recommendations.length > 0" style="background:var(--navy);">
      <div class="container">
        <div class="d-flex align-items-center gap-2 mb-4">
          <i class="bi bi-stars text-gold fs-4"></i>
          <h2 class="section-title text-cream mb-0">{{ recSection }}</h2>
        </div>
        <div class="row g-4">
          <div class="col-6 col-md-4 col-xl-3" v-for="product in recommendations" :key="product.id">
            <ProductCard :product="product" />
          </div>
          <div class="col-6 col-md-4 col-xl-3" v-if="recLoading" v-for="n in 8" :key="'rec'+n">
            <ProductSkeleton />
          </div>
        </div>
      </div>
    </section>

    <!-- Explore Section (AI-powered) -->
    <section class="py-5">
      <div class="container">
        <div class="d-flex align-items-center gap-2 mb-4">
          <i class="bi bi-compass text-gold fs-4"></i>
          <h2 class="section-title text-cream mb-0">Explore More</h2>
        </div>
        <div class="row g-4">
          <div class="col-6 col-md-4 col-xl-3" v-for="product in exploreProducts" :key="product.id">
            <ProductCard :product="product" />
          </div>
          <div class="col-6 col-md-4 col-xl-3" v-if="exploreLoading" v-for="n in 8" :key="'exp'+n">
            <ProductSkeleton />
          </div>
        </div>
        <div v-if="!exploreLoading && exploreProducts.length === 0" class="text-center py-4">
          <p class="text-muted">No products to explore right now.</p>
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="py-5" style="background:var(--navy);">
      <div class="container">
        <div class="d-flex align-items-center justify-content-between mb-4">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-star text-gold fs-4"></i>
            <h2 class="section-title text-cream mb-0">Featured Products</h2>
          </div>
          <RouterLink to="/products" class="btn btn-outline-gold btn-sm">
            View All <i class="bi bi-arrow-right ms-1"></i>
          </RouterLink>
        </div>
        <div class="row g-4">
          <div class="col-6 col-md-4 col-xl-3" v-for="product in featuredProducts" :key="product.id">
            <ProductCard :product="product" />
          </div>
          <div class="col-6 col-md-4 col-xl-3" v-if="productsLoading" v-for="n in 8" :key="'feat'+n">
            <ProductSkeleton />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { productService, categoryService, recommendationService } from '@/services/api'
import ProductCard from '@/components/ui/ProductCard.vue'
import ProductSkeleton from '@/components/ui/ProductSkeleton.vue'

const auth = useAuthStore()
const featuredProducts = ref([])
const categories = ref([])
const recommendations = ref([])
const recSection = ref('For You')
const trendingProducts = ref([])
const exploreProducts = ref([])
const productsLoading = ref(true)
const categoriesLoading = ref(true)
const trendingLoading = ref(true)
const exploreLoading = ref(false)
const recLoading = ref(false)

// Load trending products (Using most viewed since AI service is not integrated)
async function loadTrending() {
  trendingLoading.value = true
  try {
    const res = await productService.getAll({ sort_by: 'view_count', sort_order: 'desc', per_page: 8 })
    trendingProducts.value = res.data?.data || []
  } catch (e) {
    console.error('Failed to load trending:', e)
    trendingProducts.value = []
  } finally {
    trendingLoading.value = false
  }
}

// Load explore products (Using newest products)
async function loadExplore() {
  exploreLoading.value = true
  try {
    const res = await productService.getAll({ sort_by: 'created_at', sort_order: 'desc', per_page: 8 })
    exploreProducts.value = res.data?.data || []
  } catch (e) {
    console.error('Failed to load explore:', e)
    exploreProducts.value = []
  } finally {
    exploreLoading.value = false
  }
}

// Load personalized recommendations (From database table)
async function loadRecommendations() {
  if (!auth.isAuthenticated || !auth.user?.id) return
  
  recLoading.value = true
  try {
    const res = await recommendationService.getAll({ user_id: auth.user.id })
    recommendations.value = res.data?.data || []
    recSection.value = 'Recommended for You'
  } catch (e) {
    console.warn('Recommendations not available, using fallback:', e.message)
    recommendations.value = featuredProducts.value.slice(0, 8)
    recSection.value = 'Featured Products'
  } finally {
    recLoading.value = false
  }
}

onMounted(async () => {
  try {
    const [catRes, featuredRes] = await Promise.all([
      categoryService.getAll(),
      productService.getAll({ per_page: 8, sort_by: 'created_at', sort_order: 'desc' })
    ])
    categories.value = catRes.data?.data || catRes.data || []
    featuredProducts.value = featuredRes.data?.data || []
  } catch (e) {
    console.error('Failed to load initial data:', e)
  } finally {
    productsLoading.value = false
    categoriesLoading.value = false
  }

  loadTrending()
  loadExplore()
  loadRecommendations()
})

watch(() => auth.isAuthenticated, (isAuth) => {
  if (isAuth) {
    loadRecommendations()
  } else {
    recommendations.value = []
  }
})
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%);
  padding: 5rem 0;
  min-height: 500px;
  display: flex;
  align-items: center;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  color: var(--text-cream);
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: var(--text-muted);
  line-height: 1.7;
}

.hero-image-placeholder {
  background: rgba(201, 169, 110, 0.1);
  border: 2px dashed rgba(201, 169, 110, 0.3);
  border-radius: 2rem;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
}

.category-card {
  background: var(--navy-light);
  border: 1px solid var(--navy-border);
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.2s;
  display: block;
}

.category-card:hover {
  border-color: var(--gold);
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(201, 169, 110, 0.15);
}

.category-icon {
  margin-bottom: 0.75rem;
}

.category-name {
  font-weight: 600;
  font-size: 0.95rem;
}

.skeleton {
  background: linear-gradient(90deg, var(--navy-light) 25%, var(--navy-border) 50%, var(--navy-light) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 0.5rem;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>