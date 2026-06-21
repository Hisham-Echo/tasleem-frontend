import axios from 'axios'
import router from '@/router' // FIX: Import router for SPA navigation

const api = axios.create({
  baseURL: 'https://tasleembackendapifinal-production.up.railway.app/api/v1',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('tasleem_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tasleem_token')
      localStorage.removeItem('tasleem_user')
      
      // FIX: Use router for SPA navigation instead of full page reload
      if (router.currentRoute.value.name !== 'Login') {
        router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } })
      }
    }
    return Promise.reject(error)
  }
)

// ─────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────
export const authService = {
  login: (credentials) => api.post('/login', credentials),
  register: (data) => api.post('/register', data),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
  forgotPassword: (data) => api.post('/forgot-password', data),
  resetPassword: (data) => api.post('/reset-password', data),
  resendVerification: () => api.post('/resend-verification'),
}

// ─────────────────────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────────────────────
export const userService = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getProducts: (userId, params) => api.get(`/users/${userId}/products`, { params }),
  getOrders: (userId, params) => api.get(`/users/${userId}/orders`, { params }),
  getRentals: (userId, params) => api.get(`/users/${userId}/rentals`, { params }),
}

// ─────────────────────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────────────────────
export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getByIds: (ids) => api.get('/products', { params: { ids: ids.join(',') } }),
  create: (data) => api.post('/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
}

// ─────────────────────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────────────────────
export const categoryService = {
  getAll: (params) => api.get('/categories', { params }),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
}

// ─────────────────────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────────────────────
export const orderService = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
}

// ─────────────────────────────────────────────────────────────
// Rentals
// ─────────────────────────────────────────────────────────────
export const rentalService = {
  getAll: (params) => api.get('/rentals', { params }),
  getById: (id) => api.get(`/rentals/${id}`),
  create: (data) => api.post('/rentals', data),
  update: (id, data) => api.put(`/rentals/${id}`, data),
}

// ─────────────────────────────────────────────────────────────
// Reviews
// ─────────────────────────────────────────────────────────────
export const reviewService = {
  getAll: (params) => api.get('/reviews', { params }),
  getByProduct: (productId) => api.get('/reviews', { params: { product_id: productId } }),
  getById: (id) => api.get(`/reviews/${id}`),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
}

// ─────────────────────────────────────────────────────────────
// Payments
// ─────────────────────────────────────────────────────────────
export const paymentService = {
  getAll: (params) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
}

// ─────────────────────────────────────────────────────────────
// Cart
// ─────────────────────────────────────────────────────────────
export const cartService = {
  get: (params) => api.get('/cart', { params }),
  addItem: (data) => api.post('/cart', data),
  updateItem: (id, data) => api.put(`/cart/${id}`, data),
  removeItem: (id) => api.delete(`/cart/${id}`),
  clear: (userId) => api.delete(`/cart/clear/${userId}`),
}

// ─────────────────────────────────────────────────────────────
// Recommendations (Database-driven AI)
// ─────────────────────────────────────────────────────────────
export const recommendationService = {
  getAll: (params) => api.get('/recommendations', { params }),
  getById: (id) => api.get(`/recommendations/${id}`),
  create: (data) => api.post('/recommendations', data),
  update: (id, data) => api.put(`/recommendations/${id}`, data),
  delete: (id) => api.delete(`/recommendations/${id}`),
}

// ─────────────────────────────────────────────────────────────
// Logs
// ─────────────────────────────────────────────────────────────
export const logService = {
  getAll: (params) => api.get('/logs', { params }),
  getById: (id) => api.get(`/logs/${id}`),
  getForEntity: (entityType, entityId) => api.get(`/logs/entity/${entityType}/${entityId}`),
  getStats: () => api.get('/logs/stats'),
}

// ─────────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────────
export const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  getById: (id) => api.get(`/notifications/${id}`),
  markAsRead: (id) => api.post(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  delete: (id) => api.delete(`/notifications/${id}`),
}

// ─────────────────────────────────────────────────────────────
// AI Service (Mapped to standard endpoints)
// ─────────────────────────────────────────────────────────────
export const aiService = {
  search: (query, limit = 20) => api.get('/products', { params: { search: query, per_page: limit } }),
  trending: (limit = 10) => api.get('/products', { params: { sort_by: 'view_count', sort_order: 'desc', per_page: limit } }),
  explore: (limit = 10) => api.get('/products', { params: { sort_by: 'created_at', sort_order: 'desc', per_page: limit } }),
  similar: (productId, limit = 10) => api.get('/products', { params: { similar_to: productId, per_page: limit } }),
  forUser: (userId, limit = 10) => api.get('/recommendations', { params: { user_id: userId, per_page: limit } }),
  sentiment: () => Promise.resolve({ data: { data: null } }),
  bundle: () => Promise.resolve({ data: { data: { products: [] } } }),
}

// ─────────────────────────────────────────────────────────────
// Wishlist
// ─────────────────────────────────────────────────────────────
export const wishlistService = {
  getAll: (params) => api.get('/wishlist', { params }),
  add: (data) => api.post('/wishlist', data),
  remove: (id) => api.delete(`/wishlist/${id}`),
  clear: (userId) => api.delete(`/wishlist/clear/${userId}`),
  check: (params) => api.get('/wishlist/check', { params }),
}

// ─────────────────────────────────────────────────────────────
// Product Images
// ─────────────────────────────────────────────────────────────
export const imageService = {
  getAll: (productId) => api.get(`/products/${productId}/images`),
  getById: (id) => api.get(`/product-images/${id}`),
  upload: (formData) => api.post('/product-images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadSingle: (formData) => api.post('/product-images/upload-single', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/product-images/${id}`, data),
  delete: (id) => api.delete(`/product-images/${id}`),
  deleteMultiple: (imageIds) => api.delete('/product-images/delete-multiple', { data: { image_ids: imageIds } }),
  addFromUrl: (data) => api.post('/product-images/add-from-url', data),
}

export default api