<script setup lang="ts">
interface Props {
  total: number;
  customers: number;
  admins: number;
}

defineProps<Props>();
</script>

<template>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value">{{ total }}</div>
      <div class="stat-label">{{ $t('admin.userManagement.totalUsers') }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">{{ customers }}</div>
      <div class="stat-label">{{ $t('admin.userManagement.totalCustomers') }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">{{ admins }}</div>
      <div class="stat-label">{{ $t('admin.userManagement.totalAdmins') }}</div>
    </div>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
