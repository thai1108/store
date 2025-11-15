<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";

const authStore = useAuthStore();
const cartStore = useCartStore();
</script>

<template>
  <nav class="navbar">
    <div class="nav-container">
      <RouterLink to="/" class="nav-brand"> 🧋 TeaStore </RouterLink>

      <div class="nav-links">
        <RouterLink to="/products" class="nav-link">Products</RouterLink>

        <RouterLink
          v-if="authStore.isAuthenticated"
          to="/orders"
          class="nav-link"
        >
          Order History
        </RouterLink>

        <RouterLink v-if="authStore.isAdmin" to="/admin" class="nav-link">
          Admin
        </RouterLink>

        <RouterLink to="/cart" class="nav-link cart-link">
          🛒 Cart ({{ cartStore.totalItems }})
        </RouterLink>

        <div v-if="!authStore.isAuthenticated" class="auth-links">
          <RouterLink to="/login" class="nav-link">Login</RouterLink>
          <RouterLink to="/register" class="nav-link btn-primary"
            >Register</RouterLink
          >
        </div>

        <div v-else class="user-menu">
          <span class="user-name">{{ authStore.user?.name }}</span>
          <button @click="authStore.logout" class="logout-btn">Logout</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 0 20px;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
  color: #2d3748;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-link {
  text-decoration: none;
  color: #4a5568;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s;
}

.nav-link:hover {
  background-color: #f7fafc;
  color: #2d3748;
}

.nav-link.router-link-active {
  background-color: #3182ce;
  color: white;
}

.cart-link {
  background-color: #48bb78;
  color: white !important;
}

.btn-primary {
  background-color: #3182ce;
  color: white !important;
}

.btn-primary:hover {
  background-color: #2c5aa0;
}

.auth-links {
  display: flex;
  gap: 10px;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-name {
  color: #4a5568;
  font-weight: 500;
}

.logout-btn {
  background: #e53e3e;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: #c53030;
}

@media (max-width: 768px) {
  .nav-links {
    flex-direction: column;
    gap: 10px;
  }

  .nav-container {
    flex-direction: column;
    height: auto;
    padding: 10px 0;
  }
}
</style>
