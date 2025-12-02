<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { orderService } from '@/services/order-service';
import { Order } from '@/types/order';

const orders = ref<Order[]>([]);
const isLoading = ref(false);
const loadingMore = ref(false);
const hasMore = ref(true);
const nextCursor = ref<string | null>(null);
const error = ref('');
const expandedOrders = ref<Set<string>>(new Set());

onMounted(async () => {
  await loadOrders();
});

const loadOrders = async () => {
  isLoading.value = true;
  error.value = '';
  
  try {
    const response = await orderService.getUserOrders();
    
    if (response.success && response.data) {
      orders.value = response.data;
      nextCursor.value = response.pagination.nextCursor;
      hasMore.value = response.pagination.hasMore;
    } else {
      error.value = response.message || 'Failed to load orders';
    }
  } catch (err) {
    console.error('Error loading orders:', err);
    error.value = 'Failed to load orders';
  } finally {
    isLoading.value = false;
  }
};

const loadMoreOrders = async () => {
  if (loadingMore.value || !hasMore.value || !nextCursor.value) return;

  loadingMore.value = true;
  error.value = '';

  try {
    const response = await orderService.getUserOrders(nextCursor.value);

    if (response.success && response.data) {
      orders.value = [...orders.value, ...response.data];
      nextCursor.value = response.pagination.nextCursor;
      hasMore.value = response.pagination.hasMore;
    } else {
      error.value = response.message || 'Failed to load more orders';
    }
  } catch (err) {
    console.error('Error loading more orders:', err);
    error.value = 'Failed to load more orders';
  } finally {
    loadingMore.value = false;
  }
};

const toggleOrderDetails = (orderId: string) => {
  if (expandedOrders.value.has(orderId)) {
    expandedOrders.value.delete(orderId);
  } else {
    expandedOrders.value.add(orderId);
  }
};

