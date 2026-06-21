<template>
  <footer class="app-footer pt-5 pb-3 mt-auto">
    <div class="container">
      <div class="row g-4 mb-4">
        <div class="col-lg-4 col-md-6">
          <h5 class="text-cream mb-3 d-flex align-items-center gap-2">
            <i class="bi bi-gem text-gold"></i> Tasleem
          </h5>
          <p class="text-muted" style="font-size: .9rem;">
            Your premium marketplace for buying, selling, and renting authentic products. Quality and trust delivered to your doorstep.
          </p>
        </div>
        
        <div class="col-lg-2 col-md-6">
          <h6 class="text-cream mb-3">Quick Links</h6>
          <ul class="list-unstyled footer-links">
            <!-- FIX 1: Replaced <a href> with <RouterLink> to prevent full page reloads -->
            <li><RouterLink to="/">Home</RouterLink></li>
            <li><RouterLink to="/products">Shop</RouterLink></li>
            <li><RouterLink to="/categories">Categories</RouterLink></li>
            <li><RouterLink to="/search">Search</RouterLink></li>
          </ul>
        </div>

        <div class="col-lg-2 col-md-6">
          <h6 class="text-cream mb-3">Account</h6>
          <ul class="list-unstyled footer-links">
            <li><RouterLink to="/login">Login</RouterLink></li>
            <li><RouterLink to="/register">Register</RouterLink></li>
            <li><RouterLink to="/profile">Profile</RouterLink></li>
            <li><RouterLink to="/orders">Orders</RouterLink></li>
          </ul>
        </div>

        <div class="col-lg-4 col-md-6">
          <h6 class="text-cream mb-3">Contact Us</h6>
          <ul class="list-unstyled footer-links">
            <li><i class="bi bi-envelope me-2 text-gold"></i> support@tasleem.com</li>
            <li><i class="bi bi-phone me-2 text-gold"></i> +20 123 456 7890</li>
            <li><i class="bi bi-geo-alt me-2 text-gold"></i> Cairo, Egypt</li>
          </ul>
          <div class="d-flex gap-3 mt-3">
            <a href="#" class="text-muted fs-5"><i class="bi bi-facebook"></i></a>
            <a href="#" class="text-muted fs-5"><i class="bi bi-twitter-x"></i></a>
            <a href="#" class="text-muted fs-5"><i class="bi bi-instagram"></i></a>
          </div>
        </div>
      </div>

      <hr style="border-color: var(--navy-border);" />
      
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-center">
        <!-- FIX 2: Dynamic copyright year -->
        <p class="text-muted mb-0" style="font-size: .85rem;">
          &copy; {{ new Date().getFullYear() }} Tasleem. All rights reserved.
        </p>
        <div class="d-flex gap-3">
          <a href="#" class="text-muted text-decoration-none" style="font-size: .85rem;">Privacy Policy</a>
          <a href="#" class="text-muted text-decoration-none" style="font-size: .85rem;">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// No script logic needed for the footer
</script>

<style scoped>
.app-footer {
  background: var(--navy-card);
  border-top: 1px solid var(--navy-border);
}

.footer-links li {
  margin-bottom: 0.5rem;
}

.footer-links a, .footer-links li {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: var(--gold);
}
</style>