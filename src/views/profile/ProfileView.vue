<template>
  <div>
    <div class="page-header">
      <div class="container">
        <h1 class="text-cream mb-0"><i class="bi bi-person-circle me-2 text-gold"></i>My Profile</h1>
      </div>
    </div>

    <div class="container py-4">
      <div class="row g-4">
        <!-- Sidebar Tabs -->
        <div class="col-lg-3">
          <div class="card profile-card p-3 sticky-top" style="top: 100px;">
            <div class="text-center mb-3 pb-3 border-bottom" style="border-color: var(--navy-border) !important;">
              <div class="avatar-circle mx-auto mb-2">{{ initials }}</div>
              <h6 class="text-cream mb-0">{{ auth.fullName }}</h6>
              <small class="text-muted">{{ auth.user?.email }}</small>
            </div>
            <ul class="nav nav-pills flex-column gap-1">
              <li class="nav-item" v-for="tab in tabs" :key="tab.key">
                <button class="nav-link w-100 text-start" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">
                  <i :class="tab.icon" class="me-2"></i>{{ tab.label }}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <!-- Content Area -->
        <div class="col-lg-9">
          <!-- Profile Tab -->
          <div v-if="activeTab === 'profile'" class="card profile-card p-4">
            <h5 class="text-cream mb-4">Personal Information</h5>
            <div v-if="profileSuccess" class="alert alert-success py-2">Profile updated successfully!</div>
            <form @submit.prevent="saveProfile">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label text-muted">Full Name</label>
                  <input type="text" class="form-control" v-model="profileForm.name" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted">Email Address</label>
                  <input type="email" class="form-control" v-model="profileForm.email" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted">Phone Number</label>
                  <input type="tel" class="form-control" v-model="profileForm.phone" />
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted">City</label>
                  <input type="text" class="form-control" v-model="profileForm.city" />
                </div>
                <div class="col-12">
                  <label class="form-label text-muted">Address</label>
                  <input type="text" class="form-control" v-model="profileForm.address" />
                </div>
                <div class="col-12"><hr style="border-color: var(--navy-border);" /></div>
                <div class="col-md-6">
                  <label class="form-label text-muted">New Password (Optional)</label>
                  <input type="password" class="form-control" v-model="profileForm.password" placeholder="Leave blank to keep current" />
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted">Confirm Password</label>
                  <input type="password" class="form-control" v-model="profileForm.password_confirmation" />
                </div>
              </div>
              <button type="submit" class="btn btn-gold mt-4 px-4">Save Changes</button>
            </form>
          </div>

          <!-- Orders Tab -->
          <div v-if="activeTab === 'orders'" class="card profile-card p-4">
            <h5 class="text-cream mb-4">My Orders</h5>
            <LoadingSpinner v-if="ordersLoading" height="200px" />
            <div v-else-if="orders.length === 0" class="text-center py-4 text-muted">No orders yet.</div>
            <div v-else class="table-responsive">
              <table class="table table-dark table-hover mb-0">
                <thead><tr><th>Order ID</th><th>Date</th><th>Status</th><th>Total</th><th></th></tr></thead>
                <tbody>
                  <tr v-for="o in orders" :key="o.id">
                    <td class="text-cream">#{{ o.id }}</td>
                    <td class="text-muted">{{ formatDate(o.created_at) }}</td>
                    <td><span class="badge" :class="statusBadge(o.status)">{{ o.status }}</span></td>
                    <td class="text-cream">{{ formatPrice(o.total_amount) }}</td>
                    <td><RouterLink :to="`/orders/${o.id}`" class="btn btn-sm btn-outline-gold">View</RouterLink></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Rentals Tab -->
          <div v-if="activeTab === 'rentals'" class="card profile-card p-4">
            <h5 class="text-cream mb-4">My Rentals</h5>
            <LoadingSpinner v-if="rentalsLoading" height="200px" />
            <div v-else-if="rentals.length === 0" class="text-center py-4 text-muted">No active rentals.</div>
            <div v-else class="table-responsive">
              <table class="table table-dark table-hover mb-0">
                <thead><tr><th>Item</th><th>Start Date</th><th>End Date</th><th>Status</th></tr></thead>
                <tbody>
                  <tr v-for="r in rentals" :key="r.id">
                    <td class="text-cream">{{ r.product?.name || 'Item' }}</td>
                    <td class="text-muted">{{ formatDate(r.start_date) }}</td>
                    <td class="text-muted">{{ formatDate(r.end_date) }}</td>
                    <td><span class="badge" :class="statusBadge(r.status)">{{ r.status }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Payments Tab -->
          <div v-if="activeTab === 'payments'" class="card profile-card p-4">
            <h5 class="text-cream mb-4">Payment History</h5>
            <LoadingSpinner v-if="paymentsLoading" height="200px" />
            <div v-else-if="payments.length === 0" class="text-center py-4 text-muted">No payments found.</div>
            <div v-else class="table-responsive">
              <table class="table table-dark table-hover mb-0">
                <thead><tr><th>Date</th><th>Method</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  <tr v-for="p in payments" :key="p.id">
                    <td class="text-muted">{{ formatDate(p.created_at) }}</td>
                    <td class="text-cream text-capitalize">{{ p.payment_method }}</td>
                    <td class="text-cream">{{ formatPrice(p.amount) }}</td>
                    <td><span class="badge" :class="statusBadge(p.status)">{{ p.status }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Wishlist Tab -->
          <div v-if="activeTab === 'wishlist'" class="card profile-card p-4">
            <h5 class="text-cream mb-4">My Wishlist</h5>
            <LoadingSpinner v-if="wishlistLoading" height="200px" />
            <div v-else-if="wishlist.items.length === 0" class="text-center py-4 text-muted">Your wishlist is empty.</div>
            <div v-else class="row g-3">
              <div class="col-6 col-md-4" v-for="item in wishlist.items" :key="item.id">
                <ProductCard :product="item.product || item" />
              </div>
            </div>
          </div>

          <!-- Notifications Tab -->
          <div v-if="activeTab === 'notifications'" class="card profile-card p-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h5 class="text-cream mb-0">Notifications</h5>
              <button class="btn btn-sm btn-outline-gold" @click="notificationStore.markAllRead()" v-if="notificationStore.hasUnread">Mark all as read</button>
            </div>
            <div v-if="notificationStore.items.length === 0" class="text-center py-4 text-muted">No notifications.</div>
            <div v-else class="d-flex flex-column gap-2">
              <div v-for="n in notificationStore.items" :key="n.id" 
                   class="p-3 rounded" 
                   :class="n.read_at ? 'bg-transparent' : ''" 
                   style="background: rgba(255,255,255,0.02); border: 1px solid var(--navy-border);"
                   @click="notificationStore.markRead(n.id)">
                <p class="text-cream mb-1" :class="{ 'fw-bold': !n.read_at }">{{ n.message || n.title }}</p>
                <small class="text-muted">{{ formatDate(n.created_at) }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useWishlistStore } from '@/stores/wishlist'
import { useNotificationStore } from '@/stores/notifications'
import { userService, paymentService } from '@/services/api'
import { useToast } from 'vue-toastification'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import ProductCard from '@/components/ui/ProductCard.vue'

const router = useRouter()
const auth = useAuthStore()
const wishlist = useWishlistStore()
const notificationStore = useNotificationStore()
const toast = useToast()

const activeTab = ref('profile')
const profileSuccess = ref(false)
const orders = ref([])
const rentals = ref([])
const payments = ref([])
const ordersLoading = ref(false)
const rentalsLoading = ref(false)
const paymentsLoading = ref(false)
const wishlistLoading = ref(false)

const tabs = [
  { key: 'profile',       label: 'Profile',       icon: 'bi bi-person' },
  { key: 'orders',        label: 'Orders',        icon: 'bi bi-bag' },
  { key: 'rentals',       label: 'Rentals',       icon: 'bi bi-clock-history' },
  { key: 'payments',      label: 'Payments',      icon: 'bi bi-credit-card' },
  { key: 'wishlist',      label: 'Wishlist',      icon: 'bi bi-heart' },
  { key: 'notifications', label: 'Notifications', icon: 'bi bi-bell' },
]

const initials = computed(() =>
  (auth.fullName || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U'
)

const profileForm = reactive({
  name: '',
  email: '',
  phone: '',
  city: '',
  address: '',
  password: '',
  password_confirmation: ''
})

// FIX: Watch auth.user and populate the form once the data arrives from the backend
watch(() => auth.user, (newUser) => {
  if (newUser) {
    profileForm.name = newUser.name || ''
    profileForm.email = newUser.email || ''
    profileForm.phone = newUser.phone || ''
    profileForm.city = newUser.city || ''
    profileForm.address = newUser.address || ''
  }
}, { immediate: true })

function formatPrice(v) { return new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(v || 0) }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-EG', { year:'numeric', month:'short', day:'numeric' }) : '' }
function statusBadge(s) {
  const m = { pending:'bg-warning text-dark', processing:'bg-info text-dark', completed:'bg-success', cancelled:'bg-danger', active:'bg-success', returned:'bg-secondary', overdue:'bg-danger', paid:'bg-success' }
  return m[s] || 'bg-secondary'
}

async function saveProfile() {
  const payload = {
    name: profileForm.name,
    email: profileForm.email,
    phone: profileForm.phone,
    city: profileForm.city,
    address: profileForm.address,
  }
  if (profileForm.password) {
    payload.password = profileForm.password
    payload.password_confirmation = profileForm.password_confirmation
  }
  const res = await auth.updateProfile(payload)
  if (res.success) {
    profileSuccess.value = true
    profileForm.password = ''
    profileForm.password_confirmation = ''
    setTimeout(() => profileSuccess.value = false, 3000)
  } else {
    toast.error(res.message)
  }
}

watch(activeTab, async tab => {
  if (tab === 'orders' && orders.value.length === 0) {
    ordersLoading.value = true
    try { const r = await userService.getOrders(auth.user.id); orders.value = r.data?.data || r.data || [] } catch (_) {} finally { ordersLoading.value = false }
  }
  if (tab === 'rentals' && rentals.value.length === 0) {
    rentalsLoading.value = true
    try { const r = await userService.getRentals(auth.user.id); rentals.value = r.data?.data || r.data || [] } catch (_) {} finally { rentalsLoading.value = false }
  }
  if (tab === 'payments' && payments.value.length === 0) {
    paymentsLoading.value = true
    try { const r = await paymentService.getAll({ user_id: auth.user.id }); payments.value = r.data?.data || r.data || [] } catch (_) {} finally { paymentsLoading.value = false }
  }
  if (tab === 'wishlist') {
    wishlistLoading.value = true
    await wishlist.fetchWishlist()
    wishlistLoading.value = false
  }
  if (tab === 'notifications') {
    await notificationStore.fetchAll()
  }
})
</script>

<style scoped>
.profile-card { background: var(--navy-card); border: 1px solid var(--navy-border); border-radius: 1rem; }
.avatar-circle { width: 60px; height: 60px; border-radius: 50%; background: var(--gold); color: var(--navy-bg); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem; }
.nav-pills .nav-link { color: var(--text-muted); background: transparent; border-radius: 0.5rem; }
.nav-pills .nav-link:hover { color: var(--cream); background: rgba(255,255,255,0.05); }
.nav-pills .nav-link.active { color: var(--navy-bg); background: var(--gold); font-weight: 600; }
.table-dark { --bs-table-bg: transparent; --bs-table-border-color: var(--navy-border); }
</style>