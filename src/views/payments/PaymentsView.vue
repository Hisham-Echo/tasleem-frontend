<template>
  <div>
    <div class="page-header">
      <div class="container">
        <h1 class="text-cream mb-0"><i class="bi bi-credit-card me-2 text-gold"></i>Payment History</h1>
      </div>
    </div>

    <div class="container py-4">
      <LoadingSpinner v-if="loading" height="300px" />
      
      <div v-else-if="payments.length === 0" class="text-center py-5">
        <i class="bi bi-receipt text-muted" style="font-size: 4rem;"></i>
        <h4 class="text-muted mt-3">No payments found</h4>
        <p class="text-muted">You haven't made any payments yet.</p>
        <RouterLink to="/products" class="btn btn-gold mt-2">Browse Products</RouterLink>
      </div>

      <div v-else class="card payments-card p-4">
        <div class="table-responsive">
          <table class="table table-dark table-hover mb-0 align-middle">
            <thead>
              <tr>
                <th class="text-muted">Transaction ID</th>
                <th class="text-muted">Date</th>
                <th class="text-muted">Method</th>
                <th class="text-muted">Amount</th>
                <th class="text-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in payments" :key="payment.id">
                <td class="text-cream fw-bold">#{{ payment.id }}</td>
                <td class="text-muted">{{ formatDate(payment.created_at) }}</td>
                <td class="text-cream text-capitalize">{{ payment.payment_method || 'N/A' }}</td>
                <td class="text-gold fw-bold">{{ formatPrice(payment.amount) }}</td>
                <td>
                  <span class="badge" :class="statusBadge(payment.status)">{{ payment.status || 'pending' }}</span>
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
import { paymentService } from '@/services/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const auth = useAuthStore()
const payments = ref([])
const loading = ref(true)

function formatPrice(v) { 
  return new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(v || 0) 
}

function formatDate(d) { 
  return d ? new Date(d).toLocaleDateString('en-EG', { year:'numeric', month:'short', day:'numeric' }) : '' 
}

function statusBadge(s) {
  const status = (s || 'pending').toLowerCase()
  const m = { 
    pending: 'bg-warning text-dark', 
    processing: 'bg-info text-dark', 
    completed: 'bg-success', 
    paid: 'bg-success', 
    failed: 'bg-danger', 
    cancelled: 'bg-danger',
    refunded: 'bg-secondary'
  }
  return m[status] || 'bg-secondary'
}

async function fetchPayments() {
  loading.value = true
  try {
    let res
    // FIX 1: Filter by user_id for regular users to avoid 403 Forbidden errors
    if (auth.isAdmin) {
      res = await paymentService.getAll()
    } else {
      res = await paymentService.getAll({ user_id: auth.user.id })
    }
    payments.value = res.data?.data || res.data || []
  } catch (error) {
    console.error('Fetch payments error:', error)
    payments.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchPayments)
</script>

<style scoped>
.payments-card { background: var(--navy-card); border: 1px solid var(--navy-border); border-radius: 1rem; }
.table-dark { --bs-table-bg: transparent; --bs-table-border-color: var(--navy-border); }
</style>