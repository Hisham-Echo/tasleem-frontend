<template>
  <div>
    <div class="page-header">
      <div class="container">
        <h1 class="text-cream mb-0"><i class="bi bi-lock me-2 text-gold"></i>Checkout</h1>
      </div>
    </div>

    <div class="container py-4">
      <!-- Step Indicator -->
      <div class="checkout-steps mb-5">
        <div v-for="(label, index) in stepLabels" :key="index" 
             class="step-item" :class="{ active: step > index, current: step === index + 1 }">
          <div class="step-circle">{{ index + 1 }}</div>
          <span class="step-label d-none d-md-block">{{ label }}</span>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-lg-8">
          <!-- Step 1: Shipping -->
          <div v-if="step === 1" class="card checkout-card p-4">
            <h4 class="text-cream mb-4"><i class="bi bi-truck me-2 text-gold"></i>Shipping Information</h4>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label text-muted">Full Name</label>
                <input type="text" class="form-control" v-model="shipping.name" :class="{ 'is-invalid': shippingErrors.name }" />
                <div class="invalid-feedback">{{ shippingErrors.name }}</div>
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted">Email Address</label>
                <input type="email" class="form-control" v-model="shipping.email" :class="{ 'is-invalid': shippingErrors.email }" />
                <div class="invalid-feedback">{{ shippingErrors.email }}</div>
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted">Phone Number</label>
                <input type="tel" class="form-control" v-model="shipping.phone" :class="{ 'is-invalid': shippingErrors.phone }" />
                <div class="invalid-feedback">{{ shippingErrors.phone }}</div>
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted">City</label>
                <select class="form-select" v-model="shipping.city">
                  <option value="" disabled>Select City</option>
                  <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
                </select>
              </div>
              <div class="col-12">
                <label class="form-label text-muted">Street Address</label>
                <input type="text" class="form-control" v-model="shipping.address" :class="{ 'is-invalid': shippingErrors.address }" placeholder="Street, Building, Apartment" />
                <div class="invalid-feedback">{{ shippingErrors.address }}</div>
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted">Postal Code (Optional)</label>
                <input type="text" class="form-control" v-model="shipping.postal_code" />
              </div>
            </div>
            <div class="d-flex justify-content-end mt-4">
              <button class="btn btn-gold px-4" @click="nextStep">Continue to Payment <i class="bi bi-arrow-right ms-2"></i></button>
            </div>
          </div>

          <!-- Step 2: Payment -->
          <div v-if="step === 2" class="card checkout-card p-4">
            <h4 class="text-cream mb-4"><i class="bi bi-credit-card me-2 text-gold"></i>Payment Method</h4>
            <div class="payment-methods">
              <div v-for="method in paymentMethods" :key="method.value" 
                   class="payment-option" :class="{ selected: payment.method === method.value }"
                   @click="payment.method = method.value">
                <div class="d-flex align-items-center gap-3">
                  <i :class="method.icon" style="font-size: 1.5rem;" class="text-gold"></i>
                  <div>
                    <h6 class="text-cream mb-0">{{ method.label }}</h6>
                    <small class="text-muted">{{ method.desc }}</small>
                  </div>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="radio" :value="method.value" v-model="payment.method" />
                </div>
              </div>
            </div>

            <!-- Card Details (Mock) -->
            <div v-if="payment.method === 'card'" class="mt-4 p-3 rounded" style="background: rgba(0,0,0,0.2);">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label text-muted">Card Number</label>
                  <input type="text" class="form-control" v-model="payment.card_number" @input="formatCardNumber" placeholder="1234 5678 9012 3456" maxlength="19" />
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted">Expiry Date</label>
                  <input type="text" class="form-control" v-model="payment.expiry" @input="formatExpiry" placeholder="MM/YY" maxlength="5" />
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted">CVV</label>
                  <input type="password" class="form-control" v-model="payment.cvv" placeholder="123" maxlength="3" />
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-between mt-4">
              <button class="btn btn-outline-gold px-4" @click="step--"><i class="bi bi-arrow-left me-2"></i>Back</button>
              <button class="btn btn-gold px-4" @click="nextStep">Review Order <i class="bi bi-arrow-right ms-2"></i></button>
            </div>
          </div>

          <!-- Step 3: Review -->
          <div v-if="step === 3" class="card checkout-card p-4">
            <h4 class="text-cream mb-4"><i class="bi bi-check2-square me-2 text-gold"></i>Review & Place Order</h4>
            
            <div class="mb-4">
              <h6 class="text-muted mb-2">Shipping To:</h6>
              <p class="text-cream mb-0">{{ shipping.name }}, {{ shipping.phone }}</p>
              <p class="text-muted mb-0">{{ shipping.address }}, {{ shipping.city }}</p>
            </div>

            <div class="mb-4">
              <h6 class="text-muted mb-2">Payment Method:</h6>
              <p class="text-cream mb-0">{{ paymentMethods.find(m => m.value === payment.method)?.label }}</p>
            </div>

            <div class="mb-4">
              <h6 class="text-muted mb-3">Order Items ({{ cart.totalItems }}):</h6>
              <div v-for="item in cart.items" :key="item.id" class="d-flex gap-3 mb-2 pb-2 border-bottom" style="border-color: var(--navy-border) !important;">
                <img :src="item.image || item.product?.image" class="rounded" style="width: 50px; height: 50px; object-fit: cover;" />
                <div class="flex-grow-1">
                  <p class="text-cream mb-0" style="font-size: .9rem;">{{ item.name || item.product?.name }}</p>
                  <small class="text-muted">Qty: {{ item.quantity || 1 }}</small>
                </div>
                <span class="text-cream">{{ formatPrice((item.price || item.product?.price) * (item.quantity || 1)) }}</span>
              </div>
            </div>

            <div class="d-flex justify-content-between mt-4">
              <button class="btn btn-outline-gold px-4" @click="step--"><i class="bi bi-arrow-left me-2"></i>Back</button>
              <button class="btn btn-gold px-5" @click="placeOrder" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-check-circle me-2"></i>Place Order
              </button>
            </div>
          </div>

          <!-- Step 4: Success -->
          <div v-if="step === 4" class="card checkout-card p-5 text-center">
            <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
            <h3 class="text-cream mt-3">Order Placed Successfully!</h3>
            <p class="text-muted">Thank you for your purchase. Your order ID is <strong class="text-gold">#{{ orderId }}</strong></p>
            <div class="d-flex justify-content-center gap-3 mt-4">
              <RouterLink to="/orders" class="btn btn-outline-gold">View Orders</RouterLink>
              <RouterLink to="/products" class="btn btn-gold">Continue Shopping</RouterLink>
            </div>
          </div>
        </div>

        <!-- Order Summary Sidebar -->
        <div class="col-lg-4" v-if="step < 4">
          <div class="card checkout-card p-3 sticky-top" style="top: 100px;">
            <h5 class="text-cream mb-3">Order Summary</h5>
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted">Subtotal</span>
              <span class="text-cream">{{ formatPrice(cart.totalPrice) }}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted">Shipping</span>
              <span class="text-cream">{{ formatPrice(50) }}</span>
            </div>
            <hr style="border-color: var(--navy-border);" />
            <div class="d-flex justify-content-between mb-0">
              <span class="text-cream fw-bold fs-5">Total</span>
              <span class="text-gold fw-bold fs-5">{{ formatPrice(cart.totalPrice + 50) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { orderService, paymentService } from '@/services/api'
import { useToast } from 'vue-toastification'

const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()
const toast = useToast()

const step = ref(1)
const loading = ref(false)
const orderId = ref(null)
const stepLabels = ['Shipping', 'Payment', 'Confirm', 'Done']

const shipping = reactive({
  name: auth.user?.name || '',
  email: auth.user?.email || '',
  phone: auth.user?.phone || '',
  address: '',
  city: '',
  postal_code: ''
})
const shippingErrors = reactive({ name: '', email: '', phone: '', address: '' })

const payment = reactive({ method: 'cash', card_number: '', expiry: '', cvv: '' })

const cities = ['Cairo', 'Giza', 'Alexandria', 'Luxor', 'Aswan', 'Hurghada', 'Sharm El-Sheikh', 'Mansoura', 'Tanta', 'Zagazig']

const paymentMethods = [
  { value: 'cash', label: 'Cash on Delivery', icon: 'bi bi-cash-stack', desc: 'Pay when you receive your order' },
  { value: 'card', label: 'Credit / Debit Card', icon: 'bi bi-credit-card', desc: 'Visa, Mastercard, etc.' },
  { value: 'vodafone_cash', label: 'Vodafone Cash', icon: 'bi bi-phone', desc: 'Pay via mobile wallet' },
  { value: 'instapay', label: 'InstaPay', icon: 'bi bi-lightning', desc: 'Instant bank transfer' }
]

function formatPrice(v) {
  return new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(v || 0)
}

function formatCardNumber(e) {
  let v = e.target.value.replace(/\D/g, '').slice(0, 16)
  payment.card_number = v.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(e) {
  let v = e.target.value.replace(/\D/g, '').slice(0, 4)
  if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2)
  payment.expiry = v
}

function validateShipping() {
  Object.keys(shippingErrors).forEach(k => shippingErrors[k] = '')
  let valid = true
  if (!shipping.name.trim()) { shippingErrors.name = 'Required'; valid = false }
  if (!shipping.email) { shippingErrors.email = 'Required'; valid = false }
  if (!shipping.phone) { shippingErrors.phone = 'Required'; valid = false }
  if (!shipping.address.trim()) { shippingErrors.address = 'Required'; valid = false }
  return valid
}

function nextStep() {
  if (step.value === 1) {
    if (!validateShipping()) return
  }
  step.value++
}

async function placeOrder() {
  loading.value = true
  try {
    const orderPayload = {
      // FIX: i.id is the cart item ID, not the product ID. Use i.product?.id as fallback.
      items: cart.items.map(i => ({ product_id: i.product_id || i.product?.id, quantity: i.quantity || 1 })),
      shipping_address: `${shipping.address}, ${shipping.city}`,
      payment_method: payment.method
    }
    
    const orderRes = await orderService.create(orderPayload)
    const order = orderRes.data?.data || orderRes.data
    orderId.value = order?.id || 'ORD-' + Date.now()

    if (payment.method !== 'cash') {
      await paymentService.create({
        order_id: orderId.value,
        amount: cart.totalPrice + 50,
        payment_method: payment.method
      })
    }

    await cart.clearCart()
    step.value = 4
    toast.success('Order placed successfully!')
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to place order. Please try again.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (cart.isEmpty) router.push('/cart')
})
</script>

<style scoped>
.checkout-card { background: var(--navy-card); border: 1px solid var(--navy-border); border-radius: 1rem; }
.checkout-steps { display: flex; justify-content: space-between; position: relative; }
.checkout-steps::before { content: ''; position: absolute; top: 20px; left: 0; right: 0; height: 2px; background: var(--navy-border); z-index: 0; }
.step-item { display: flex; flex-direction: column; align-items: center; position: relative; z-index: 1; }
.step-circle { width: 40px; height: 40px; border-radius: 50%; background: var(--navy-card); border: 2px solid var(--navy-border); display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-weight: bold; transition: all 0.3s; }
.step-item.active .step-circle { background: var(--gold); border-color: var(--gold); color: var(--navy-bg); }
.step-item.current .step-circle { box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.3); }
.step-label { margin-top: 8px; font-size: 0.85rem; color: var(--text-muted); }
.step-item.active .step-label { color: var(--cream); }

.payment-option { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid var(--navy-border); border-radius: 0.5rem; margin-bottom: 0.75rem; cursor: pointer; transition: all 0.2s; }
.payment-option:hover { border-color: var(--gold); }
.payment-option.selected { border-color: var(--gold); background: rgba(212, 175, 55, 0.05); }
</style>