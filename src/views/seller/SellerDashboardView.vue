<template>
  <div>
    <div class="page-header">
      <div class="container">
        <h1 class="text-cream mb-0"><i class="bi bi-shop me-2 text-gold"></i>Seller Dashboard</h1>
      </div>
    </div>

    <div class="container py-4">
      <!-- Stats Cards -->
      <div class="row g-4 mb-4">
        <div class="col-md-4">
          <div class="card stat-card p-3">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="text-muted mb-1">Total Products</h6>
                <h3 class="text-cream mb-0">{{ stats.products }}</h3>
              </div>
              <i class="bi bi-box-seam text-gold" style="font-size: 2rem;"></i>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card stat-card p-3">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="text-muted mb-1">Total Orders</h6>
                <h3 class="text-cream mb-0">{{ stats.orders }}</h3>
              </div>
              <i class="bi bi-bag-check text-gold" style="font-size: 2rem;"></i>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card stat-card p-3">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="text-muted mb-1">Total Revenue</h6>
                <h3 class="text-gold mb-0">{{ formatPrice(stats.revenue) }}</h3>
              </div>
              <i class="bi bi-cash-stack text-gold" style="font-size: 2rem;"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- My Products -->
      <div class="card dashboard-card p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h5 class="text-cream mb-0">My Products</h5>
          <RouterLink to="/seller/products/new" class="btn btn-gold btn-sm">
            <i class="bi bi-plus-circle me-1"></i>Add New
          </RouterLink>
        </div>

        <LoadingSpinner v-if="loading" height="200px" />
        
        <div v-else-if="products.length === 0" class="text-center py-4 text-muted">
          You haven't created any products yet.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-dark table-hover mb-0 align-middle">
            <thead>
              <tr>
                <th class="text-muted">Product</th>
                <th class="text-muted">Price</th>
                <th class="text-muted">Stock</th>
                <th class="text-muted">Status</th>
                <th class="text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in products" :key="product.id">
                <td class="text-cream">
                  <div class="d-flex align-items-center gap-2">
                    <img :src="getProductImage(product)" class="rounded" style="width: 40px; height: 40px; object-fit: cover;" />
                    <span>{{ product.name }}</span>
                  </div>
                </td>
                <td class="text-gold">{{ formatPrice(product.price) }}</td>
                <td class="text-cream">{{ product.stock }}</td>
                <td>
                  <span class="badge" :class="product.stock > 0 ? 'bg-success' : 'bg-danger'">
                    {{ product.stock > 0 ? 'In Stock' : 'Out of Stock' }}
                  </span>
                </td>
                <td>
                  <div class="d-flex gap-2">
                    <RouterLink :to="`/seller/products/${product.id}/edit`" class="btn btn-sm btn-outline-gold">
                      <i class="bi bi-pencil"></i>
                    </RouterLink>
                    <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(product)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- FIX 2: Delete Confirmation Modal -->
    <div class="modal fade" :class="{ show: showDeleteModal }" :style="{ display: showDeleteModal ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="background: var(--navy-card); border: 1px solid var(--navy-border);">
          <div class="modal-header border-0">
            <h5 class="modal-title text-cream">Delete Product?</h5>
            <button type="button" class="btn-close btn-close-white" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body text-muted">
            Are you sure you want to delete <strong class="text-cream">{{ productToDelete?.name }}</strong>?
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-outline-secondary" @click="showDeleteModal = false">Cancel</button>
            <button type="button" class="btn btn-danger" @click="deleteProduct" :disabled="deleting">
              <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showDeleteModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { productService, orderService } from '@/services/api'
import { useToast } from 'vue-toastification'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const auth = useAuthStore()
const toast = useToast()

const products = ref([])
const loading = ref(true)
const showDeleteModal = ref(false)
const productToDelete = ref(null)
const deleting = ref(false)

const stats = reactive({
  products: 0,
  orders: 0,
  revenue: 0
})

function formatPrice(v) {
  return new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(v || 0)
}

function getProductImage(product) {
  let url = product.image
  if (!url && product.images && product.images.length > 0) {
    url = product.images[0].image_url || product.images[0].url
  }
  if (!url) return '/placeholder.jpg'
  if (!url.startsWith('http')) url = `https://tasleembackendapifinal-production.up.railway.app/storage/${url}`
  return url
}

async function fetchDashboardData() {
  loading.value = true
  try {
    // FIX 1: Filter products by seller_id
    const prodRes = await productService.getAll({ seller_id: auth.user.id })
    products.value = prodRes.data?.data || prodRes.data || []
    stats.products = products.value.length

    // FIX 1: Filter orders by seller_id
    try {
      const ordRes = await orderService.getAll({ seller_id: auth.user.id })
      const orders = ordRes.data?.data || ordRes.data || []
      stats.orders = orders.length
      stats.revenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
    } catch (_) {
      stats.orders = 0
      stats.revenue = 0
    }
  } catch (error) {
    console.error('Fetch dashboard error:', error)
  } finally {
    loading.value = false
  }
}

function confirmDelete(product) {
  productToDelete.value = product
  showDeleteModal.value = true
}

async function deleteProduct() {
  if (!productToDelete.value) return
  deleting.value = true
  try {
    await productService.delete(productToDelete.value.id)
    // FIX 3: Update local state immediately
    products.value = products.value.filter(p => p.id !== productToDelete.value.id)
    stats.products = products.value.length
    showDeleteModal.value = false
    productToDelete.value = null
    toast.success('Product deleted successfully')
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to delete product')
  } finally {
    deleting.value = false
  }
}

onMounted(fetchDashboardData)
</script>

<style scoped>
.stat-card { background: var(--navy-card); border: 1px solid var(--navy-border); border-radius: 1rem; }
.dashboard-card { background: var(--navy-card); border: 1px solid var(--navy-border); border-radius: 1rem; }
.table-dark { --bs-table-bg: transparent; --bs-table-border-color: var(--navy-border); }
</style>