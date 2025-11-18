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
  <a-layout style="min-height: 100vh">
    <a-layout-sider collapsible theme="dark">
      <div class="logo" style="height: 64px; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; font-weight: bold;">
        Admin Panel
      </div>
      <a-menu theme="dark" mode="inline" :selected-keys="[router.currentRoute.value.path]">
        <a-menu-item key="/admin/products">
          <router-link to="/admin/products" style="color: inherit; text-decoration: none;">
            <span>{{ $t('admin.products') }}</span>
          </router-link>
        </a-menu-item>
        <a-menu-item key="/admin/orders">
          <router-link to="/admin/orders" style="color: inherit; text-decoration: none;">
            <span>{{ $t('admin.orders') }}</span>
          </router-link>
        </a-menu-item>
        <a-menu-item key="/admin/users">
          <router-link to="/admin/users" style="color: inherit; text-decoration: none;">
            <span>{{ $t('admin.customers') }}</span>
          </router-link>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0 24px; border-bottom: 1px solid #e8e8e8;">
        <h1 style="margin: 0; line-height: 64px;">{{ $t('admin.title') }}</h1>
      </a-layout-header>
      <a-layout-content style="padding: 24px; background: #f0f2f5;">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style scoped>
/* Additional styles if needed */
</style>
