<script setup lang="ts">
import { User } from '@/types/auth';

interface Props {
  users: User[];
  loading: boolean;
}

defineProps<Props>();

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};
</script>

<template>
  <div class="table-container">
    <div v-if="loading" class="loading">{{ $t('common.loading') }}</div>
    
    <table v-else class="admin-table">
      <thead>
        <tr>
          <th>{{ $t('admin.userManagement.name') }}</th>
          <th>{{ $t('admin.userManagement.email') }}</th>
          <th>{{ $t('admin.userManagement.phone') }}</th>
          <th>{{ $t('admin.userManagement.role') }}</th>
          <th>{{ $t('admin.userManagement.joinedDate') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.phone || '-' }}</td>
          <td>
            <span :class="['role-badge', user.role === 'admin' ? 'role-admin' : 'role-customer']">
              {{ $t(`admin.userManagement.${user.role}`) }}
            </span>
          </td>
          <td>{{ formatDate(user.createdAt) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.loading {
  text-align: center;
  padding: 40px;
  color: #718096;
}

.table-container {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th {
  background: #edf2f7;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #2d3748;
  border-bottom: 2px solid #cbd5e0;
}

.admin-table td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
  color: #4a5568;
}

.admin-table tbody tr:hover {
  background: #f7fafc;
}

.role-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.role-admin {
  background: #ede7f6;
  color: #673ab7;
}

.role-customer {
  background: #e0f2f1;
  color: #009688;
}

@media (max-width: 768px) {
  .admin-table {
    font-size: 0.875rem;
  }

  .admin-table th,
  .admin-table td {
    padding: 8px;
  }
}
</style>
