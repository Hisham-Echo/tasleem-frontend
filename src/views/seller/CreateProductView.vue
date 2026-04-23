<template>
  <div>
    <div class="page-header">
      <div class="container">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-2">
            <li class="breadcrumb-item"><RouterLink to="/">Home</RouterLink></li>
            <li class="breadcrumb-item"><RouterLink to="/seller/dashboard">My Listings</RouterLink></li>
            <li class="breadcrumb-item active">List a Product</li>
          </ol>
        </nav>
        <h1 class="text-cream mb-0"><i class="bi bi-plus-circle me-2 text-gold"></i>List a Product</h1>
      </div>
    </div>

    <div class="container py-4">
      <div class="row g-4">
        <div class="col-lg-8">
          <form @submit.prevent="onSubmit" novalidate>

            <!-- ── Step 01: Listing Type ──────────────────────────── -->
            <div class="card p-4 mb-4">
              <h5 class="text-cream mb-4"><span class="text-gold me-2">01.</span>Listing Type</h5>
              <div class="row g-3">
                <div class="col-md-4" v-for="t in listingTypes" :key="t.value">
                  <label class="listing-type-card" :class="{ active: listingType === t.value }">
                    <input type="radio" v-model="listingType" :value="t.value" class="d-none" />
                    <div class="listing-type-icon">
                      <i :class="t.icon"></i>
                    </div>
                    <div class="listing-type-label">{{ t.label }}</div>
                    <div class="listing-type-desc">{{ t.desc }}</div>
                    <div class="listing-type-check" v-if="listingType === t.value">
                      <i class="bi bi-check2"></i>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <!-- ── Step 02: Basic Info ───────────────────────────── -->
            <div class="card p-4 mb-4">
              <h5 class="text-cream mb-4"><span class="text-gold me-2">02.</span>Basic Information</h5>
              <div class="mb-3">
                <label class="form-label">Product Name <span class="text-danger">*</span></label>
                <input class="form-control" v-model="form.name" :class="{ 'is-invalid': errors.name }"
                  placeholder="e.g. iPhone 14 Pro Max 256GB" maxlength="150" />
                <div class="invalid-feedback">{{ errors.name }}</div>
                <div class="text-muted mt-1" style="font-size:.75rem;">{{ form.name.length }}/150</div>
              </div>
              <div class="mb-3">
                <label class="form-label">Description <span class="text-danger">*</span></label>
                <textarea class="form-control" v-model="form.description" :class="{ 'is-invalid': errors.description }"
                  rows="5" placeholder="Describe condition, features, included accessories..." maxlength="2000"></textarea>
                <div class="invalid-feedback">{{ errors.description }}</div>
                <div class="text-muted mt-1" style="font-size:.75rem;">{{ form.description.length }}/2000</div>
              </div>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Category <span class="text-danger">*</span></label>
                  <select class="form-select" v-model="form.category_id" :class="{ 'is-invalid': errors.category_id }">
                    <option value="">Select a category</option>
                    <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                  </select>
                  <div class="invalid-feedback">{{ errors.category_id }}</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Condition</label>
                  <select class="form-select" v-model="form.condition">
                    <option value="new">New</option>
                    <option value="like_new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- ── Step 03: Pricing (Sale) ──────────────────────── -->
            <Transition name="fade">
              <div class="card p-4 mb-4" v-if="showSaleFields">
                <div class="d-flex align-items-center gap-2 mb-4">
                  <div class="step-icon" style="background:rgba(46,204,113,.12);color:#2ecc71;">
                    <i class="bi bi-tag-fill"></i>
                  </div>
                  <h5 class="text-cream mb-0"><span class="text-gold me-2">03.</span>Sale Pricing & Inventory</h5>
                </div>
                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label">Sale Price (EGP) <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text">EGP</span>
                      <input class="form-control" type="number" v-model="form.price"
                        :class="{ 'is-invalid': errors.price }" min="0" step="0.01" placeholder="0.00" />
                    </div>
                    <div class="text-danger mt-1" style="font-size:.8rem;" v-if="errors.price">{{ errors.price }}</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Original Price (EGP)</label>
                    <div class="input-group">
                      <span class="input-group-text">EGP</span>
                      <input class="form-control" type="number" v-model="form.old_price" min="0" step="0.01" placeholder="Optional" />
                    </div>
                    <div class="text-muted mt-1" style="font-size:.75rem;">Shown as strikethrough</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Stock Qty <span class="text-danger">*</span></label>
                    <input class="form-control" type="number" v-model="form.stock"
                      :class="{ 'is-invalid': errors.stock }" min="1" placeholder="1" />
                    <div class="invalid-feedback">{{ errors.stock }}</div>
                  </div>
                </div>
              </div>
            </Transition>

            <!-- ── Step 03/04: Rental Pricing ───────────────────── -->
            <Transition name="fade">
              <div class="card p-4 mb-4" v-if="showRentFields">
                <div class="d-flex align-items-center gap-2 mb-4">
                  <div class="step-icon" style="background:rgba(52,152,219,.12);color:#3498db;">
                    <i class="bi bi-clock-history"></i>
                  </div>
                  <h5 class="text-cream mb-0">
                    <span class="text-gold me-2">{{ showSaleFields ? '04.' : '03.' }}</span>Rental Pricing
                  </h5>
                </div>

                <!-- Rent-only availability note -->
                <div v-if="listingType === 'rent'" class="alert py-2 px-3 mb-3"
                  style="background:rgba(52,152,219,.08);border:1px solid rgba(52,152,219,.25);border-radius:.6rem;font-size:.84rem;color:#5dade2;">
                  <i class="bi bi-info-circle me-2"></i>
                  This product will be <strong>listed for rent only</strong>. Customers cannot purchase it outright.
                </div>

                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label">Daily Rate (EGP) <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text">EGP</span>
                      <input class="form-control" type="number" v-model="form.daily_rental_price"
                        :class="{ 'is-invalid': errors.daily_rental_price }" min="0" step="0.01" placeholder="0.00" />
                    </div>
                    <div class="text-danger mt-1" style="font-size:.8rem;" v-if="errors.daily_rental_price">{{ errors.daily_rental_price }}</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Min Rental Days</label>
                    <input class="form-control" type="number" v-model="form.min_rental_days" min="1" placeholder="1" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Max Rental Days</label>
                    <input class="form-control" type="number" v-model="form.max_rental_days" min="1" placeholder="30" />
                  </div>
                </div>

                <!-- Rent-only: minimal stock field -->
                <div class="row g-3 mt-1" v-if="listingType === 'rent'">
                  <div class="col-md-4">
                    <label class="form-label">Available Units</label>
                    <input class="form-control" type="number" v-model="form.stock" min="1" placeholder="1" />
                    <div class="text-muted mt-1" style="font-size:.73rem;">How many units can be rented simultaneously</div>
                  </div>
                </div>
              </div>
            </Transition>

            <!-- ── Images ────────────────────────────────────────── -->
            <div class="card p-4 mb-4">
              <h5 class="text-cream mb-4">
                <span class="text-gold me-2">{{ imageStepNum }}.</span>Product Images
              </h5>
              <ProductImageUpload ref="imageUploader" @update:files="imageFiles = $event" :max-images="8" />
            </div>

            <!-- ── Actions ───────────────────────────────────────── -->
            <div class="d-flex gap-3 flex-wrap">
              <button type="submit" class="btn btn-gold px-5 py-2" :disabled="loading">
                <span class="spinner-border spinner-border-sm me-2" v-if="loading"></span>
                <i class="bi bi-check2-circle me-2" v-else></i>
                {{ loading ? 'Publishing...' : 'Publish Listing' }}
              </button>
              <button type="button" class="btn btn-outline-gold" @click="saveDraft" :disabled="loading">Save as Draft</button>
              <RouterLink to="/seller/dashboard" class="btn btn-link text-muted">Cancel</RouterLink>
            </div>
          </form>
        </div>

        <!-- Tips sidebar -->
        <div class="col-lg-4">
          <div class="card p-4 sticky-top" style="top:80px;">
            <h6 class="text-cream mb-3"><i class="bi bi-lightbulb text-gold me-2"></i>Tips for {{ listingType === 'rent' ? 'Renting' : 'Selling' }} Fast</h6>
            <div class="d-flex flex-column gap-3">
              <div v-for="tip in currentTips" :key="tip.t">
                <div class="text-cream" style="font-size:.85rem;font-weight:600;">{{ tip.t }}</div>
                <div class="text-muted" style="font-size:.78rem;margin-top:2px;">{{ tip.d }}</div>
              </div>
            </div>
            <hr class="divider-gold my-3" />

            <!-- Live preview card -->
            <h6 class="text-cream mb-2" style="font-size:.82rem;text-transform:uppercase;letter-spacing:.06em;">Live Preview</h6>
            <div class="card overflow-hidden" style="border-radius:.75rem;">
              <div style="height:110px;background:var(--navy-light);overflow:hidden;display:flex;align-items:center;justify-content:center;">
                <img :src="previewImage" style="width:100%;height:100%;object-fit:cover;" v-if="previewImage" />
                <i class="bi bi-image text-muted fs-2" v-else></i>
              </div>
              <div class="p-2">
                <div class="text-cream text-truncate" style="font-size:.82rem;font-weight:600;">{{ form.name || 'Product Name' }}</div>
                <div class="d-flex align-items-center gap-2 flex-wrap mt-1">
                  <div class="text-gold" style="font-size:.9rem;font-weight:700;" v-if="showSaleFields && form.price">
                    EGP {{ Number(form.price).toLocaleString() }}
                  </div>
                  <div class="text-muted" style="font-size:.78rem;" v-if="showRentFields && form.daily_rental_price">
                    <i class="bi bi-clock me-1"></i>EGP {{ Number(form.daily_rental_price).toLocaleString() }}/day
                  </div>
                </div>
                <div class="mt-1 d-flex gap-1 flex-wrap">
                  <span v-if="showSaleFields" class="badge" style="background:rgba(46,204,113,.15);color:#2ecc71;font-size:.65rem;">For Sale</span>
                  <span v-if="showRentFields" class="badge" style="background:rgba(52,152,219,.15);color:#5dade2;font-size:.65rem;">For Rent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { categoryService, productService, imageService } from '@/services/api'