const isExpanded = (orderId: string) => {
  return expandedOrders.value.has(orderId);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const getStatusClass = (status: Order['status']) => {
  const statusMap = {
    pending: 'status-pending',
    confirmed: 'status-confirmed',
    completed: 'status-completed',
    cancelled: 'status-cancelled',
  };
  return statusMap[status];
};

const sortedOrders = computed(() => {
  return [...orders.value].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
});
</script>

<template>
  <div class="order-history-view page">
    <div class="container">
      <div class="page-header">
        <h1>{{ $t('orders.title') }}</h1>
        <p class="subtitle">{{ $t('orders.subtitle') }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ $t('common.loading') }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <p class="error-message">{{ error }}</p>
        <button @click="loadOrders" class="btn btn-primary">
          {{ $t('products.tryAgain') }}
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="orders.length === 0" class="empty-state">
        <div class="empty-icon">📦</div>
        <h2>{{ $t('orders.noOrders') }}</h2>
        <p>{{ $t('orders.noOrdersText') }}</p>
        <router-link to="/products" class="btn btn-primary">
          {{ $t('orders.startShopping') }}
        </router-link>
      </div>

      <!-- Orders List -->
      <div v-else class="orders-list">
        <div 
          v-for="order in sortedOrders" 
          :key="order.id"
          class="order-card"
        >
          <div class="order-header" @click="toggleOrderDetails(order.id)">
            <div class="order-main-info">
              <div class="order-id">
                <strong>{{ $t('orders.orderNumber') }}:</strong> #{{ order.id.slice(0, 8) }}
              </div>
              <div class="order-date">
                {{ formatDate(order.createdAt) }}
              </div>
            </div>
            
            <div class="order-summary">
              <div class="order-total">
                {{ formatCurrency(order.totalAmount) }}
              </div>
              <div :class="['order-status', getStatusClass(order.status)]">
                {{ $t(`orders.status.${order.status}`) }}
              </div>
              <button class="expand-btn">
                <span v-if="isExpanded(order.id)">▲</span>
                <span v-else>▼</span>
              </button>
            </div>
          </div>

          <div v-if="isExpanded(order.id)" class="order-details">
            <!-- Customer Info -->
            <div class="details-section">
              <h3>{{ $t('orders.customerInfo') }}</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">{{ $t('orders.name') }}:</span>
                  <span class="info-value">{{ order.customerInfo.name }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">{{ $t('orders.phone') }}:</span>
                  <span class="info-value">{{ order.customerInfo.phone }}</span>
                </div>
                <div v-if="order.customerInfo.email" class="info-item">
                  <span class="info-label">{{ $t('orders.email') }}:</span>
                  <span class="info-value">{{ order.customerInfo.email }}</span>
                </div>
                <div v-if="order.customerInfo.address" class="info-item full-width">
                  <span class="info-label">{{ $t('orders.address') }}:</span>
                  <span class="info-value">{{ order.customerInfo.address }}</span>
                </div>
              </div>
            </div>

            <!-- Order Items -->
            <div class="details-section">
              <h3>{{ $t('orders.items') }}</h3>
              <div class="items-list">
                <div 
                  v-for="(item, index) in order.items" 
                  :key="index"
                  class="order-item"
                >
                  <div class="item-info">
                    <div class="item-name">{{ item.productName }}</div>
                    <div class="item-quantity">x{{ item.quantity }}</div>
                  </div>
                  <div class="item-price">
                    {{ formatCurrency(item.price * item.quantity) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div v-if="order.notes" class="details-section">
              <h3>{{ $t('orders.notes') }}</h3>
              <p class="notes-text">{{ order.notes }}</p>
            </div>

            <!-- Order Total -->
            <div class="order-total-section">
              <div class="total-row">
                <span class="total-label">{{ $t('orders.total') }}:</span>
                <span class="total-amount">{{ formatCurrency(order.totalAmount) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Load More Button -->
      <div v-if="hasMore && !isLoading" class="load-more-container">
        <button 
          @click="loadMoreOrders" 
          :disabled="loadingMore"
          class="load-more-btn"
        >
          {{ loadingMore ? $t('common.loading') : $t('common.loadMore') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.order-history-view {
  padding: 80px 20px 60px;
  min-height: 100vh;
  background-color: #f7fafc;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #2d3748;
  margin-bottom: 10px;
}

.subtitle {
  color: #718096;
  font-size: 1.1rem;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 60px 20px;
}

.error-message {
  color: #e53e3e;
  margin-bottom: 20px;
  font-size: 1.1rem;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 20px;
}

.empty-state h2 {
  font-size: 1.8rem;
  color: #2d3748;
  margin-bottom: 10px;
}

.empty-state p {
  color: #718096;
  margin-bottom: 30px;
  font-size: 1.1rem;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.order-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.order-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.order-header:hover {
  background-color: #f7fafc;
}

.order-main-info {
  flex: 1;
}

.order-id {
  font-size: 1.1rem;
  color: #2d3748;
  margin-bottom: 5px;
}

.order-date {
  color: #718096;
  font-size: 0.9rem;
}

.order-summary {
  display: flex;
  align-items: center;
  gap: 20px;
}

.order-total {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2d3748;
}

.order-status {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-pending {
  background-color: #fef5e7;
  color: #d68910;
}

.status-confirmed {
  background-color: #d6eaf8;
  color: #1f618d;
}

.status-completed {
  background-color: #d5f4e6;
  color: #0e6655;
}

.status-cancelled {
  background-color: #fadbd8;
  color: #922b21;
}

.expand-btn {
  background: none;
  border: none;
  color: #667eea;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px 10px;
  transition: transform 0.2s ease;
}

.expand-btn:hover {
  transform: scale(1.1);
}

.order-details {
  padding: 0 20px 20px;
  border-top: 1px solid #e2e8f0;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.details-section {
  margin-top: 20px;
}

.details-section h3 {
  font-size: 1.1rem;
  color: #2d3748;
  margin-bottom: 15px;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 0.9rem;
  color: #718096;
  font-weight: 500;
}

.info-value {
  font-size: 1rem;
  color: #2d3748;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: #f7fafc;
  border-radius: 8px;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-name {
  font-weight: 500;
  color: #2d3748;
}

.item-quantity {
  color: #718096;
  font-size: 0.9rem;
}

.item-price {
  font-weight: 600;
  color: #2d3748;
}

.notes-text {
  color: #4a5568;
  line-height: 1.6;
  padding: 12px;
  background-color: #f7fafc;
  border-radius: 8px;
}

.order-total-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #e2e8f0;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
}

.total-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding: 20px 0;
}

.load-more-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.load-more-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.load-more-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  opacity: 0.6;
}

@media (max-width: 768px) {
  .order-history-view {
    padding: 80px 15px 40px;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .order-summary {
    width: 100%;
    justify-content: space-between;
  }

  .order-total {
    font-size: 1.1rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .order-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
