import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cartService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

export const useCartStore = defineStore('cart', () => {
  const items    = ref([])
  const loading  = ref(false)
  const open     = ref(false)
  // Track which item IDs are currently being updated (for per-item spinner)
  const updating = ref(new Set())

  // ── Computed ─────────────────────────────────────────────────
  const totalItems = computed(() =>
    items.value.reduce((sum, i) => sum + (i.quantity || 1), 0)
  )

  // FIX: was summing i.price without × quantity
  // item.price = unit price; total = unit price × quantity
  const totalPrice = computed(() =>
    items.value.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0)
  )

  const isEmpty = computed(() => items.value.length === 0)

  function isUpdating(id) {
    return updating.value.has(id)
  }

  // ── Fetch ─────────────────────────────────────────────────────
  async function fetchCart() {
    const auth = useAuthStore()
    if (!auth.isAuthenticated) { items.value = []; return }
    try {
      const res = await cartService.get()
      const purchases = res.data?.items        || []
      const rentals   = res.data?.rental_items || []
      items.value = [...purchases, ...rentals]
    } catch (_) {
      items.value = []
    }
  }

  // ── Add ───────────────────────────────────────────────────────
  async function addItem(productId, quantity = 1) {
    loading.value = true
    try {
      await cartService.addItem({ product_id: productId, quantity })
      await fetchCart()
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to add item' }
    } finally {
      loading.value = false
    }
  }

  async function addRental(productId, startDate, endDate) {
    loading.value = true
    try {
      await cartService.addRental({ product_id: productId, start_date: startDate, end_date: endDate })
      await fetchCart()
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to add rental' }
    } finally {
      loading.value = false
    }
  }

  // ── Update quantity ───────────────────────────────────────────
  async function updateItem(id, quantity) {
    // If quantity drops to 0, remove the item entirely
    if (quantity < 1) {
      return removeItem(id)
    }

    // Mark this item as updating
    updating.value = new Set([...updating.value, id])

    // FIX: optimistic update — change quantity immediately so UI responds instantly
    const item = items.value.find(i => i.id === id)
    const prevQty = item?.quantity
    if (item) item.quantity = quantity

    try {
      await cartService.updateItem(id, { quantity })
      // Sync with backend to get accurate price/totals
      await fetchCart()
    } catch (_) {
      // Roll back optimistic update on failure
      if (item && prevQty !== undefined) item.quantity = prevQty
    } finally {
      const next = new Set(updating.value)
      next.delete(id)
      updating.value = next
    }
  }

  // ── Remove ────────────────────────────────────────────────────
  async function removeItem(id) {
    // Optimistic: remove from list immediately
    const prev = [...items.value]
    items.value = items.value.filter(i => i.id !== id)
    try {
      await cartService.removeItem(id)
    } catch (_) {
      // Roll back on failure
      items.value = prev
    }
  }

  // ── Clear ─────────────────────────────────────────────────────
  async function clearCart() {
    const auth = useAuthStore()
    const prev = [...items.value]
    items.value = []
    try {
      await cartService.clear(auth.user?.id)
    } catch (_) {
      items.value = prev
    }
  }

  function openCart()  { open.value = true  }
  function closeCart() { open.value = false }

  return {
    items, loading, open,
    totalItems, totalPrice, isEmpty,
    isUpdating,
    fetchCart, addItem, addRental, updateItem, removeItem, clearCart,
    openCart, closeCart,
  }
})
