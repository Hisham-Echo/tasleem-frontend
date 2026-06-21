<template>
  <div>
    <div class="page-header">
      <div class="container">
        <h1 class="text-cream mb-0"><i class="bi bi-people me-2 text-gold"></i>Users Management</h1>
      </div>
    </div>

    <div class="container py-4">
      <div class="card admin-card p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h5 class="text-cream mb-0">All Users</h5>
          <div class="d-flex gap-2">
            <input type="text" class="form-control bg-dark border-secondary text-cream" placeholder="Search users..." v-model="searchQuery" @input="debouncedFetch" />
          </div>
        </div>

        <LoadingSpinner v-if="loading && users.length === 0" height="200px" />
        
        <div v-else-if="users.length === 0" class="text-center py-4 text-muted">
          No users found.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-dark table-hover mb-0 align-middle">
            <thead>
              <tr>
                <th class="text-muted">ID</th>
                <th class="text-muted">Name</th>
                <th class="text-muted">Email</th>
                <th class="text-muted">Role</th>
                <th class="text-muted">Status</th>
                <th class="text-muted">Joined</th>
                <th class="text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td class="text-cream">#{{ user.id }}</td>
                <td class="text-cream">{{ user.name }}</td>
                <td class="text-muted">{{ user.email }}</td>
                <td>
                  <span class="badge" :class="user.role === 'admin' ? 'bg-danger' : 'bg-info text-dark'">
                    {{ user.role }}
                  </span>
                </td>
                <td>
                  <span class="badge" :class="user.email_verified_at ? 'bg-success' : 'bg-warning text-dark'">
                    {{ user.email_verified_at ? 'Verified' : 'Unverified' }}
                  </span>
                </td>
                <td class="text-muted">{{ formatDate(user.created_at) }}</td>
                <td>
                  <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(user)" :disabled="user.role === 'admin'">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- FIX 1: Added Delete Confirmation Modal -->
    <div class="modal fade" :class="{ show: showDeleteModal }" :style="{ display: showDeleteModal ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="background: var(--navy-card); border: 1px solid var(--navy-border);">
          <div class="modal-header border-0">
            <h5 class="modal-title text-cream">Delete User?</h5>
            <button type="button" class="btn-close btn-close-white" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body text-muted">
            Are you sure you want to delete <strong class="text-cream">{{ userToDelete?.name }}</strong>? This action cannot be undone and will remove all their data.
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-outline-secondary" @click="showDeleteModal = false">Cancel</button>
            <button type="button" class="btn btn-danger" @click="deleteUser" :disabled="deleting">
              <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
              Yes, Delete User
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showDeleteModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { userService } from '@/services/api'
import { useToast } from 'vue-toastification'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const toast = useToast()

const users = ref([])
const loading = ref(true)
const searchQuery = ref('')
const showDeleteModal = ref(false)
const userToDelete = ref(null)
const deleting = ref(false)

let debounceTimer = null

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-EG', { year: 'numeric', month: 'short', day: 'numeric' }) : ''
}

async function fetchUsers() {
  loading.value = true
  try {
    const params = {}
    if (searchQuery.value) params.search = searchQuery.value
    
    const res = await userService.getAll(params)
    users.value = res.data?.data || res.data || []
  } catch (error) {
    console.error('Fetch users error:', error)
    users.value = []
  } finally {
    loading.value = false
  }
}

function debouncedFetch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    fetchUsers()
  }, 500)
}

function confirmDelete(user) {
  userToDelete.value = user
  showDeleteModal.value = true
}

async function deleteUser() {
  if (!userToDelete.value) return
  deleting.value = true
  try {
    await userService.delete(userToDelete.value.id)
    
    // FIX 2: Remove the user from the local array immediately to update the UI
    users.value = users.value.filter(u => u.id !== userToDelete.value.id)
    
    showDeleteModal.value = false
    userToDelete.value = null
    toast.success('User deleted successfully')
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to delete user')
  } finally {
    deleting.value = false
  }
}

onMounted(fetchUsers)
</script>

<style scoped>
.admin-card { background: var(--navy-card); border: 1px solid var(--navy-border); border-radius: 1rem; }
.table-dark { --bs-table-bg: transparent; --bs-table-border-color: var(--navy-border); }
</style>