<template>
  <nav class="mobile-bottom-nav d-lg-none">
    <RouterLink 
      v-for="item in navItems" 
      :key="item.path" 
      :to="item.path" 
      class="nav-item" 
      :class="{ active: isActive(item.path) }"
    >
      <i :class="item.icon"></i>
      <span>{{ item.label }}</span>
      <span v-if="item.badge && item.badge > 0" class="nav-badge">{{ item.badge > 9 ? '9+' : item.badge }}</span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { useNotificationStore } from '@/stores/notifications'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const cart = useCartStore()
const wishlist = useWishlistStore()
const notifications = useNotificationStore()
const auth = useAuthStore()

// FIX 1: Use startsWith for nested route matching
function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path === path || route.path.startsWith(path + '/')
}

const navItems = computed(() => [
  { path: '/', label: 'Home', icon: 'bi bi-house-door' },
  { path: '/products', label: 'Shop', icon: 'bi bi-grid' },
  { path: '/cart', label: 'Cart', icon: 'bi bi-bag', badge: cart.totalItems },
  { path: '/wishlist', label: 'Wishlist', icon: 'bi bi-heart', badge: wishlist.count },
  { path: auth.isAuthenticated ? '/profile' : '/login', label: 'Profile', icon: 'bi bi-person-circle' }
])
</script>

<style scoped>
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--navy-card);
  border-top: 1px solid var(--navy-border);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0.5rem 0;
  /* FIX 2: High z-index to prevent overlap with other UI elements */
  z-index: 1040; 
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.2);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: var(--text-muted);
  font-size: 0.7rem;
  position: relative;
  transition: color 0.2s;
  padding: 0.25rem 0.5rem;
}

.nav-item i {
  font-size: 1.25rem;
  margin-bottom: 0.1rem;
}

.nav-item.active {
  color: var(--gold);
}

.nav-badge {
  position: absolute;
  top: -2px;
  right: 0px;
  background: var(--gold);
  color: var(--navy-bg);
  font-size: 0.6rem;
  font-weight: bold;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>