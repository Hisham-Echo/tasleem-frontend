import axios from 'axios'

const api = axios.create({
  baseURL: 'https://tasleembackendapifinal-production.up.railway.app/api/v1',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tasleem_token')
      localStorage.removeItem('tasleem_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) =>
    api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
}

// ─────────────────────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────────────────────
export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
  getMyProducts: (params) => api.get('/users/my-products', { params }),
  getMyOrders: (params) => api.get('/users/my-orders', { params }),
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
  update: (id, data) => api.put(`/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/products/${id}`),
  similar: (id, limit = 10) => api.get(`/products/${id}/similar`, { params: { limit } }),
  uploadImage: (productId, formData) =>
    api.post(`/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
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
// Reviews
// ─────────────────────────────────────────────────────────────
export const reviewService = {
  getAll: (params) => api.get('/reviews', { params }),
  getById: (id) => api.get(`/reviews/${id}`),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  getByProduct: (productId) => api.get(`/products/${productId}/reviews`),
}

// ─────────────────────────────────────────────────────────────
// Cart
// ─────────────────────────────────────────────────────────────
export const cartService = {
  get: () => api.get('/cart'),
  addItem: (data) => api.post('/cart', data),
  updateItem: (id, data) => api.put(`/cart/${id}`, data),
  removeItem: (id) => api.delete(`/cart/${id}`),
  clear: () => api.delete('/cart/clear'),
  addRental: (data) => api.post('/cart', data),
}

// ─────────────────────────────────────────────────────────────
// Wishlist
// ─────────────────────────────────────────────────────────────
export const wishlistService = {
  get: () => api.get('/wishlist'),
  add: (productId) => api.post('/wishlist', { product_id: productId }),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
  toggle: (productId) => api.post('/wishlist/toggle', { product_id: productId }),
  check: (productId) => api.get('/wishlist/check', { params: { product_id: productId } }),
}

// ─────────────────────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────────────────────
export const orderService = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
  complete: (id) => api.post(`/orders/${id}/complete`),
}

// ─────────────────────────────────────────────────────────────
// Rentals
// ─────────────────────────────────────────────────────────────
export const rentalService = {
  getAll: (params) => api.get('/rentals', { params }),
  getById: (id) => api.get(`/rentals/${id}`),
  create: (data) => api.post('/rentals', data),
  update: (id, data) => api.put(`/rentals/${id}`, data),
  approve: (id) => api.post(`/rentals/${id}/approve`),
  reject: (id) => api.post(`/rentals/${id}/reject`),
  complete: (id) => api.post(`/rentals/${id}/complete`),
}

// ─────────────────────────────────────────────────────────────
// Payments
// ─────────────────────────────────────────────────────────────
export const paymentService = {
  getAll: (params) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
  process: (id, data) => api.post(`/payments/${id}/process`, data),
}

// ─────────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────────
export const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.post(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
}

// ─────────────────────────────────────────────────────────────
// AI Recommendations
// ─────────────────────────────────────────────────────────────
export const aiService = {
  forUser: (userId, limit = 10) =>
    api.get('/ai/recommendations', { params: { user_id: userId, limit } }),
  trending: (limit = 10) =>
    api.get('/ai/trending', { params: { limit } }),
  explore: (limit = 10) =>
    api.get('/ai/explore', { params: { limit } }),
  similar: (productId, limit = 10) =>
    api.get(`/ai/similar/${productId}`, { params: { limit } }),
  search: (query, limit = 20) =>
    api.get('/ai/search', { params: { q: query, limit } }),
  sentiment: (productId) =>
    api.get(`/ai/sentiment/${productId}`),
  bundle: (productId, limit = 5) =>
    api.get(`/ai/bundle/${productId}`, { params: { limit } }),
}

// ─────────────────────────────────────────────────────────────
// Product Images
// ─────────────────────────────────────────────────────────────
export const imageService = {
  getAll: (productId) => api.get(`/products/${productId}/images`),
  upload: (productId, formData) =>
    api.post(`/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  delete: (id) => api.delete(`/product-images/${id}`),
  update: (id, data) => api.put(`/product-images/${id}`, data),
}

// ─────────────────────────────────────────────────────────────
// Admin
// ─────────────────────────────────────────────────────────────
export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getProducts: (params) => api.get('/admin/products', { params }),
  getOrders: (params) => api.get('/admin/orders', { params }),
  getLogs: (params) => api.get('/admin/logs', { params }),
  approveProduct: (id) => api.post(`/admin/products/${id}/approve`),
  rejectProduct: (id, data) => api.post(`/admin/products/${id}/reject`, data),
}

export default api