import { useToast } from 'vue-toastification'
import ProductImageUpload from '@/components/ui/ProductImageUpload.vue'

const router      = useRouter()
const toast       = useToast()
const categories  = ref([])
const loading     = ref(false)
const imageFiles  = ref([])
const imageUploader = ref(null)

// ── Listing type ──────────────────────────────────────────────────────
const listingType = ref('sale') // 'sale' | 'rent' | 'both'

const listingTypes = [
  { value: 'sale', label: 'For Sale',      icon: 'bi bi-tag-fill',       desc: 'Sell your item outright to buyers' },
  { value: 'rent', label: 'For Rent',      icon: 'bi bi-clock-history',  desc: 'Let others rent it temporarily' },
  { value: 'both', label: 'Sale & Rent',   icon: 'bi bi-arrow-left-right', desc: 'Offer both options to buyers' },
]

const showSaleFields = computed(() => listingType.value === 'sale' || listingType.value === 'both')
const showRentFields = computed(() => listingType.value === 'rent' || listingType.value === 'both')

const imageStepNum = computed(() => {
  if (listingType.value === 'both') return '05'
  return '04'
})

const form = reactive({
  name: '', description: '', category_id: '', condition: 'new',
  price: '', old_price: '', stock: 1,
  daily_rental_price: '', min_rental_days: 1, max_rental_days: 30,
})

