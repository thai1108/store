<script setup lang="ts">
import { Order } from '@/types/order';

interface Props {
  orders: Order[];
  loading: boolean;
}

interface Emits {
  (e: 'view', order: Order): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'status-pending',
    confirmed: 'status-confirmed',
    completed: 'status-completed',
    cancelled: 'status-cancelled',
  };
  return classes[status] || '';
};
</script>

<template>
  <div class="table-container">
    <div v-if="loading" class="loading">{{ $t('common.loading') }}</div>
    
    <table v-else class="admin-table">
      <thead>
        <tr>
          <th>{{ $t('admin.orderManagement.orderId') }}</th>
          <th>{{ $t('admin.orderManagement.customer') }}</th>
          <th>{{ $t('admin.orderManagement.total') }}</th>
          <th>{{ $t('admin.orderManagement.status') }}</th>
          <th>{{ $t('admin.orderManagement.date') }}</th>
          <th>{{ $t('admin.orderManagement.actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.id">
          <td><code>{{ order.id.slice(0, 8) }}</code></td>
          <td>{{ order.customerInfo.name }}</td>
          <td>{{ formatPrice(order.totalAmount) }}</td>
          <td>
            <span :class="['status-badge', getStatusClass(order.status)]">
              {{ $t(`admin.orderManagement.${order.status}`) }}
            </span>
          </td>
          <td>{{ formatDate(order.createdAt) }}</td>
          <td>
            <button class="btn btn-sm btn-secondary" @click="emit('view', order)">
              {{ $t('admin.orderManagement.viewDetails') }}
            </button>
          </td>
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

code {
  background: #edf2f7;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.875rem;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-pending {
  background: #fef5e7;
  color: #f39c12;
}

.status-confirmed {
  background: #e3f2fd;
  color: #2196f3;
}

.status-completed {
  background: #e8f5e9;
  color: #4caf50;
}

.status-cancelled {
  background: #ffebee;
  color: #f44336;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s;
  background: #718096;
  color: white;
}

.btn:hover {
  background: #4a5568;
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
