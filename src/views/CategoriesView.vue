<template>
  <div>
    <div class="page-header">
      <div class="container">
        <h1 class="text-cream mb-0"><i class="bi bi-tags me-2 text-gold"></i>Categories</h1>
      </div>
    </div>

    <div class="container py-4">
      <LoadingSpinner v-if="loading" height="300px" />
      
      <div v-else-if="categories.length === 0" class="text-center py-5">
        <i class="bi bi-folder-x text-muted" style="font-size: 4rem;"></i>
        <h4 class="text-muted mt-3">No categories found</h4>
      </div>

      <div v-else class="row g-4">
        <div class="col-6 col-md-4 col-lg-3" v-for="cat in categories" :key="cat.id">
          <RouterLink :to="`/products?category_id=${cat.id}`" class="category-card text-decoration-none h-100">
            <div class="category-icon-wrap">
              <i :class="cat.icon || 'bi bi-grid-3x3-gap-fill'" class="text-gold"></i>
            </div>
            <h5 class="text-cream mb-1">{{ cat.name }}</h5>
            <p class="text-muted mb-0" style="font-size: .85rem;">
              {{ cat.products_count || 0 }} Products
            </p>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { categoryService } from '@/services/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const categories = ref([])
const loading = ref(true)

async function fetchCategories() {
  loading.value = true
  try {
    const res = await categoryService.getAll()
    categories.value = res.data?.data || res.data || []
  } catch (error) {
    console.error('Fetch categories error:', error)
    categories.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchCategories)
</script>

<style scoped>
.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem 1rem;
  background: var(--navy-card);
  border: 1px solid var(--navy-border);
  border-radius: 1rem;
  transition: all 0.3s ease;
}

.category-card:hover {
  border-color: var(--gold);
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.category-icon-wrap {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: rgba(212, 175, 55, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.category-icon-wrap i {
  font-size: 2rem;
}
</style>