const errors = reactive({
  name: '', description: '', category_id: '',
  price: '', stock: '', daily_rental_price: '',
})

const previewImage = computed(() => imageUploader.value?.previews?.[0]?.url || null)

const saleTips = [
  { t: '📸 Photos sell products',    d: 'Use good lighting & multiple angles. First photo is the hero image.' },
  { t: '✏️ Specific titles rank higher', d: 'Include brand, model, size, and color.' },
  { t: '💰 Competitive pricing wins', d: 'Check similar listings to find the sweet spot.' },
  { t: '📋 Full descriptions build trust', d: "Mention condition, defects, what's included." },
]

const rentTips = [
  { t: '📅 Set fair daily rates',    d: 'Research similar rental prices; weekly discounts attract more bookings.' },
  { t: '🛡️ Note any deposits',       d: 'Mention security deposit requirements upfront.' },
  { t: '📦 Describe pickup/delivery', d: 'Tell renters how they can collect or receive the item.' },
  { t: '🔧 State condition clearly',  d: 'Renters want to know exactly what they are getting.' },
]

const currentTips = computed(() => listingType.value === 'rent' ? rentTips : saleTips)

function validate(draft = false) {
  Object.keys(errors).forEach(k => errors[k] = '')
  if (draft) return true
  let ok = true
  if (!form.name.trim())        { errors.name        = 'Required'; ok = false }
  if (!form.description.trim()) { errors.description = 'Required'; ok = false }
  if (!form.category_id)        { errors.category_id = 'Required'; ok = false }

  if (showSaleFields.value) {
    if (!form.price || Number(form.price) <= 0) { errors.price = 'Enter a valid price'; ok = false }
    if (form.stock === '' || Number(form.stock) < 1) { errors.stock = 'Enter stock quantity'; ok = false }
  }

  if (showRentFields.value) {
    if (!form.daily_rental_price || Number(form.daily_rental_price) <= 0) {
      errors.daily_rental_price = 'Enter a daily rental rate'; ok = false
    }
  }

  return ok
}

