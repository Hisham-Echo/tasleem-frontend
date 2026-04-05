import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { wishlistService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

export const useWishlistStore = defineStore('wishlist', () => {
  const items   = ref([])
  const loading = ref(false)

  // Map of product_id → wishlist item id (for removal)
  const itemMap = computed(() => {
    const m = {}
    items.value.forEach(i => { m[i.product_id || i.product?.id] = i.id })
    return m
  })

  const ids   = computed(() => Object.keys(itemMap.value).map(Number))
  const count = computed(() => items.value.length)

  function isInWishlist(productId) {
    return ids.value.includes(Number(productId))
  }

  async function fetchWishlist() {
    const auth = useAuthStore()
    if (!auth.isAuthenticated) { items.value = []; return }
    try {
      const res = await wishlistService.getAll()
      items.value = res.data?.data || res.data || []
    } catch (_) {
      items.value = []
    }
  }

  async function toggle(productId) {
    const auth = useAuthStore()
    if (!auth.isAuthenticated) return { needsAuth: true }
    loading.value = true
    try {
      if (isInWishlist(productId)) {
        // Remove using the wishlist item id (not product id)
        const wishlistItemId = itemMap.value[productId]
        await wishlistService.remove(wishlistItemId)
        items.value = items.value.filter(i => i.id !== wishlistItemId)
        return { added: false }
      } else {
        await wishlistService.add({ product_id: productId })
        await fetchWishlist()
        return { added: true }
      }
    } catch (err) {
      return { error: err.response?.data?.message }
    } finally {
      loading.value = false
    }
  }

  async function remove(productId) {
    const wishlistItemId = itemMap.value[productId]
    if (!wishlistItemId) return
    try {
      await wishlistService.remove(wishlistItemId)
      items.value = items.value.filter(i => i.id !== wishlistItemId)
    } catch (_) {}
  }

  async function clearAll() {
    const auth = useAuthStore()
    try {
      // ✅ Fixed: backend needs DELETE /wishlist/clear/{userId}
      await wishlistService.clear(auth.user?.id)
      items.value = []
    } catch (_) {
      items.value = []
    }
  }

  return { items, loading, ids, count, isInWishlist, fetchWishlist, toggle, remove, clearAll }
})
