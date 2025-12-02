<script setup lang="ts">
import { onMounted } from 'vue';
import { useUsers } from '@/composables/admin/useUsers';
import UserStats from '@/components/admin/UserStats.vue';
import UserTable from '@/components/admin/UserTable.vue';

const { users, loading, loadingMore, hasMore, userStats, fetchUsers, loadMore } = useUsers();

onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <div class="admin-users-view page">
    <div class="section-header">
      <h2>{{ $t('admin.userManagement.title') }}</h2>
    </div>

    <UserStats
      :total="userStats.total"
      :customers="userStats.customers"
      :admins="userStats.admins"
    />

    <UserTable
      :users="users"
      :loading="loading"
    />

    <div v-if="hasMore" class="load-more-container">
      <button 
        @click="loadMore" 
        :disabled="loadingMore"
        class="load-more-btn"
      >
        {{ loadingMore ? $t('common.loading') : $t('common.loadMore') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.admin-users-view {
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 1.5rem;
  color: #2d3748;
  margin: 0;
}

.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding: 20px 0;
}

.load-more-btn {
  padding: 12px 32px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.load-more-btn:hover:not(:disabled) {
  background: #357abd;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

.load-more-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  opacity: 0.6;
}

@media (max-width: 768px) {
  .admin-users-view {
    padding: 20px;
  }
}
</style>