async function submit(draft = false) {
  if (!validate(draft)) { toast.error('Please fix the highlighted errors'); return }
  loading.value = true
  try {
    const fd = new FormData()

    // Basic fields
    Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v) })

    // Listing type flags
    fd.set('listing_type', listingType.value)
    fd.set('is_rentable',  showRentFields.value ? 1 : 0)

    // Rent-only: zero out sale price
    if (listingType.value === 'rent') {
      fd.set('price', 0)
    }

    if (draft) fd.set('status', 'draft')

    const res       = await productService.create(fd)
    const productId = (res.data?.data || res.data)?.id

    if (imageFiles.value.length > 0 && productId) {
      const imgFd = new FormData()
      imgFd.append('product_id', productId)
      imageFiles.value.forEach(f => imgFd.append('images[]', f))
      await imageService.upload(imgFd).catch(() => toast.info('Product saved but image upload failed'))
    }

    toast.success(draft ? 'Draft saved!' : 'Listing published! 🎉')
    router.push('/seller/dashboard')
  } catch (e) {
    const errs = e.response?.data?.errors || {}
    Object.assign(errors, Object.fromEntries(Object.entries(errs).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])))
    toast.error(e.response?.data?.message || 'Failed to publish')
  } finally {
    loading.value = false
  }
}

const onSubmit = () => submit(false)
const saveDraft = () => submit(true)

onMounted(async () => {
  const res = await categoryService.getAll().catch(() => ({ data: [] }))
  categories.value = res.data?.data || res.data || []
})
</script>

<style scoped>
/* Listing type selector cards */
.listing-type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .5rem;
  padding: 1.25rem .75rem;
  border-radius: 1rem;
  border: 2px solid var(--navy-border);
  background: var(--navy-light);
  cursor: pointer;
  transition: all .18s;
  position: relative;
  text-align: center;
  user-select: none;
}
.listing-type-card:hover {
  border-color: rgba(201,169,110,.4);
  background: rgba(201,169,110,.04);
}
.listing-type-card.active {
  border-color: var(--gold);
  background: rgba(201,169,110,.07);
  box-shadow: 0 0 0 3px rgba(201,169,110,.12);
}
.listing-type-icon {
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(201,169,110,.1);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; color: var(--gold);
  transition: all .18s;
}
.listing-type-card.active .listing-type-icon {
  background: var(--gold);
  color: var(--navy);
}
.listing-type-label {
  font-weight: 700;
  color: var(--cream);
  font-size: .9rem;
}
.listing-type-desc {
  font-size: .74rem;
  color: var(--text-muted);
  line-height: 1.4;
}
.listing-type-check {
  position: absolute;
  top: .5rem; right: .5rem;
  width: 20px; height: 20px;
  border-radius: 50%;
  background: var(--gold);
  color: var(--navy);
  display: flex; align-items: center; justify-content: center;
  font-size: .7rem;
  font-weight: 800;
}

.step-icon {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; flex-shrink: 0;
}

.fade-enter-active, .fade-leave-active { transition: opacity .25s, transform .25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-6px); }
</style>