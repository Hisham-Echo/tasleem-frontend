<template>
  <nav v-if="totalPages > 1" aria-label="Page navigation" class="mt-4">
    <ul class="pagination justify-content-center gap-1">
      <!-- Previous -->
      <li class="page-item" :class="{ disabled: currentPage === 1 }">
        <button class="page-link" @click="$emit('change', currentPage - 1)" :disabled="currentPage === 1">
          <i class="bi bi-chevron-left"></i>
        </button>
      </li>
      
      <!-- Page numbers -->
      <li class="page-item" v-for="page in visiblePages" :key="page" :class="{ active: page === currentPage }">
        <button class="page-link" @click="$emit('change', page)">
          {{ page }}
        </button>
      </li>
      
      <!-- Next -->
      <li class="page-item" :class="{ disabled: currentPage === totalPages }">
        <button class="page-link" @click="$emit('change', currentPage + 1)" :disabled="currentPage === totalPages">
          <i class="bi bi-chevron-right"></i>
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true }
})

defineEmits(['change'])

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, props.currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(props.totalPages, start + maxVisible - 1)
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})
</script>

<style scoped>
.page-link {
  background: var(--navy-light);
  border: 1px solid var(--navy-border);
  color: var(--text-main);
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
}

.page-link:hover:not(:disabled) {
  background: var(--navy);
  border-color: var(--gold);
}

.page-item.active .page-link {
  background: var(--gold);
  border-color: var(--gold);
  color: var(--navy);
}

.page-item.disabled .page-link {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>