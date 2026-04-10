import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  timeout: 15000,
})

// ── Attach Bearer token ───────────────────────────────────────
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('tasleem_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  err => Promise.reject(err)
)

// ── Handle 401 globally ───────────────────────────────────────
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('tasleem_token')
      localStorage.removeItem('tasleem_user')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api

// ─────────────────────────────────────────────────────────────
// AUTH  POST /register  POST /login  POST /logout  GET /me
// Note: forgot-password / reset-password / verify-email are
//       NOT in this backend — those views are hidden in the UI.
// ─────────────────────────────────────────────────────────────
export const authService = {
  register: data => api.post('/register', data),
  login:    data => api.post('/login', data),
  logout:   ()   => api.post('/logout'),
  me:       ()   => api.get('/me'),
  // ⚠️ Not implemented in backend — kept as stubs so the views
  //    don't crash; they will show a "not available" message.
  forgotPassword:     () => Promise.reject(new Error('NOT_IMPLEMENTED')),
  resetPassword:      () => Promise.reject(new Error('NOT_IMPLEMENTED')),
  verifyEmail:        () => Promise.reject(new Error('NOT_IMPLEMENTED')),
  resendVerification: () => Promise.reject(new Error('NOT_IMPLEMENTED')),
}

// ─────────────────────────────────────────────────────────────
// USERS  — all routes match ✓
// GET    /users               GET    /users/{id}
// POST   /users               PUT    /users/{id}
// DELETE /users/{id}
// GET    /users/{id}/products
// GET    /users/{id}/orders
// GET    /users/{id}/rentals
// ─────────────────────────────────────────────────────────────
export const userService = {
  getAll:      params     => api.get('/users', { params }),
  getById:     id         => api.get(`/users/${id}`),
  create:      data       => api.post('/users', data),
  update:      (id, data) => api.put(`/users/${id}`, data),
  delete:      id         => api.delete(`/users/${id}`),
  getProducts: id         => api.get(`/users/${id}/products`),
  getOrders:   id         => api.get(`/users/${id}/orders`),
  getRentals:  id         => api.get(`/users/${id}/rentals`),
}

