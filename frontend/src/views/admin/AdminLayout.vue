<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();

if (!authStore.isAuthenticated || authStore.user?.role !== 'admin') {
  router.push('/');
}
</script>

<template>
  <div class="admin-layout">
    <div class="container">
      <h1 class="admin-title">{{ $t('admin.title') }}</h1>

      <nav class="tabs">
        <router-link to="/admin/products" class="tab" active-class="active">
          {{ $t('admin.products') }}
        </router-link>
        <router-link to="/admin/orders" class="tab" active-class="active">
          {{ $t('admin.orders') }}
        </router-link>
        <router-link to="/admin/users" class="tab" active-class="active">
          {{ $t('admin.customers') }}
        </router-link>
      </nav>

      <router-view />
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  padding: 80px 20px 40px;
  min-height: 100vh;
  background: #f7fafc;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.admin-title {
  font-size: 2rem;
  color: #2d3748;
  margin-bottom: 30px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid #e2e8f0;
}

.tab {
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  color: #718096;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
}

.tab:hover {
  color: #2d3748;
  background: #edf2f7;
}

.tab.active {
  color: #4299e1;
  border-bottom-color: #4299e1;
  font-weight: 600;
}

@media (max-width: 768px) {
  .admin-layout {
    padding: 70px 10px 30px;
  }
}
</style>
