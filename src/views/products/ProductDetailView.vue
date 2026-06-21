<template>
  <div>
    <div class="page-header">
      <div class="container">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item"><RouterLink to="/" class="text-gold">Home</RouterLink></li>
            <li class="breadcrumb-item"><RouterLink to="/products" class="text-gold">Products</RouterLink></li>
            <li class="breadcrumb-item active text-cream" aria-current="page">{{ product?.name || 'Loading...' }}</li>
          </ol>
        </nav>
      </div>
    </div>

    <div class="container py-4">
      <LoadingSpinner v-if="loading" height="500px" />
      
      <div v-else-if="!product" class="text-center py-5">
        <i class="bi bi-box-seam text-muted" style="font-size:4rem;"></i>
        <h4 class="text-muted mt-3">Product Not Found</h4>
        <RouterLink to="/products" class="btn btn-gold mt-2">Back to Products</RouterLink>
      </div>

      <div v-else class="row g-5">
        <!-- Image Gallery -->
        <div class="col-lg-6">
          <div class="product-gallery">
            <div class="main-image mb-3">
              <img :src="currentImage" :alt="product.name" class="img-fluid rounded" />
              <span v-if="product.is_rentable" class="badge badge-gold position-absolute top-0 start-0 m-3">Rentable</span>
            </div>
            <div class="thumbnails d-flex gap-2 flex-wrap" v-if="images.length > 1">
              <img v-for="(img, index) in images" :key="index" 
                   :src="img" 
                   class="thumbnail rounded" 
                   :class="{ active: currentImageIndex === index }"
                   @click="currentImageIndex = index" />
            </div>
            
            <!-- Carousel Dots (Mobile) -->
            <div class="d-flex justify-content-center gap-2 mt-3 d-lg-none">
              <button 
                v-for="i in carouselDots" 
                :key="i"
                class="btn btn-sm rounded-circle"
                :class="(i - 1) === carouselIndex ? 'btn-gold' : 'btn-outline-gold'"
                @click="carouselIndex = i - 1; currentImageIndex = i - 1"
                style="width:10px; height:10px; padding:0;"
              ></button>
            </div>
          </div>
        </div>

        <!-- Product Info -->
        <div class="col-lg-6">
          <span class="badge badge-gold mb-2" v-if="product.category">{{ product.category.name }}</span>
          <h2 class="text-cream mb-3">{{ product.name }}</h2>
          
          <div class="d-flex align-items-center gap-3 mb-3">
            <div class="star-rating">
              <template v-for="n in 5" :key="n">
                <i :class="n <= Math.round(product.rating || 0) ? 'bi bi-star-fill filled' : 'bi bi-star empty'"></i>
              </template>
            </div>
            <span class="text-muted">({{ product.reviews_count || 0 }} Reviews)</span>
          </div>

          <div class="mb-4">
            <span class="fs-2 fw-bold text-gold">{{ formatPrice(product.price) }}</span>
            <span class="fs-5 text-muted text-decoration-line-through ms-2" v-if="product.old_price">{{ formatPrice(product.old_price) }}</span>
          </div>

          <p class="text-muted mb-4">{{ product.description || 'No description available.' }}</p>

          <div class="d-flex gap-3 mb-4">
            <button class="btn btn-gold flex-grow-1 py-2" @click="addToCart" :disabled="cartLoading">
              <span v-if="cartLoading" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="bi bi-bag-plus me-2"></i>Add to Cart
            </button>
            <button class="btn btn-outline-gold px-3" @click="toggleWishlist">
              <i :class="wishlist.isInWishlist(product.id) ? 'bi bi-heart-fill' : 'bi bi-heart'"></i>
            </button>
          </div>

          <div v-if="product.is_rentable" class="card p-3 mb-4" style="background: rgba(212, 175, 55, 0.05); border: 1px solid var(--gold);">
            <h6 class="text-cream mb-2"><i class="bi bi-calendar-check me-2 text-gold"></i>Rent this item</h6>
            <p class="text-muted mb-2" style="font-size: .9rem;">{{ formatPrice(product.daily_rental_price) }} / day</p>
            <RouterLink :to="`/rentals/new?product_id=${product.id}`" class="btn btn-outline-gold btn-sm w-100">
              Select Rental Dates
            </RouterLink>
          </div>

          <div class="product-meta text-muted" style="font-size: .85rem;">
            <p class="mb-1"><strong>SKU:</strong> {{ product.sku || 'N/A' }}</p>
            <p class="mb-1"><strong>Stock:</strong> <span :class="product.stock > 0 ? 'text-success' : 'text-danger'">{{ product.stock > 0 ? `${product.stock} in stock` : 'Out of stock' }}</span></p>
            <p class="mb-0"><strong>Seller:</strong> {{ product.seller?.name || 'Tasleem Official' }}</p>
          </div>
        </div>
      </div>

      <!-- Tabs: Description & Reviews -->
      <div class="row mt-5" v-if="product">
        <div class="col-12">
          <ul class="nav nav-tabs product-tabs mb-4">
            <li class="nav-item">
              <button class="nav-link" :class="{ active: activeTab === 'desc' }" @click="activeTab = 'desc'">Description</button>
            </li>
            <li class="nav-item">
              <button class="nav-link" :class="{ active: activeTab === 'reviews' }" @click="activeTab = 'reviews'">Reviews ({{ reviews.length }})</button>
            </li>
          </ul>

          <div v-if="activeTab === 'desc'" class="card order-card p-4">
            <p class="text-muted mb-0">{{ product.long_description || product.description || 'No detailed description provided.' }}</p>
          </div>

          <div v-if="activeTab === 'reviews'">
            <div v-if="reviews.length === 0" class="text-center py-4">
              <i class="bi bi-chat-square-text text-muted" style="font-size: 2rem;"></i>
              <p class="text-muted mt-2">No reviews yet. Be the first to review this product!</p>
            </div>
            <div v-else class="d-flex flex-column gap-3">
              <div v-for="review in reviews" :key="review.id" class="card order-card p-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h6 class="text-cream mb-0">{{ review.user?.name || 'Anonymous' }}</h6>
                  <div class="star-rating small">
                    <template v-for="n in 5" :key="n">
                      <i :class="n <= review.rating ? 'bi bi-star-fill filled' : 'bi bi-star empty'"></i>
                    </template>
                  </div>
                </div>
                <p class="text-muted mb-0" style="font-size: .9rem;">{{ review.comment }}</p>
                <small class="text-muted mt-1">{{ formatDate(review.created_at) }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Similar Products -->
      <div class="mt-5" v-if="similarProducts.length > 0">
        <h4 class="text-cream mb-4">Similar Products</h4>
        <div class="row g-4">
          <div class="col-6 col-md-4 col-lg-3" v-for="p in similarProducts" :key="p.id">
            <ProductCard :product="p" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { productService, reviewService, aiService } from '@/services/api'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import ProductCard from '@/components/ui/ProductCard.vue'

const route = useRoute()
const cart = useCartStore()
const wishlist = useWishlistStore()
const auth = useAuthStore()
const toast = useToast()

const product = ref(null)
const reviews = ref([])
const similarProducts = ref([])
const loading = ref(true)
const cartLoading = ref(false)
const activeTab = ref('desc')
const currentImageIndex = ref(0)

const images = computed(() => {
  if (!product.value) return []
  if (product.value.images && product.value.images.length > 0) {
    return product.value.images.map(img => {
      let url = img.image_url || img.url || img
      if (!url.startsWith('http')) url = `https://tasleembackendapifinal-production.up.railway.app/storage/${url}`
      return url
    })
  }
  if (product.value.image) {
    let url = product.value.image
    if (!url.startsWith('http')) url = `https://tasleembackendapifinal-production.up.railway.app/storage/${url}`
    return [url]
  }
  return []
})

const currentImage = computed(() => images.value[currentImageIndex.value] || '/placeholder.jpg')
const carouselDots = computed(() => images.value.length)
const carouselIndex = computed({
  get: () => currentImageIndex.value,
  set: (val) => currentImageIndex.value = val
})

function formatPrice(v) { return new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(v || 0) }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-EG') : '' }

async function fetchProduct() {
  loading.value = true
  try {
    const res = await productService.getById(route.params.id)
    product.value = res.data?.data || res.data
    
    // Fetch reviews and similar products in parallel

    if (product.value) {
      product.value.stock = product.value.quantity ?? product.value.stock ?? 0
      product.value.rating = parseFloat(product.value.rate) || product.value.rating || 0
      product.value.seller = product.value.owner ?? product.value.seller ?? null
      product.value.is_rentable = product.value.type === 'rental' || !!product.value.is_rentable
    }

    const [revRes, simRes] = await Promise.all([
      reviewService.getByProduct(product.value.id).catch(() => ({ data: { data: [] } })),
      aiService.similar(product.value.id, 4).catch(() => ({ data: { data: [] } }))
    ])
    
    reviews.value = revRes.data?.data || []
    similarProducts.value = (simRes.data?.data || []).filter(p => p.id !== product.value.id)
  } catch (e) {
    product.value = null
  } finally {
    loading.value = false
  }
}

async function addToCart() {
  if (!auth.isAuthenticated) {
    toast.info('Please sign in to add items to cart')
    return
  }
  cartLoading.value = true
  const res = await cart.addItem({ product_id: product.value.id, quantity: 1, item_type: 'purchase' })
  if (res.success) {
    toast.success('Added to cart!')
    cart.openCart()
  } else {
    toast.error(res.message)
  }
  cartLoading.value = false
}

async function toggleWishlist() {
  if (!auth.isAuthenticated) {
    toast.info('Please sign in to save items')
    return
  }
  const res = await wishlist.toggle(product.value.id)
  if (res?.added) toast.success('Added to wishlist')
  else if (res?.added === false) toast.info('Removed from wishlist')
}

watch(() => route.params.id, fetchProduct)
onMounted(fetchProduct)
</script>

<style scoped>
.order-card { background: var(--navy-card); border: 1px solid var(--navy-border); border-radius: 1rem; }
.product-gallery .main-image { position: relative; background: var(--navy-card); border-radius: 1rem; overflow: hidden; display: flex; align-items: center; justify-content: center; min-height: 400px; }
.product-gallery .main-image img { max-height: 500px; object-fit: contain; }
.thumbnail { width: 80px; height: 80px; object-fit: cover; cursor: pointer; border: 2px solid transparent; transition: all 0.2s; }
.thumbnail.active, .thumbnail:hover { border-color: var(--gold); }
.product-tabs .nav-link { color: var(--text-muted); border: none; border-bottom: 2px solid transparent; background: transparent; }
.product-tabs .nav-link.active { color: var(--gold); border-bottom-color: var(--gold); }
.star-rating .filled { color: var(--gold); }
.star-rating .empty { color: var(--navy-border); }
.star-rating.small i { font-size: 0.8rem; }
</style>