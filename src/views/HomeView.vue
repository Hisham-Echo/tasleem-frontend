<template>
  <div>
    <!-- ── Hero ─────────────────────────────────────────────────── -->
    <section class="hero-section">
      <div class="hero-bg-pattern"></div>
      <div class="hero-grid"></div>
      <div class="container position-relative">
        <div class="row align-items-center g-5">
          <div class="col-lg-6">
            <div class="slide-up-enter-active" style="animation-duration:.6s;">
              <span class="badge badge-gold mb-3 px-3 py-2" style="font-size:.8rem;letter-spacing:.1em;">
                <i class="bi bi-stars me-1"></i> PREMIUM MARKETPLACE
              </span>
              <h1 class="hero-title text-cream mb-4">
                Buy, Sell &<br /><span class="text-gold">Rent</span> with<br />Confidence
              </h1>
              <p class="hero-subtitle mb-5">
                Tasleem connects buyers and sellers across Egypt with AI-powered recommendations, secure payments, and seamless rentals.
              </p>
              <div class="d-flex flex-wrap gap-3">
                <RouterLink class="btn btn-gold px-4 py-2" to="/products">
                  Explore Products <i class="bi bi-arrow-right ms-2"></i>
                </RouterLink>
                <RouterLink class="btn btn-outline-gold px-4 py-2" to="/register" v-if="!auth.isAuthenticated">
                  Start Selling
                </RouterLink>
              </div>
              <div class="hero-stats d-flex gap-4 mt-5">
                <div class="text-center"><div class="stat-value">977</div><div class="stat-label">Products</div></div>
                <div class="text-center"><div class="stat-value">536</div><div class="stat-label">Users</div></div>
                <div class="text-center"><div class="stat-value">98%</div><div class="stat-label">Satisfaction</div></div>
              </div>
            </div>
          </div>
          <div class="col-lg-6 d-none d-lg-block">
            <div class="hero-image-card p-3">
              <div class="row g-2">
                <div class="col-6" v-for="n in 4" :key="n">
                  <div class="rounded-xl overflow-hidden" style="height:140px;background:var(--navy-light);">
                    <div class="skeleton" style="height:100%;"></div>
                  </div>
                </div>
              </div>
              <div class="d-flex align-items-center gap-2 p-2 mt-2" style="background:rgba(201,169,110,0.08);border-radius:.6rem;">
                <i class="bi bi-shield-check text-gold fs-4"></i>
                <div>
                  <div class="text-cream" style="font-size:.85rem;font-weight:600;">Secure Transactions</div>
                  <div class="text-muted" style="font-size:.75rem;">End-to-end payment protection</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── AI Search Bar ─────────────────────────────────────────── -->
    <section style="background:var(--navy);border-bottom:1px solid var(--navy-border);">
      <div class="container py-4">
        <div class="d-flex gap-2" style="max-width:600px;margin:0 auto;">
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-stars text-gold"></i></span>
            <input
              v-model="aiQuery"
              class="form-control"
              placeholder="Ask AI: 'Find me a camera for under 20,000 EGP'…"
              @keydown.enter="askAssistant"
              :disabled="assistantLoading"
            />
            <button class="btn btn-gold px-3" @click="askAssistant" :disabled="assistantLoading || !aiQuery.trim()">
              <span class="spinner-border spinner-border-sm" v-if="assistantLoading"></span>
              <i class="bi bi-send-fill" v-else></i>
            </button>
          </div>
        </div>
        <!-- AI Answer -->
        <Transition name="fade">
          <div v-if="assistantAnswer" class="mt-3 p-3 card" style="max-width:600px;margin:0 auto;border-color:rgba(201,169,110,.25);">
            <div class="d-flex align-items-start gap-2">
              <i class="bi bi-robot text-gold flex-shrink-0 mt-1"></i>
              <p class="mb-0 text-cream" style="font-size:.9rem;line-height:1.7;">{{ assistantAnswer }}</p>
            </div>
          </div>
        </Transition>
        <!-- AI suggested products -->
        <div v-if="assistantProducts.length > 0" class="mt-3">
          <div class="row g-3" style="max-width:900px;margin:0 auto;">
            <div class="col-6 col-md-4 col-lg-3" v-for="p in assistantProducts" :key="p.id">
              <ProductCard :product="p" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Categories ──────────────────────────────────────────── -->
    <section class="py-5" style="background:var(--navy);">
      <div class="container">
        <h2 class="section-title text-cream mb-4">Browse Categories</h2>
        <div class="row g-3 mt-3">
          <div class="col-6 col-md-4 col-lg-2" v-for="cat in categories" :key="cat.id">
            <RouterLink :to="`/products?category_id=${cat.id}`" class="text-decoration-none">
              <div class="card text-center py-3 px-2 card-hover cursor-pointer" style="border-radius:1rem;">
                <div class="fs-2 mb-2">{{ cat.icon || '📦' }}</div>
                <div class="text-cream" style="font-size:.85rem;font-weight:500;">{{ cat.name }}</div>
                <div class="text-muted" style="font-size:.75rem;">{{ cat.products_count || 0 }} items</div>
              </div>
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Trending Now ────────────────────────────────────────── -->
    <section class="py-5">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-graph-up-arrow text-gold fs-4"></i>
            <h2 class="section-title text-cream mb-0">Trending Now</h2>
          </div>
          <RouterLink class="btn btn-outline-gold btn-sm" to="/products">View All</RouterLink>
        </div>
        <div class="row g-4">
          <div class="col-6 col-md-4 col-xl-3" v-if="trendingLoading" v-for="n in 4" :key="'t'+n"><ProductSkeleton /></div>
          <div class="col-6 col-md-4 col-xl-3" v-for="p in trendingProducts" :key="p.id">
            <ProductCard :product="p" />
          </div>
        </div>
      </div>
    </section>

    <!-- ── Personalized Recommendations ──────────────────────────── -->
    <section class="py-5" style="background:linear-gradient(135deg,#0a1628,#0f2040);" v-if="auth.isAuthenticated && recommendations.length > 0">
      <div class="container">
        <div class="d-flex align-items-center gap-2 mb-4">
          <i class="bi bi-stars text-gold fs-4"></i>
          <div>
            <h2 class="section-title text-cream mb-0">{{ recSection }}</h2>
            <p class="text-muted mb-0" style="font-size:.8rem;">Powered by AI</p>
          </div>
        </div>
        <div class="row g-4">
          <div class="col-6 col-md-4 col-xl-3" v-for="p in recommendations" :key="p.id">
            <ProductCard :product="p" />
          </div>
        </div>
      </div>
    </section>

    <!-- ── Featured Products ───────────────────────────────────── -->
    <section class="py-5">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="section-title text-cream">Featured Products</h2>
          <RouterLink class="btn btn-outline-gold btn-sm" to="/products">View All <i class="bi bi-arrow-right ms-1"></i></RouterLink>
        </div>
        <div class="row g-4">
          <div class="col-6 col-md-4 col-xl-3" v-for="p in featuredProducts" :key="p.id"><ProductCard :product="p" /></div>
          <div class="col-6 col-md-4 col-xl-3" v-if="productsLoading" v-for="n in 8" :key="'fs'+n"><ProductSkeleton /></div>
        </div>
      </div>
    </section>

    <!-- ── Rentals Banner ──────────────────────────────────────── -->
    <section class="py-5" style="background:linear-gradient(135deg,#0f1e35,#0a1628);border-top:1px solid var(--navy-border);border-bottom:1px solid var(--navy-border);">
      <div class="container">
        <div class="row align-items-center g-4">
          <div class="col-lg-7">
            <span class="badge badge-gold mb-3">RENTALS</span>
            <h2 class="text-cream">Need it temporarily? <span class="text-gold">Rent it.</span></h2>
            <p class="text-muted">Browse thousands of items for daily, weekly, or monthly rental.</p>
            <RouterLink class="btn btn-gold mt-2" to="/products?rentable=1">
              <i class="bi bi-clock-history me-2"></i>Browse Rentals
            </RouterLink>
          </div>
          <div class="col-lg-5">
            <div class="row g-3">
              <div class="col-6" v-for="feat in rentalFeatures" :key="feat.title">
                <div class="card p-3" style="border-radius:1rem;">
                  <i :class="feat.icon + ' fs-3 mb-2'" style="color:var(--gold);"></i>
                  <div class="text-cream" style="font-weight:600;font-size:.9rem;">{{ feat.title }}</div>
                  <div class="text-muted" style="font-size:.78rem;">{{ feat.desc }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Explore More ────────────────────────────────────────── -->
    <section class="py-5" style="background:var(--navy);">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-compass text-gold fs-4"></i>
            <h2 class="section-title text-cream mb-0">Explore More</h2>
          </div>
          <button class="btn btn-outline-gold btn-sm" @click="loadExplore" :disabled="exploreLoading">
            <span class="spinner-border spinner-border-sm me-1" v-if="exploreLoading"></span>
            <i class="bi bi-arrow-repeat me-1" v-else></i>Shuffle
          </button>
        </div>
        <div class="row g-4">
          <div class="col-6 col-md-4 col-xl-3" v-if="exploreLoading" v-for="n in 4" :key="'e'+n"><ProductSkeleton /></div>
          <div class="col-6 col-md-4 col-xl-3" v-for="p in exploreProducts" :key="p.id"><ProductCard :product="p" /></div>
        </div>
      </div>
    </section>

    <!-- ── Trust Signals ───────────────────────────────────────── -->
    <section class="py-5">
      <div class="container">
        <div class="row g-4 text-center">
          <div class="col-6 col-md-3" v-for="t in trustSignals" :key="t.title">
            <div class="py-3">
              <i :class="t.icon + ' fs-1 text-gold mb-3 d-block'"></i>
              <h6 class="text-cream">{{ t.title }}</h6>
              <p class="text-muted mb-0" style="font-size:.85rem;">{{ t.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { productService, categoryService, aiService } from '@/services/api'
import ProductCard from '@/components/ui/ProductCard.vue'
import ProductSkeleton from '@/components/ui/ProductSkeleton.vue'

const auth = useAuthStore()

const featuredProducts   = ref([])
const categories         = ref([])
const recommendations    = ref([])
const recSection         = ref('For You')
const trendingProducts   = ref([])
const exploreProducts    = ref([])
const productsLoading    = ref(true)
const trendingLoading    = ref(true)
const exploreLoading     = ref(false)

// AI assistant
const aiQuery            = ref('')
const assistantLoading   = ref(false)
const assistantAnswer    = ref('')
const assistantProducts  = ref([])

const rentalFeatures = [
  { icon: 'bi bi-calendar-check', title: 'Flexible Dates', desc: 'Daily, weekly or monthly' },
  { icon: 'bi bi-shield-check',   title: 'Insured',        desc: 'All rentals are covered' },
  { icon: 'bi bi-truck',          title: 'Delivery',       desc: 'Door-to-door service' },
  { icon: 'bi bi-arrow-repeat',   title: 'Easy Return',    desc: 'Hassle-free returns' },
]
const trustSignals = [
  { icon: 'bi bi-shield-lock',       title: 'Secure Payments', desc: 'SSL encrypted transactions' },
  { icon: 'bi bi-headset',           title: '24/7 Support',    desc: 'Always here to help' },
  { icon: 'bi bi-arrow-return-left', title: 'Easy Returns',    desc: '30-day return policy' },
  { icon: 'bi bi-truck',             title: 'Fast Delivery',   desc: 'Nationwide shipping' },
]

async function loadExplore() {
  exploreLoading.value = true
  try {
    const res = await aiService.explore()
    exploreProducts.value = res.data?.products || []
  } catch (_) {} finally { exploreLoading.value = false }
}

async function askAssistant() {
  if (!aiQuery.value.trim()) return
  assistantLoading.value = true
  assistantAnswer.value  = ''
  assistantProducts.value = []
  try {
    const res = await aiService.assistant(aiQuery.value.trim())
    assistantAnswer.value   = res.data?.answer || ''
    assistantProducts.value = res.data?.products || []
  } catch (_) {
    assistantAnswer.value = 'AI assistant is temporarily unavailable.'
  } finally {
    assistantLoading.value = false
  }
}

onMounted(async () => {
  // Featured products + categories in parallel
  try {
    const [prodRes, catRes] = await Promise.all([
      productService.getAll({ per_page: 8, page: 1 }),
      categoryService.getAll(),
    ])
    featuredProducts.value = prodRes.data?.data || []
    categories.value       = (catRes.data?.data || catRes.data || []).slice(0, 6)
  } catch (_) {} finally { productsLoading.value = false }

  // Trending (public — no auth needed)
  try {
    const res = await aiService.trending()
    trendingProducts.value = res.data?.products || []
  } catch (_) {} finally { trendingLoading.value = false }

  // Explore (public)
  loadExplore()

  // Personalized recs (auth only)
  if (auth.isAuthenticated && auth.user?.id) {
    try {
      const res = await aiService.forUser()
      recommendations.value = res.data?.products || res.data?.data || []
      recSection.value       = res.data?.section || 'For You'
    } catch (_) {}
  }
})
</script>
