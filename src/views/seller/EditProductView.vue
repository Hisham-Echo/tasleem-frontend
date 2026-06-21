<template>
  <div>
    <div class="page-header">
      <div class="container">
        <h1 class="text-cream mb-0"><i class="bi bi-pencil-square me-2 text-gold"></i>Edit Product</h1>
      </div>
    </div>
    <div class="container py-4">
      <LoadingSpinner v-if="pageLoading" height="300px" />
      <div v-else-if="!product" class="text-center py-5">
        <h4 class="text-muted">Product not found.</h4>
        <RouterLink to="/seller" class="btn btn-gold mt-2">Back to Dashboard</RouterLink>
      </div>
      <div v-else class="card form-card p-4">
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

            <!-- Existing Images -->
            <div class="col-12" v-if="existingImages.length > 0">
              <h5 class="text-cream mb-3">Current Images</h5>
              <div class="d-flex gap-2 flex-wrap">
                <div v-for="(img, index) in existingImages" :key="index" class="position-relative">
                  <img :src="img.url" class="rounded" style="width: 80px; height: 80px; object-fit: cover;" />
                  <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0" @click="removeExistingImage(index)">
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- New Images -->
            <div class="col-12">
              <h5 class="text-cream mb-3">Add New Images</h5>
              <input type="file" class="form-control" multiple accept="image/*" @change="handleFileUpload" />
              <div class="d-flex gap-2 flex-wrap mt-3" v-if="newPreviews.length > 0">
                <div v-for="(img, index) in newPreviews" :key="index" class="position-relative">
                  <img :src="img" class="rounded" style="width: 80px; height: 80px; object-fit: cover;" />
                  <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0" @click="removeNewImage(index)">
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
                Update Product
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
import { useRouter, useRoute } from 'vue-router'
import { productService, categoryService } from '@/services/api'
import { useToast } from 'vue-toastification'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const product = ref(null)
const categories = ref([])
const pageLoading = ref(true)
const loading = ref(false)
const newFiles = ref([])
const newPreviews = ref([])
const existingImages = ref([])
const deletedImageIds = ref([])

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

// FIX 1 & 3: Fetch product data and categories on mount
async function fetchData() {
  pageLoading.value = true
  try {
    const [prodRes, catRes] = await Promise.all([
      productService.getById(route.params.id),
      categoryService.getAll()
    ])
    
    product.value = prodRes.data?.data || prodRes.data
    categories.value = catRes.data?.data || catRes.data || []
    
    // Populate form with existing data
    form.name = product.value.name || ''
    form.description = product.value.description || ''
    form.price = product.value.price || 0
    form.stock = product.value.stock || 0
    form.category_id = product.value.category_id || ''
    form.sku = product.value.sku || ''
    form.is_rentable = !!product.value.is_rentable
    form.daily_rental_price = product.value.daily_rental_price || 0
    
    // Populate existing images
    if (product.value.images && product.value.images.length > 0) {
      existingImages.value = product.value.images.map(img => {
        let url = img.image_url || img.url || img
        if (!url.startsWith('http')) url = `https://tasleembackendapifinal-production.up.railway.app/storage/${url}`
        return { id: img.id, url }
      })
    } else if (product.value.image) {
      let url = product.value.image
      if (!url.startsWith('http')) url = `https://tasleembackendapifinal-production.up.railway.app/storage/${url}`
      existingImages.value = [{ id: null, url }]
    }
  } catch (error) {
    toast.error('Failed to load product data')
    product.value = null
  } finally {
    pageLoading.value = false
  }
}

function handleFileUpload(e) {
  const selectedFiles = Array.from(e.target.files)
  newFiles.value = [...newFiles.value, ...selectedFiles]
  
  selectedFiles.forEach(file => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      newPreviews.value.push(ev.target.result)
    }
    reader.readAsDataURL(file)
  })
}

function removeNewImage(index) {
  newFiles.value.splice(index, 1)
  newPreviews.value.splice(index, 1)
}

function removeExistingImage(index) {
  const img = existingImages.value[index]
  if (img.id) {
    deletedImageIds.value.push(img.id)
  }
  existingImages.value.splice(index, 1)
}

async function handleSubmit() {
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

    // Append new images
    newFiles.value.forEach(file => {
      formData.append('images[]', file)
    })

    // Append deleted image IDs
    deletedImageIds.value.forEach(id => {
      formData.append('deleted_images[]', id)
    })

    // FIX 2: Laravel/PHP requires _method: PUT for multipart/form-data updates
    formData.append('_method', 'PUT')

    await productService.update(route.params.id, formData)
    toast.success('Product updated successfully!')
    router.push({ name: 'SellerDashboard' })
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to update product')
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.form-card { background: var(--navy-card); border: 1px solid var(--navy-border); border-radius: 1rem; }
</style>