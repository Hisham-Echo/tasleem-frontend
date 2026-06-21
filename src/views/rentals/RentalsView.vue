<template>
  <div>
    <div class="page-header">
      <div class="container">
        <h1 class="text-cream mb-0"><i class="bi bi-clock-history me-2 text-gold"></i>My Rentals</h1>
      </div>
    </div>

    <div class="container py-4">
      <LoadingSpinner v-if="loading" height="300px" />
      
      <div v-else-if="rentals.length === 0" class="text-center py-5">
        <i class="bi bi-calendar-x text-muted" style="font-size: 4rem;"></i>
        <h4 class="text-muted mt-3">No rentals yet</h4>
        <p class="text-muted">You haven't rented any items. Browse rentable products to get started!</p>
        <RouterLink to="/products?is_rentable=1" class="btn btn-gold mt-2">Browse Rentable Items</RouterLink>
      </div>

      <div v-else class="card rentals-card p-4">
        <div class="table-responsive">
          <table class="table table-dark table-hover mb-0 align-middle">
            <thead>
              <tr>
                <th class="text-muted">Item</th>
                <th class="text-muted">Start Date</th>
                <th class="text-muted">End Date</th>
                <th class="text-muted">Total Price</th>
                <th class="text-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rental in rentals" :key="rental.id">
                <td class="text-cream">
                  <div class="d-flex align-items-center gap-2">
                    <img :src="rental.product?.image || '/placeholder.jpg'" class="rounded" style="width: 40px; height: 40px; object-fit: cover;" />
                    <span>{{ rental.product?.name || 'Item' }}</span>
                  </div>
                </td>
                <td class="text-muted">{{ formatDate(rental.start_date) }}</td>
                <td class="text-muted">{{ formatDate(rental.end_date) }}</td>
                <td class="text-gold fw-bold">{{ formatPrice(rental.total_price) }}</td>
                <td>
                  <span class="badge" :class="statusBadge(rental.status)">{{ rental.status }}</span>
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
import { rentalService, userService } from '@/services/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const auth = useAuthStore()
const rentals = ref([])
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
    active: 'bg-success', 
    returned: 'bg-secondary', 
    overdue: 'bg-danger',
    cancelled: 'bg-danger'
  }
  return m[s] || 'bg-secondary'
}

async function fetchRentals() {
  loading.value = true
  try {
    let res
    // FIX: Use user-specific endpoint for regular users, admin endpoint for admins
    if (auth.isAdmin) {
      res = await rentalService.getAll()
    } else {
      res = await userService.getRentals(auth.user.id)
    }
    rentals.value = res.data?.data || res.data || []
  } catch (error) {
    console.error('Fetch rentals error:', error)
    rentals.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchRentals)
</script>

<style scoped>
.rentals-card { background: var(--navy-card); border: 1px solid var(--navy-border); border-radius: 1rem; }
.table-dark { --bs-table-bg: transparent; --bs-table-border-color: var(--navy-border); }
</style>