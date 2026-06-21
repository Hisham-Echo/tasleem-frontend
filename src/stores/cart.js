import { defineStore } from 'pinia'
import { cartService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    isOpen: false,
    loading: false,
    updatingIds: [] // FIX 2: Track which items are currently updating
  }),
  
  getters: {
    totalItems: (state) => state.items.reduce((sum, item) => sum + (item.quantity || 0), 0),
    totalPrice: (state) => state.items.reduce((sum, item) => sum + (item.product?.price || item.price || 0) * (item.quantity || 0), 0),
    isEmpty: (state) => state.items.length === 0, // FIX 1: Added missing getter
    isUpdating: (state) => (id) => state.updatingIds.includes(id) // FIX 2: Added missing getter
  },
  
  actions: {
    async fetchCart() {
      const auth = useAuthStore()
      if (!auth.user?.id) return
      try {
        const res = await cartService.get({ user_id: auth.user.id })
        this.items = res.data?.data || []
      } catch (error) {
        console.error('Fetch cart error:', error)
        this.items = []
      }
    },
    
    async addItem(productData) {
      const auth = useAuthStore()
      if (!auth.user?.id) return { success: false, message: 'Not authenticated' }
      try {
        const res = await cartService.addItem({ 
          ...productData, 
          user_id: auth.user.id 
        })
        await this.fetchCart()
        return { success: true, data: res.data }
      } catch (error) {
        console.error('Add item error:', error)
        return { 
          success: false, 
          message: error.response?.data?.message || 'Failed to add to cart'
        }
      }
    },
    
    async addRental(rentalData) {
      const auth = useAuthStore()
      if (!auth.user?.id) return { success: false, message: 'Not authenticated' }
      try {
        const res = await cartService.addItem({ 
          ...rentalData, 
          user_id: auth.user.id,
          item_type: 'rental'
        })
        await this.fetchCart()
        return { success: true, data: res.data }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Failed to add rental'
        }
      }
    },

    // FIX 2: Added missing updateItem action
    async updateItem(itemId, quantity) {
      if (quantity < 1) {
        return this.removeItem(itemId)
      }
      this.updatingIds = [...this.updatingIds, itemId]
      try {
        await cartService.updateItem(itemId, { quantity })
        await this.fetchCart()
      } catch (error) {
        console.error('Update item error:', error)
      } finally {
        this.updatingIds = this.updatingIds.filter(id => id !== itemId)
      }
    },
    
    async removeItem(itemId) {
      try {
        await cartService.removeItem(itemId)
        await this.fetchCart()
        return { success: true }
      } catch (error) {
        return { success: false, message: error.message }
      }
    },
    
    // FIX 3: Renamed from clear() to clearCart() to match view calls
    async clearCart() {
      const auth = useAuthStore()
      try {
        await cartService.clear(auth.user?.id)
        this.items = []
        return { success: true }
      } catch (error) {
        return { success: false, message: error.message }
      }
    },
    
    openCart() { this.isOpen = true },
    closeCart() { this.isOpen = false },
    toggleCart() { this.isOpen = !this.isOpen }
  }
})