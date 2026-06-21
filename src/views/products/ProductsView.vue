<template>
  <div>
    <div class="page-header">
      <div class="container">
        <h1 class="text-cream mb-0"><i class="bi bi-grid me-2 text-gold"></i>Our Products</h1>
      </div>
    </div>

    <div class="container py-4">
      <div class="row g-4">
        <!-- Filters Sidebar -->
        <div class="col-lg-3">
          <div class="card filter-card p-3">
            <h5 class="text-cream mb-3">Filters</h5>
            
            <div class="mb-3">
              <label class="form-label text-muted">Category</label>
              <select class="form-select" v-model="filters.category_id">
                <option :value="null">All Categories</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label text-muted">Price Range</label>
              <div class="d-flex gap-2">
                <input type="number" class="form-control" placeholder="Min" v-model.number="filters.min_price" />
                <input type="number" class="form-control" placeholder="Max" v-model.number="filters.max_price" />
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label text-muted">Sort By</label>
              <select class="form-select" v-model="filters.sort_by">
                <option value="created_at">Newest</option>
                <option value="price">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rate">Top Rated</option>
              </select>
            </div>

            <button class="btn btn-outline-gold w-100" @click="resetFilters">
              <i class="bi bi-arrow-counterclockwise me-1"></i>Reset Filters
            </button>
          </div>
        </div>

        <!-- Products Grid -->
        <div class="col-lg-9">
          <LoadingSpinner v-if="loading && products.length === 0" height="400px" />
          
          <div v-else-if="products.length === 0" class="text-center py-5">
            <i class="bi bi-box-seam text-muted" style="font-size:3rem;"></i>
            <h5 class="text-muted mt-3">No products found</h5>
            <p class="text-muted">Try adjusting your filters.</p>
          </div>

          <div v-else>
            <div class="row g-4">
              <div class="col-6 col-md-4" v-for="product in products" :key="product.id">
                <ProductCard :product="product" />
              </div>
            </div>

            <!-- Pagination -->
            <div class="d-flex justify-content-center mt-5" v-if="totalPages > 1">
              <nav>
                <ul class="pagination">
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Previous</a>
                  </li>
                  <li class="page-item" v-for="p in visiblePages" :key="p" :class="{ active: currentPage === p }">
                    <a class="page-link" href="#" @click.prevent="changePage(p)">{{ p }}</a>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Next</a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { productService, categoryService } from '@/services/api'
import ProductCard from '@/components/ui/ProductCard.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const products = ref([])
const categories = ref([])
const loading = ref(true)
const totalPages = ref(1)
const currentPage = ref(1)

// FIX 1: Request 24 items per page instead of 9
const filters = reactive({
  category_id: null,
  min_price: null,
  max_price: null,
  sort_by: 'created_at',
  per_page: 24 
})

// Helper to show a clean range of page numbers (e.g., 1 2 3 ... 10)
const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  let pages = []
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 3) pages = [1, 2, 3, 4, '...', total]
    else if (current >= total - 2) pages = [1, '...', total - 3, total - 2, total - 1, total]
    else pages = [1, '...', current - 1, current, current + 1, '...', total]
  }
  return pages
})

async function fetchCategories() {
  try {
    const res = await categoryService.getAll()
    categories.value = res.data?.data || res.data || []
  } catch (_) {}
}

async function fetchProducts() {
  loading.value = true
  try {
    // Clean null values from filters
    const params = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== null && v !== '')
    )
    
    // Ensure page is included
    params.page = currentPage.value

    const res = await productService.getAll(params)
    const rawProducts = res.data?.data || []
    
    // FIX 2: Map backend keys to frontend keys so ProductCard works perfectly
    products.value = rawProducts.map(p => ({
      ...p,
      // Backend sends 'quantity', frontend expects 'stock'
      stock: p.quantity ?? p.stock ?? 0,
      // Backend sends 'rate' as string "4.00", frontend expects 'rating' as number
      rating: parseFloat(p.rate) || p.rating || 0,
      // Backend sends 'owner', frontend expects 'seller'
      seller: p.owner ?? p.seller ?? null,
      // Backend sends 'type: "rental"', frontend expects boolean 'is_rentable'
      is_rentable: p.type === 'rental' || !!p.is_rentable,
      // Map rental price if needed
      daily_rental_price: p.rental_price ?? p.daily_rental_price ?? 0
    }))

    // FIX 3: Read 'pagination' instead of 'meta' (based on your actual JSON response)
    const pagination = res.data?.pagination || res.data?.meta || {}
    totalPages.value = pagination.last_page || 1
    currentPage.value = pagination.current_page || 1
    
  } catch (error) {
    console.error('Fetch products error:', error)
    products.value = []
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  filters.category_id = null
  filters.min_price = null
  filters.max_price = null
  filters.sort_by = 'created_at'
  currentPage.value = 1
}

function changePage(p) {
  if (p < 1 || p > totalPages.value || p === '...') return
  currentPage.value = p
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Watch filters to reset to page 1 when filters change
watch(filters, () => {
  currentPage.value = 1
  fetchProducts()
}, { deep: true })

// Watch currentPage to fetch new page
watch(currentPage, () => {
  fetchProducts()
})

onMounted(() => {
  fetchCategories()
  fetchProducts()
})
</script>

<style scoped>
.filter-card { background: var(--navy-card); border: 1px solid var(--navy-border); position: sticky; top: 100px; }
.page-link { background: var(--navy-card); border-color: var(--navy-border); color: var(--cream); }
.page-item.active .page-link { background: var(--gold); border-color: var(--gold); color: var(--navy-bg); }
.page-link:hover { background: var(--navy-hover); color: var(--gold); }
</style>