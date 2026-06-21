<template>
  <div>
    <div class="page-header">
      <div class="container">
        <h1 class="text-cream mb-0"><i class="bi bi-plus-circle me-2 text-gold"></i>Create Product</h1>
      </div>
    </div>
    <div class="container py-4">
      <div class="card form-card p-4">
        <form @submit.prevent="handleSubmit">
          <div class="row g-4">
            <!-- Basic Info -->
            <div class="col-md-8">
              <h5 class="text-cream mb-3">Basic Information</h5>
              <div class="mb-3">
                <label class="form-label text-muted">Product Name</label>
                <input type="text" class="form-control" v-model="form.name" required />
              </div>
              <div class="mb-3">
                <label class="form-label text-muted">Description</label>
                <textarea class="form-control" v-model="form.description" rows="4" required></textarea>
              </div>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label text-muted">Price (EGP)</label>
                  <input type="number" class="form-control" v-model.number="form.price" required min="0" step="0.01" />
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted">Stock Quantity</label>
                  <input type="number" class="form-control" v-model.number="form.stock" required min="0" />
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="col-md-4">
              <h5 class="text-cream mb-3">Details</h5>
              <div class="mb-3">
                <label class="form-label text-muted">Category</label>
                <select class="form-select" v-model="form.category_id" required>
                  <option value="" disabled>Select Category</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label text-muted">SKU (Optional)</label>
                <input type="text" class="form-control" v-model="form.sku" />
              </div>
              <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" v-model="form.is_rentable" id="isRentable" />
                <label class="form-check-label text-muted" for="isRentable">Available for Rent</label>
              </div>
              <div v-if="form.is_rentable" class="mb-3">
                <label class="form-label text-muted">Daily Rental Price (EGP)</label>
                <input type="number" class="form-control" v-model.number="form.daily_rental_price" min="0" step="0.01" />
              </div>
            </div>

            <!-- Images -->
            <div class="col-12">
              <h5 class="text-cream mb-3">Product Images</h5>
              <input type="file" class="form-control" multiple accept="image/*" @change="handleFileUpload" required />
              <div class="d-flex gap-2 flex-wrap mt-3" v-if="previews.length > 0">
                <div v-for="(img, index) in previews" :key="index" class="position-relative">
                  <img :src="img" class="rounded" style="width: 80px; height: 80px; object-fit: cover;" />
                  <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0" @click="removeImage(index)">
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="col-12 d-flex justify-content-end gap-2">
              <RouterLink to="/seller" class="btn btn-outline-secondary">Cancel</RouterLink>
              <button type="submit" class="btn btn-gold px-4" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                Create Product
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productService, categoryService } from '@/services/api'
import { useToast } from 'vue-toastification'

const router = useRouter()
const toast = useToast()

const categories = ref([])
const loading = ref(false)
const files = ref([])
const previews = ref([])

const form = reactive({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  category_id: '',
  sku: '',
  is_rentable: false,
  daily_rental_price: 0
})

// FIX 2: Fetch categories on mount so the dropdown isn't empty
async function fetchCategories() {
  try {
    const res = await categoryService.getAll()
    categories.value = res.data?.data || res.data || []
  } catch (_) {}
}

function handleFileUpload(e) {
  const selectedFiles = Array.from(e.target.files)
  files.value = [...files.value, ...selectedFiles]
  
  selectedFiles.forEach(file => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      previews.value.push(ev.target.result)
    }
    reader.readAsDataURL(file)
  })
}

function removeImage(index) {
  files.value.splice(index, 1)
  previews.value.splice(index, 1)
}

async function handleSubmit() {
  if (files.value.length === 0) {
    toast.error('Please upload at least one image.')
    return
  }

  loading.value = true
  try {
    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('description', form.description)
    formData.append('price', form.price)
    formData.append('stock', form.stock)
    formData.append('category_id', form.category_id)
    if (form.sku) formData.append('sku', form.sku)
    formData.append('is_rentable', form.is_rentable ? 1 : 0)
    if (form.is_rentable) formData.append('daily_rental_price', form.daily_rental_price)

    // FIX 1: Correctly append multiple files with the 'images[]' key for the backend
    files.value.forEach(file => {
      formData.append('images[]', file)
    })

    await productService.create(formData)
    toast.success('Product created successfully!')
    router.push({ name: 'SellerDashboard' })
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to create product')
  } finally {
    loading.value = false
  }
}

onMounted(fetchCategories)
</script>

<style scoped>
.form-card { background: var(--navy-card); border: 1px solid var(--navy-border); border-radius: 1rem; }
</style>