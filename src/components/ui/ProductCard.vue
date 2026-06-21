<template>
  <div class="card product-card card-hover h-100" @click="goToProduct">
    <!-- Badges -->
    <span v-if="product.is_rentable" class="product-badge">Rentable</span>

    <!-- Wishlist -->
    <button
      class="wishlist-btn"
      :class="{ active: wishlist.isInWishlist(product.id) }"
      @click.stop="toggleWishlist"
    >
      <i :class="wishlist.isInWishlist(product.id) ? 'bi bi-heart-fill' : 'bi bi-heart'"></i>
    </button>

    <!-- Image -->
    <div class="product-img-wrap">
      <img
        v-if="productImage"
        :src="productImage"
        :alt="product.name"
        loading="lazy"
        @error="e => e.target.style.display='none'"
      />
      <i v-else class="bi bi-image no-img"></i>
    </div>

    <div class="card-body d-flex flex-column gap-2 p-3">
      <!-- Category -->
      <span class="badge badge-gold" style="width:fit-content; font-size:.7rem;" v-if="product.category">
        {{ product.category?.name || product.category }}
      </span>

      <!-- Name -->
      <h6 class="card-title text-cream mb-0 text-truncate" style="font-size:.95rem;">{{ product.name }}</h6>

      <!-- ✅ FIX: Dynamic Rating and Reviews Count -->
      <!-- Removed the hardcoded 4 stars and 0 reviews. Now it dynamically calculates based on the product data -->
      <div class="d-flex align-items-center gap-1 star-rating">
        <template v-for="n in 5" :key="n">
          <i :class="n <= Math.round(displayRating) ? 'bi bi-star-fill filled' : 'bi bi-star empty'"></i>
        </template>
        <span class="text-muted ms-1" style="font-size:.78rem;">({{ displayReviewsCount }})</span>
      </div>

      <!-- Price -->
      <div class="mt-auto d-flex align-items-center justify-content-between">
        <div>
          <span class="product-price">{{ formatPrice(product.price) }}</span>
          <span class="product-old-price ms-2" v-if="product.old_price">{{ formatPrice(product.old_price) }}</span>
        </div>
        <button class="btn btn-gold btn-sm px-3" @click.stop="addToCart" :disabled="cartLoading">
          <i class="bi bi-bag-plus" v-if="!cartLoading"></i>
          <span class="spinner-border spinner-border-sm" v-else></span>
        </button>
      </div>

      <!-- Rental price -->
      <div v-if="product.is_rentable && product.daily_rental_price" class="text-muted" style="font-size:.78rem;">
        <i class="bi bi-clock me-1"></i>{{ formatPrice(product.daily_rental_price) }}/day
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const props = defineProps({ product: { type: Object, required: true } })
const router = useRouter()
const cart = useCartStore()
const wishlist = useWishlistStore()
const auth = useAuthStore()
const toast = useToast()
const cartLoading = ref(false)

// ✅ FIX 1: Safely calculate the rating (0 to 5)
// Handles the backend sending 'rate' as a string (e.g., "4.00") or 'rating' as a number
const displayRating = computed(() => {
  let r = props.product.rating
  if (r === undefined || r === null || r === '') {
    r = props.product.rate // Fallback to backend's 'rate' key
  }
  const num = parseFloat(r)
  return isNaN(num) ? 0 : Math.max(0, Math.min(5, num)) // Clamp between 0 and 5
})

// ✅ FIX 2: Safely get the reviews count
// Falls back to 'pay_count' if the backend doesn't provide 'reviews_count'
const displayReviewsCount = computed(() => {
  if (props.product.reviews_count !== undefined && props.product.reviews_count !== null) {
    return props.product.reviews_count
  }
  if (props.product.pay_count !== undefined && props.product.pay_count !== null) {
    return props.product.pay_count 
  }
  return 0
})

const productImage = computed(() => {
  let url = props.product.image
  if (!url && props.product.images && props.product.images.length > 0) {
    const img = props.product.images[0]
    url = img.image_url || img.url || (typeof img === 'string' ? img : null)
  }
  if (!url) return null
  
  if (url.startsWith('http://')) url = url.replace('http://', 'https://')
  if (!url.startsWith('http')) url = `https://tasleembackendapifinal-production.up.railway.app/storage/${url}`
  
  return url
})

function formatPrice(val) {
  return new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(val || 0)
}

function goToProduct() {
  router.push({ name: 'ProductDetail', params: { id: props.product.id } })
}

async function addToCart() {
  if (!auth.isAuthenticated) {
    toast.info('Please sign in to add items to cart')
    router.push({ name: 'Login' })
    return
  }
  cartLoading.value = true
  const res = await cart.addItem({
    product_id: props.product.id,
    quantity: 1,
    item_type: 'purchase'
  })
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
    router.push({ name: 'Login' })
    return
  }
  const res = await wishlist.toggle(props.product.id)
  if (res?.needsAuth) {
    toast.info('Please sign in to save items')
    router.push({ name: 'Login' })
    return
  }
  if (res?.added) toast.success('Added to wishlist')
  else if (res?.added === false) toast.info('Removed from wishlist')
  else if (res?.error) toast.error(res.error)
}
</script>

<style scoped>
.product-card {
  background: var(--navy-card);
  border: 1px solid var(--navy-border);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.product-card:hover {
  transform: translateY(-5px);
  border-color: var(--gold);
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}
.product-img-wrap {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--navy-bg);
  overflow: hidden;
}
.product-img-wrap img {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
}
.no-img {
  font-size: 3rem;
  color: var(--navy-border);
}
.product-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  background: var(--gold);
  color: var(--navy-bg);
  font-size: 0.7rem;
  font-weight: bold;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}
.wishlist-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  background: rgba(0,0,0,0.5);
  border: none;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.wishlist-btn.active, .wishlist-btn:hover {
  background: var(--gold);
  color: var(--navy-bg);
}
.star-rating .filled { color: var(--gold); }
.star-rating .empty { color: var(--navy-border); }
.product-price { color: var(--gold); font-weight: bold; font-size: 1.1rem; }
.product-old-price { color: var(--text-muted); text-decoration: line-through; font-size: 0.85rem; }
</style>