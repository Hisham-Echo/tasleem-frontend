<template>
  <div>
    <div class="page-header">
      <div class="container">
        <h1 class="text-cream mb-0"><i class="bi bi-speedometer2 me-2 text-gold"></i>Admin Dashboard</h1>
      </div>
    </div>

    <div class="container py-4">
      <LoadingSpinner v-if="loading" height="300px" />

      <div v-else>
        <!-- Stats Cards -->
        <div class="row g-4 mb-4">
          <div class="col-md-6 col-xl-3" v-for="stat in statCards" :key="stat.label">
            <div class="card stat-card p-3 h-100">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-muted mb-1">{{ stat.label }}</h6>
                  <h3 class="text-cream mb-0">{{ stat.value }}</h3>
                </div>
                <i :class="stat.icon" class="text-gold" style="font-size: 2.5rem; opacity: 0.8;"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card admin-card p-4">
          <h5 class="text-cream mb-3">Quick Actions</h5>
          <div class="row g-3">
            <div class="col-md-4">
              <RouterLink to="/admin/users" class="btn btn-outline-gold w-100 py-3">
                <i class="bi bi-people me-2"></i>Manage Users
              </RouterLink>
            </div>
            <div class="col-md-4">
              <RouterLink to="/admin/logs" class="btn btn-outline-gold w-100 py-3">
                <i class="bi bi-journal-text me-2"></i>View System Logs
              </RouterLink>
            </div>
            <div class="col-md-4">
              <RouterLink to="/products" class="btn btn-outline-gold w-100 py-3">
                <i class="bi bi-box-seam me-2"></i>Browse All Products
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { logService } from '@/services/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const loading = ref(true)
const statsData = ref({
  total_users: 0,
  total_products: 0,
  total_orders: 0,
  total_revenue: 0
})

const statCards = computed(() => [
  { 
    label: 'Total Users', 
    value: statsData.value.total_users.toLocaleString(), 
    icon: 'bi bi-people-fill' 
  },
  { 
    label: 'Total Products', 
    value: statsData.value.total_products.toLocaleString(), 
    icon: 'bi bi-box-seam-fill' 
  },
  { 
    label: 'Total Orders', 
    value: statsData.value.total_orders.toLocaleString(), 
    icon: 'bi bi-bag-check-fill' 
  },
  { 
    label: 'Total Revenue', 
    value: formatPrice(statsData.value.total_revenue), 
    icon: 'bi bi-cash-stack' 
  }
])

function formatPrice(v) {
  return new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(v || 0)
}

async function fetchStats() {
  loading.value = true
  try {
    // FIX 1 & 2: Fetch real stats from the backend and handle errors gracefully
    const res = await logService.getStats()
    const data = res.data?.data || res.data || {}
    
    statsData.value = {
      total_users: data.total_users || 0,
      total_products: data.total_products || 0,
      total_orders: data.total_orders || 0,
      total_revenue: data.total_revenue || 0
    }
  } catch (error) {
    console.error('Fetch admin stats error:', error)
    // Keep default 0 values if API fails
  } finally {
    loading.value = false
  }
}

onMounted(fetchStats)
</script>

<style scoped>
.stat-card { background: var(--navy-card); border: 1px solid var(--navy-border); border-radius: 1rem; transition: transform 0.2s; }
.stat-card:hover { transform: translateY(-3px); }
.admin-card { background: var(--navy-card); border: 1px solid var(--navy-border); border-radius: 1rem; }
</style>