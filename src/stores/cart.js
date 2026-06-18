import { defineStore } from 'pinia'
import { cartService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    isOpen: false,
    loading: false
  }),
  
  getters: {
    totalItems: (state) => state.items.reduce((sum, item) => sum + (item.quantity || 0), 0),
    totalPrice: (state) => state.items.reduce((sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0), 0),
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
    
    async removeItem(itemId) {
      try {
        await cartService.removeItem(itemId)
        await this.fetchCart()
        return { success: true }
      } catch (error) {
        return { success: false, message: error.message }
      }
    },
    
    async clear() {
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