// ─────────────────────────────────────────────────────────────
// PRODUCTS
// GET    /products             GET    /products/{id}
// POST   /products             PUT    /products/{id}   ← real PUT (not POST+_method)
// DELETE /products/{id}
// GET    /products/{id}/similar  ← new endpoint
// ─────────────────────────────────────────────────────────────
export const productService = {
  getAll:   params     => api.get('/products', { params }),
  getById:  id         => api.get(`/products/${id}`),
  similar:  id         => api.get(`/products/${id}/similar`),
  create:   data       => api.post('/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  // ✅ Fixed: was POST (with _method=PUT hack) → now real PUT
  update:   (id, data) => api.put(`/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete:   id         => api.delete(`/products/${id}`),
}

// ─────────────────────────────────────────────────────────────
// CATEGORIES  — all routes match ✓
// ─────────────────────────────────────────────────────────────
export const categoryService = {
  getAll:  ()         => api.get('/categories'),
  getById: id         => api.get(`/categories/${id}`),
  create:  data       => api.post('/categories', data),
  update:  (id, data) => api.put(`/categories/${id}`, data),
  delete:  id         => api.delete(`/categories/${id}`),
}

// ─────────────────────────────────────────────────────────────
// ORDERS  — all routes match ✓
// ─────────────────────────────────────────────────────────────
export const orderService = {
  getAll:  params     => api.get('/orders', { params }),
  getById: id         => api.get(`/orders/${id}`),
  create:  data       => api.post('/orders', data),
  update:  (id, data) => api.put(`/orders/${id}`, data),
  cancel:  id         => api.put(`/orders/${id}`, { status: 'cancelled' }),
  delete:  id         => api.delete(`/orders/${id}`),
}

// ─────────────────────────────────────────────────────────────
// RENTALS  — all routes match ✓
// ─────────────────────────────────────────────────────────────
export const rentalService = {
  getAll:  params     => api.get('/rentals', { params }),
  getById: id         => api.get(`/rentals/${id}`),
  create:  data       => api.post('/rentals', data),
  update:  (id, data) => api.put(`/rentals/${id}`, data),
  return:  id         => api.put(`/rentals/${id}`, { status: 'returned' }),
  delete:  id         => api.delete(`/rentals/${id}`),
}

// ─────────────────────────────────────────────────────────────
// REVIEWS  — all routes match ✓
// ─────────────────────────────────────────────────────────────
export const reviewService = {
  getAll:  params     => api.get('/reviews', { params }),
  getById: id         => api.get(`/reviews/${id}`),
  create:  data       => api.post('/reviews', data),
  update:  (id, data) => api.put(`/reviews/${id}`, data),
  delete:  id         => api.delete(`/reviews/${id}`),
}

// ─────────────────────────────────────────────────────────────
// PAYMENTS  — all routes match ✓
// ─────────────────────────────────────────────────────────────
export const paymentService = {
  getAll:  params     => api.get('/payments', { params }),
  getById: id         => api.get(`/payments/${id}`),
  create:  data       => api.post('/payments', data),
  update:  (id, data) => api.put(`/payments/${id}`, data),
  delete:  id         => api.delete(`/payments/${id}`),
}

// ─────────────────────────────────────────────────────────────
// CART
// GET    /cart
// POST   /cart               ← purchases AND rentals (no separate rental endpoint)
// PUT    /cart/{id}
// DELETE /cart/{id}
// DELETE /cart/clear/{user_id}   ← ✅ Fixed: was DELETE /cart
// ─────────────────────────────────────────────────────────────
export const cartService = {
  get:        ()              => api.get('/cart'),
  addItem:    data            => api.post('/cart', data),
  // ✅ Fixed: rentals also go to POST /cart (no /cart/rentals endpoint)
  addRental:  data            => api.post('/cart', { ...data, type: 'rental' }),
  updateItem: (id, data)      => api.put(`/cart/${id}`, data),
  removeItem: id              => api.delete(`/cart/${id}`),
  // ✅ Fixed: was DELETE /cart → now DELETE /cart/clear/{user_id}
  clear:      userId          => api.delete(`/cart/clear/${userId}`),
}

// ─────────────────────────────────────────────────────────────
// WISHLIST
// GET    /wishlist
// POST   /wishlist
// GET    /wishlist/check          ← query param, not path segment
// DELETE /wishlist/{id}
// DELETE /wishlist/clear/{userId} ← ✅ Fixed: was DELETE /wishlist
// ─────────────────────────────────────────────────────────────
export const wishlistService = {
  getAll: ()         => api.get('/wishlist'),
  add:    data       => api.post('/wishlist', data),
  // ✅ Fixed: was /wishlist/check/{id} → now query param
  check:  productId  => api.get('/wishlist/check', { params: { product_id: productId } }),
  remove: id         => api.delete(`/wishlist/${id}`),
  // ✅ Fixed: was DELETE /wishlist → now DELETE /wishlist/clear/{userId}
  clear:  userId     => api.delete(`/wishlist/clear/${userId}`),
}

// ─────────────────────────────────────────────────────────────
// PRODUCT IMAGES  ← ✅ All paths fixed — flat /product-images/ resource
// GET    /products/{productId}/images       (list — nested under product)
// GET    /product-images/{id}               (single)
// PUT    /product-images/{id}               (update alt text)
// DELETE /product-images/{id}              (single delete)
// POST   /product-images/upload             (multi upload)
// POST   /product-images/upload-single      (single upload)
// DELETE /product-images/delete-multiple    (bulk delete)
// ─────────────────────────────────────────────────────────────
export const imageService = {
  // List still uses the product-nested route (unchanged ✓)
  getAll:       productId            => api.get(`/products/${productId}/images`),
  // Single-image operations now use flat /product-images/ routes
  get:          imageId              => api.get(`/product-images/${imageId}`),
  upload:       data                 => api.post('/product-images/upload', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadSingle: data                 => api.post('/product-images/upload-single', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateAlt:    (imageId, data)      => api.put(`/product-images/${imageId}`, data),
  delete:       imageId              => api.delete(`/product-images/${imageId}`),
  bulkDelete:   data                 => api.delete('/product-images/delete-multiple', { data }),
}

// ─────────────────────────────────────────────────────────────
// RECOMMENDATIONS  — routes match ✓
// ─────────────────────────────────────────────────────────────
export const recommendationService = {
  getAll:  params     => api.get('/recommendations', { params }),
  getById: id         => api.get(`/recommendations/${id}`),
  create:  data       => api.post('/recommendations', data),
  update:  (id, data) => api.put(`/recommendations/${id}`, data),
  delete:  id         => api.delete(`/recommendations/${id}`),
}

// ─────────────────────────────────────────────────────────────
// LOGS  — ✅ Added missing endpoints
// GET /logs                              (all logs)
// GET /logs/{id}                         (single)
// GET /logs/stats                        (admin stats)
// GET /logs/user/{userId}               (per-user)
// GET /logs/entity/{entityType}/{id}    (per-entity)
// ─────────────────────────────────────────────────────────────
export const logService = {
  getAll:        params              => api.get('/logs', { params }),
  getById:       id                  => api.get(`/logs/${id}`),
  getStats:      ()                  => api.get('/logs/stats'),
  getByUser:     userId              => api.get(`/logs/user/${userId}`),
  getByEntity:   (entityType, id)    => api.get(`/logs/entity/${entityType}/${id}`),
}

// ─────────────────────────────────────────────────────────────
// NOTIFICATIONS  ← ⚠️ NOT in backend
// Stubbed out so the notification store doesn't crash.
// Returns empty data instead of throwing network errors.
// ─────────────────────────────────────────────────────────────
export const notificationService = {
  getAll:       () => Promise.resolve({ data: { data: [], unread_count: 0 } }),
  markRead:     () => Promise.resolve({ data: { message: 'ok' } }),
  markAllRead:  () => Promise.resolve({ data: { message: 'ok' } }),
  getUnreadCount: () => Promise.resolve({ data: { unread_count: 0 } }),
}

// ─────────────────────────────────────────────────────────────────
// AI  — personalized recommendations, trending, search, assistant
// ─────────────────────────────────────────────────────────────────
export const aiService = {
  // Personalized recs for logged-in user (auth required)
  forUser:    (lastProductId = null) => api.get('/recommendations', lastProductId ? { params: { last_product_id: lastProductId } } : {}),
  // Public sections
  trending:   ()                     => api.get('/ai/trending'),
  explore:    ()                     => api.get('/ai/explore'),
  // Auth required
  similar:    productId              => api.get(`/ai/similar/${productId}`),
  search:     q                      => api.get('/ai/search', { params: { q } }),
  assistant:  query                  => api.get('/ai/assistant', { params: { query } }),
}

// Keep old recommendationService as alias so nothing breaks
// export const recommendationService = {
//   getAll: params => api.get('/recommendations', { params }),
//   getById: id => api.get(`/recommendations/${id}`),
// }
