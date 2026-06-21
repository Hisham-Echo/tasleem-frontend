import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'

import App from './App.vue'
import router from './router'

// FIX 1: Import global styles and third-party CSS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'vue-toastification/dist/index.css'
import './assets/css/main.scss'

import 'bootstrap/dist/js/bootstrap.bundle.min.js'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Toast, {
  transition: "Vue-Toastification__fade",
  maxToasts: 5,
  newestOnTop: true,
  timeout: 3000
})

// FIX 2: Add global error handler to catch unhandled errors gracefully
app.config.errorHandler = (err, instance, info) => {
  console.error('Global Vue Error:', err)
  console.error('Component Info:', info)
}

// Catch unhandled promise rejections
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason)
})

app.mount('#app')