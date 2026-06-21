<template>
  <div>
    <div class="page-header">
      <div class="container">
        <h1 class="text-cream mb-0"><i class="bi bi-receipt me-2 text-gold"></i>Order Details</h1>
      </div>
    </div>

    <div class="container py-4">
      <LoadingSpinner v-if="loading" height="400px" />
      
      <div v-else-if="!order" class="text-center py-5">
        <i class="bi bi-exclamation-triangle text-muted" style="font-size:3rem;"></i>
        <h4 class="text-muted mt-3">Order Not Found</h4>
        <RouterLink to="/orders" class="btn btn-gold mt-2">Back to Orders</RouterLink>
      </div>

      <div v-else>
        <!-- Status Tracker -->
        <div class="card order-card p-4 mb-4" v-if="order.status !== 'cancelled'">
          <div class="status-tracker">
            <div v-for="(s, index) in statusSteps" :key="s.key" 
                 class="status-step" :class="{ active: index <= currentStepIndex, current: index === currentStepIndex }">
              <div class="status-icon">
                <i :class="s.icon"></i>
              </div>
              <span class="status-label">{{ s.label }}</span>
              <div class="status-line" v-if="index < statusSteps.length - 1"></div>
            </div>
          </div>
        </div>

        <div class="row g-4">
          <div class="col-lg-8">
            <!-- Order Info -->
            <div class="card order-card p-4 mb-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="text-cream mb-0">Order #{{ order.id }}</h5>
                <span class="badge" :class="statusBadge(order.status)">{{ order.status }}</span>
              </div>
              <div class="row text-muted mb-3">
                <div class="col-md-4">
                  <small>Order Date</small>
                  <p class="text-cream mb-0">{{ formatDate(order.created_at) }}</p>
                </div>
                <div class="col-md-4">
                  <small>Payment Method</small>
                  <p class="text-cream mb-0 text-capitalize">{{ order.payment_method || 'N/A' }}</p>
                </div>
                <div class="col-md-4">
                  <small>Shipping Address</small>
                  <p class="text-cream mb-0">{{ order.shipping_address || 'N/A' }}</p>
                </div>
              </div>

              <h6 class="text-cream mb-3">Items</h6>
              <div v-for="item in order.items" :key="item.id" class="d-flex gap-3 mb-3 pb-3 border-bottom" style="border-color: var(--navy-border) !important;">
                <img :src="item.product?.image || item.image" class="rounded" style="width: 70px; height: 70px; object-fit: cover;" />
                <div class="flex-grow-1">
                  <h6 class="text-cream mb-1">{{ item.product?.name || item.name }}</h6>
                  <small class="text-muted">Quantity: {{ item.quantity }}</small>
                </div>
                <span class="text-cream fw-bold">{{ formatPrice(item.price * item.quantity) }}</span>
              </div>

              <div class="d-flex justify-content-between mt-3">
                <span class="text-muted">Total Amount</span>
                <span class="text-gold fw-bold fs-5">{{ formatPrice(order.total_amount) }}</span>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card order-card p-4 sticky-top" style="top: 100px;">
              <h6 class="text-cream mb-3">Need Help?</h6>
              <p class="text-muted" style="font-size: .9rem;">If you have any issues with this order, please contact our support team.</p>
              <a href="mailto:support@tasleem.com" class="btn btn-outline-gold w-100 mb-2">
                <i class="bi bi-envelope me-2"></i>Contact Support
              </a>
              
              <button v-if="canCancel" class="btn btn-danger w-100" @click="showCancelConfirm = true" :disabled="cancelling">
                <span v-if="cancelling" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-x-circle me-2"></i>Cancel Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cancel Confirmation Modal -->
    <div class="modal fade" :class="{ show: showCancelConfirm }" :style="{ display: showCancelConfirm ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="background: var(--navy-card); border: 1px solid var(--navy-border);">
          <div class="modal-header border-0">
            <h5 class="modal-title text-cream">Cancel Order?</h5>
            <button type="button" class="btn-close btn-close-white" @click="showCancelConfirm = false"></button>
          </div>
          <div class="modal-body text-muted">
            Are you sure you want to cancel order #{{ order?.id }}? This action cannot be undone.
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-outline-secondary" @click="showCancelConfirm = false">Keep Order</button>
            <button type="button" class="btn btn-danger" @click="cancelOrder" :disabled="cancelling">
              <span v-if="cancelling" class="spinner-border spinner-border-sm me-2"></span>
              Yes, Cancel Order
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showCancelConfirm" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { orderService } from '@/services/api'
import { useToast } from 'vue-toastification'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const route = useRoute()
const toast = useToast()
const order = ref(null)
const loading = ref(true)
const cancelling = ref(false)
const showCancelConfirm = ref(false)

const statusSteps = [
  { key: 'pending',    label: 'Placed',    icon: 'bi bi-check2' },
  { key: 'processing', label: 'Processing', icon: 'bi bi-gear' },
  { key: 'shipped',    label: 'Shipped',   icon: 'bi bi-truck' },
  { key: 'completed',  label: 'Delivered', icon: 'bi bi-house-check' },
]

const statusOrder = ['pending', 'processing', 'shipped', 'completed']
const currentStepIndex = computed(() => {
  if (order.value?.status === 'cancelled') return -1
  return statusOrder.indexOf(order.value?.status) ?? 0
})

const canCancel = computed(() =>
  order.value && ['pending', 'processing'].includes(order.value.status)
)

function formatPrice(v) { return new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(v || 0) }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-EG', { year:'numeric', month:'long', day:'numeric' }) : '' }
function statusBadge(s) {
  const m = { pending:'bg-warning text-dark', processing:'bg-info text-dark', shipped:'badge-gold', completed:'bg-success', cancelled:'bg-danger' }
  return m[s] || 'bg-secondary'
}

async function cancelOrder() {
  cancelling.value = true
  try {
    // FIX: orderService.cancel does not exist. Use update() to change the status.
    await orderService.update(order.value.id, { status: 'cancelled' })
    order.value.status = 'cancelled'
    showCancelConfirm.value = false
    toast.success('Order cancelled successfully')
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to cancel order')
  } finally {
    cancelling.value = false
  }
}

onMounted(async () => {
  try {
    const res = await orderService.getById(route.params.id)
    order.value = res.data?.data || res.data
  } catch (_) { order.value = null } finally { loading.value = false }
})
</script>

<style scoped>
.order-card { background: var(--navy-card); border: 1px solid var(--navy-border); border-radius: 1rem; }
.status-tracker { display: flex; justify-content: space-between; position: relative; }
.status-step { display: flex; flex-direction: column; align-items: center; position: relative; flex: 1; }
.status-icon { width: 45px; height: 45px; border-radius: 50%; background: var(--navy-bg); border: 2px solid var(--navy-border); display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 1.2rem; transition: all 0.3s; z-index: 1; }
.status-step.active .status-icon { background: var(--gold); border-color: var(--gold); color: var(--navy-bg); }
.status-step.current .status-icon { box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.3); }
.status-label { margin-top: 8px; font-size: 0.85rem; color: var(--text-muted); }
.status-step.active .status-label { color: var(--cream); font-weight: 600; }
.status-line { position: absolute; top: 22px; left: 50%; width: 100%; height: 2px; background: var(--navy-border); z-index: 0; }
.status-step.active .status-line { background: var(--gold); }
</style>