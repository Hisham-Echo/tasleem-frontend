<template>
  <div>
    <div class="page-header">
      <div class="container">
        <h1 class="text-cream mb-0"><i class="bi bi-journal-text me-2 text-gold"></i>System Logs</h1>
      </div>
    </div>

    <div class="container py-4">
      <div class="card admin-card p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h5 class="text-cream mb-0">Activity Logs</h5>
          <select class="form-select bg-dark border-secondary text-cream" style="width: 200px;" v-model="filterLevel" @change="fetchLogs">
            <option value="">All Levels</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>

        <LoadingSpinner v-if="loading && logs.length === 0" height="200px" />
        
        <div v-else-if="logs.length === 0" class="text-center py-4 text-muted">
          No logs found.
        </div>

        <div v-else>
          <div class="table-responsive">
            <table class="table table-dark table-hover mb-0 align-middle">
              <thead>
                <tr>
                  <th class="text-muted">Date</th>
                  <th class="text-muted">Level</th>
                  <th class="text-muted">Message</th>
                  <th class="text-muted">User</th>
                  <th class="text-muted">Details</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in logs" :key="log.id">
                  <td class="text-muted" style="white-space: nowrap;">{{ formatDate(log.created_at) }}</td>
                  <td>
                    <span class="badge" :class="levelBadge(log.level)">{{ log.level }}</span>
                  </td>
                  <td class="text-cream">{{ log.message }}</td>
                  <td class="text-muted">{{ log.user?.name || 'System' }}</td>
                  <td>
                    <button class="btn btn-sm btn-outline-gold" @click="openDetails(log)" v-if="log.metadata">
                      <i class="bi bi-eye"></i>
                    </button>
                    <span v-else class="text-muted">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="d-flex justify-content-between align-items-center mt-4">
            <span class="text-muted">Page {{ currentPage }} of {{ totalPages }}</span>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-gold" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">Previous</button>
              <button class="btn btn-sm btn-outline-gold" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div class="modal fade" :class="{ show: showDetailsModal }" :style="{ display: showDetailsModal ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content" style="background: var(--navy-card); border: 1px solid var(--navy-border);">
          <div class="modal-header border-0">
            <h5 class="modal-title text-cream">Log Details</h5>
            <button type="button" class="btn-close btn-close-white" @click="showDetailsModal = false"></button>
          </div>
          <div class="modal-body">
            <pre class="text-cream p-3 rounded" style="background: rgba(0,0,0,0.3); max-height: 400px; overflow-y: auto;">{{ formattedMetadata }}</pre>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showDetailsModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { logService } from '@/services/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const logs = ref([])
const loading = ref(true)
const filterLevel = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const showDetailsModal = ref(false)
const formattedMetadata = ref('')

function formatDate(d) {
  return d ? new Date(d).toLocaleString('en-EG') : ''
}

function levelBadge(level) {
  const m = { info: 'bg-info text-dark', warning: 'bg-warning text-dark', error: 'bg-danger' }
  return m[level] || 'bg-secondary'
}

// FIX 1: Safe JSON parsing for log metadata
function openDetails(log) {
  try {
    let data = log.metadata
    if (typeof data === 'string') {
      data = JSON.parse(data)
    }
    formattedMetadata.value = JSON.stringify(data, null, 2)
  } catch (e) {
    formattedMetadata.value = log.metadata || 'No details available.'
  }
  showDetailsModal.value = true
}

async function fetchLogs() {
  loading.value = true
  try {
    const params = { page: currentPage.value, per_page: 20 }
    if (filterLevel.value) params.level = filterLevel.value
    
    const res = await logService.getAll(params)
    const data = res.data?.data || res.data || []
    logs.value = Array.isArray(data) ? data : []
    
    // FIX 2: Extract pagination meta data
    const meta = res.data?.meta || {}
    totalPages.value = meta.last_page || 1
  } catch (error) {
    console.error('Fetch logs error:', error)
    logs.value = []
  } finally {
    loading.value = false
  }
}

function changePage(page) {
  currentPage.value = page
  fetchLogs()
}

onMounted(fetchLogs)
</script>

<style scoped>
.admin-card { background: var(--navy-card); border: 1px solid var(--navy-border); border-radius: 1rem; }
.table-dark { --bs-table-bg: transparent; --bs-table-border-color: var(--navy-border); }
</style>