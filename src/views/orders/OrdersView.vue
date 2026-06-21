<template>
  <div>
    <div class="page-header">
      <div class="container">
        <h1 class="text-cream mb-0"><i class="bi bi-bag me-2 text-gold"></i>My Orders</h1>
      </div>
    </div>

    <div class="container py-4">
      <LoadingSpinner v-if="loading" height="300px" />
      
      <div v-else-if="orders.length === 0" class="text-center py-5">
        <i class="bi bi-bag-x text-muted" style="font-size: 4rem;"></i>
        <h4 class="text-muted mt-3">No orders yet</h4>
        <p class="text-muted">You haven't placed any orders. Start shopping to see your orders here!</p>
        <RouterLink to="/products" class="btn btn-gold mt-2">Browse Products</RouterLink>
      </div>

      <div v-else class="card orders-card p-4">
        <div class="table-responsive">
          <table class="table table-dark table-hover mb-0 align-middle">
            <thead>
              <tr>
                <th class="text-muted">Order ID</th>
                <th class="text-muted">Date</th>
                <th class="text-muted">Items</th>
                <th class="text-muted">Total</th>
                <th class="text-muted">Status</th>
                <th class="text-muted">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id">
                <td class="text-cream fw-bold">#{{ order.id }}</td>
                <td class="text-muted">{{ formatDate(order.created_at) }}</td>
                <td class="text-cream">{{ order.items_count || order.items?.length || 0 }} items</td>
                <td class="text-gold fw-bold">{{ formatPrice(order.total_amount) }}</td>
                <td>
                  <!-- FIX 2: Use proper status badges -->
                  <span class="badge" :class="statusBadge(order.status)">{{ order.status }}</span>
                </td>
                <td>
                  <RouterLink :to="`/orders/${order.id}`" class="btn btn-sm btn-outline-gold">
                    <i class="bi bi-eye me-1"></i>View
                  </RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { orderService, userService } from '@/services/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const auth = useAuthStore()
const orders = ref([])
const loading = ref(true)

function formatPrice(v) { 
  return new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(v || 0) 
}

function formatDate(d) { 
  return d ? new Date(d).toLocaleDateString('en-EG', { year:'numeric', month:'short', day:'numeric' }) : '' 
}

function statusBadge(s) {
  const m = { 
    pending: 'bg-warning text-dark', 
    processing: 'bg-info text-dark', 
    shipped: 'badge-gold', 
    completed: 'bg-success', 
    cancelled: 'bg-danger' 
  }
  return m[s] || 'bg-secondary'
}

async function fetchOrders() {
  loading.value = true
  try {
    let res
    // FIX 1: Use user-specific endpoint for regular users, admin endpoint for admins
    if (auth.isAdmin) {
      res = await orderService.getAll()
    } else {
      res = await userService.getOrders(auth.user.id)
    }
    orders.value = res.data?.data || res.data || []
  } catch (error) {
    console.error('Fetch orders error:', error)
    orders.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchOrders)
</script>

<style scoped>
.orders-card { 
  background: var(--navy-card); 
  border: 1px solid var(--navy-border); 
  border-radius: 1rem; 
}
.table-dark { 
  --bs-table-bg: transparent; 
  --bs-table-border-color: var(--navy-border); 
}
.badge-gold {
  background-color: var(--gold);
  color: var(--navy-bg);
}
</style>