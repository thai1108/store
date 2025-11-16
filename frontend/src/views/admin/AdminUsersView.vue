<script setup lang="ts">
import { onMounted } from 'vue';
import { useUsers } from '@/composables/admin/useUsers';
import UserStats from '@/components/admin/UserStats.vue';
import UserTable from '@/components/admin/UserTable.vue';

const { users, loading, userStats, fetchUsers } = useUsers();

onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <div class="admin-users-view">
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

@media (max-width: 768px) {
  .admin-users-view {
    padding: 20px;
  }
}
</style>
