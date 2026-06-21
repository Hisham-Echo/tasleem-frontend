import { defineStore } from 'pinia'
import { wishlistService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    items: [],
    loading: false
  }),
  
  getters: {
    isInWishlist: (state) => (productId) => {
      return state.items.some(item => item.product_id === productId)
    },
    count: (state) => state.items.length // FIX 1: Added missing count getter
  },
  
  actions: {
    async fetchWishlist() {
      const auth = useAuthStore()
      if (!auth.user?.id) return
      try {
        const res = await wishlistService.getAll({ user_id: auth.user.id })
        this.items = res.data?.data || []
      } catch (error) {
        console.error('Fetch wishlist error:', error)
        this.items = []
      }
    },
    
    async toggle(productId) {
      const auth = useAuthStore()
      if (!auth.user?.id) return { needsAuth: true }
      
      try {
        const checkRes = await wishlistService.check({ 
          user_id: auth.user.id, 
          product_id: productId 
        })
        const exists = checkRes.data?.data?.exists || checkRes.data?.exists
        
        if (exists) {
          const allRes = await wishlistService.getAll({ user_id: auth.user.id })
          const items = allRes.data?.data || []
          const item = items.find(i => i.product_id === productId)
          if (item) {
            await wishlistService.remove(item.wishlist_id || item.id)
          }
          await this.fetchWishlist()
          return { success: true, added: false }
        } else {
          await wishlistService.add({ 
            user_id: auth.user.id, 
            product_id: productId 
          })
          await this.fetchWishlist()
          return { success: true, added: true }
        }
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) return { needsAuth: true }
        return { 
          success: false, 
          message: error.response?.data?.message || 'Failed to update wishlist'
        }
      }
    },

    // FIX 2: Added missing remove action
    async remove(itemId) {
      try {
        await wishlistService.remove(itemId)
        // Optimistically update UI
        this.items = this.items.filter(i => (i.wishlist_id || i.id) !== itemId)
        return { success: true }
      } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Failed to remove from wishlist' }
      }
    }
  }
})