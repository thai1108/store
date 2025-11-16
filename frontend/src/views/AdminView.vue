<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth.store';
import { productService } from '@/services/product-service';
import { adminService } from '@/services/admin-service';
import { Product, CreateProductRequest } from '@/types/product';
import { Order } from '@/types/order';
import { User } from '@/types/auth';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

if (!authStore.isAuthenticated || authStore.user?.role !== 'admin') {
  router.push('/');
}

const activeTab = ref<'products' | 'orders' | 'users'>('products');
const products = ref<Product[]>([]);
const loadingProducts = ref(false);
const showProductModal = ref(false);
const editingProduct = ref<Product | null>(null);
const productForm = ref<Partial<CreateProductRequest>>({
  name: '',
  description: '',
  price: 0,
  category: 'snack',
  imageUrl: '',
  inStock: true,
});

const orders = ref<Order[]>([]);
const loadingOrders = ref(false);
const selectedOrder = ref<Order | null>(null);
const showOrderModal = ref(false);

const users = ref<User[]>([]);
const loadingUsers = ref(false);

const userStats = computed(() => ({
  total: users.value.length,
  customers: users.value.filter(u => u.role === 'customer').length,
  admins: users.value.filter(u => u.role === 'admin').length,
}));

const fetchProducts = async () => {
  loadingProducts.value = true;
  try {
    const response = await productService.getAll();
    if (response.success && response.data) {
      products.value = response.data;
    }
  } finally {
    loadingProducts.value = false;
  }
};

const fetchOrders = async () => {
  loadingOrders.value = true;
  try {
    const response = await adminService.getAllOrders();
    if (response.success && response.data) {
      orders.value = response.data;
    }
  } finally {
    loadingOrders.value = false;
  }
};

const fetchUsers = async () => {
  loadingUsers.value = true;
  try {
    const response = await adminService.getAllUsers();
    if (response.success && response.data) {
      users.value = response.data;
    }
  } finally {
    loadingUsers.value = false;
  }
};

const resetProductForm = () => {
  productForm.value = {
    name: '',
    description: '',
    price: 0,
    category: 'snack',
    imageUrl: '',
    inStock: true,
  };
};

const openAddProductModal = () => {
  editingProduct.value = null;
  resetProductForm();
  showProductModal.value = true;
};

const openEditProductModal = (product: Product) => {
  editingProduct.value = product;
  productForm.value = {
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    imageUrl: product.imageUrl,
    inStock: product.inStock,
  };
  showProductModal.value = true;
};

const handleProductSuccess = async (message: string) => {
  alert(t(message));
  await fetchProducts();
  showProductModal.value = false;
};

const handleProductError = (errorMessage?: string) => {
  alert(errorMessage || t('errors.general'));
};

const createProduct = async () => {
  const response = await productService.create(productForm.value as CreateProductRequest);
  if (response.success) {
    await handleProductSuccess('admin.productManagement.productAdded');
  } else {
    handleProductError(response.message);
  }
};

const updateProduct = async () => {
  if (!editingProduct.value) return;
  const response = await productService.update(editingProduct.value.id, productForm.value);
  if (response.success) {
    await handleProductSuccess('admin.productManagement.productUpdated');
  } else {
    handleProductError(response.message);
  }
};

const saveProduct = async () => {
  if (!productForm.value.name || !productForm.value.price) {
    alert(t('errors.general'));
    return;
  }

  try {
    if (editingProduct.value) {
      await updateProduct();
    } else {
      await createProduct();
    }
  } catch (error) {
    handleProductError();
  }
};

const deleteProduct = async (product: Product) => {
  if (!confirm(t('admin.productManagement.deleteConfirm', { name: product.name }))) {
    return;
  }

  try {
    const response = await productService.delete(product.id);
    if (response.success) {
      alert(t('admin.productManagement.productDeleted'));
      await fetchProducts();
    } else {
      handleProductError(response.message);
    }
  } catch (error) {
    handleProductError();
  }
};

const viewOrderDetails = (order: Order) => {
  selectedOrder.value = order;
  showOrderModal.value = true;
};

const updateOrderStatus = async (orderId: string, status: Order['status']) => {
  try {
    const response = await adminService.updateOrderStatus(orderId, status);
    if (response.success) {
      alert(t('admin.orderManagement.statusUpdated'));
      await fetchOrders();
      if (selectedOrder.value?.id === orderId) {
        selectedOrder.value = response.data || null;
      }
    } else {
      alert(response.message || t('errors.general'));
    }
  } catch (error) {
    alert(t('errors.general'));
  }
};

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

onMounted(() => {
  fetchProducts();
  fetchOrders();
  fetchUsers();
});
</script>

<template>
  <div class="admin-view">
    <div class="container">
      <h1 class="admin-title">{{ $t('admin.title') }}</h1>

      <!-- Tabs -->
      <div class="tabs">
        <button 
          :class="['tab', { active: activeTab === 'products' }]"
          @click="activeTab = 'products'"
        >
          {{ $t('admin.products') }}
        </button>
        <button 
          :class="['tab', { active: activeTab === 'orders' }]"
          @click="activeTab = 'orders'"
        >
          {{ $t('admin.orders') }}
        </button>
        <button 
          :class="['tab', { active: activeTab === 'users' }]"
          @click="activeTab = 'users'"
        >
          {{ $t('admin.customers') }}
        </button>
      </div>

      <!-- Product Management Tab -->
      <div v-if="activeTab === 'products'" class="tab-content">
        <div class="section-header">
          <h2>{{ $t('admin.productManagement.title') }}</h2>
          <button class="btn btn-primary" @click="openAddProductModal">
            {{ $t('admin.productManagement.addProduct') }}
          </button>
        </div>

        <div v-if="loadingProducts" class="loading">{{ $t('common.loading') }}</div>
        
        <div v-else class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>{{ $t('admin.productManagement.productName') }}</th>
                <th>{{ $t('admin.productManagement.category') }}</th>
                <th>{{ $t('admin.productManagement.price') }}</th>
                <th>{{ $t('products.inStock') }}</th>
                <th>{{ $t('admin.productManagement.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in products" :key="product.id">
                <td>
                  <div class="product-cell">
                    <img :src="product.imageUrl" :alt="product.name" class="product-thumb" />
                    <span>{{ product.name }}</span>
                  </div>
                </td>
                <td>{{ $t(`admin.productManagement.${product.category}`) }}</td>
                <td>{{ formatPrice(product.price) }}</td>
                <td>
                  <span :class="product.inStock ? 'status-completed' : 'status-cancelled'" class="status-badge">
                    {{ product.inStock ? $t('products.inStock') : $t('products.outOfStock') }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn btn-sm btn-secondary" @click="openEditProductModal(product)">
                      {{ $t('common.edit') }}
                    </button>
                    <button class="btn btn-sm btn-danger" @click="deleteProduct(product)">
                      {{ $t('common.delete') }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Order Management Tab -->
      <div v-if="activeTab === 'orders'" class="tab-content">
        <div class="section-header">
          <h2>{{ $t('admin.orderManagement.title') }}</h2>
        </div>

        <div v-if="loadingOrders" class="loading">{{ $t('common.loading') }}</div>
        
        <div v-else class="table-container">
          <table class="admin-table">
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
                  <button class="btn btn-sm btn-secondary" @click="viewOrderDetails(order)">
                    {{ $t('admin.orderManagement.viewDetails') }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- User Management Tab -->
      <div v-if="activeTab === 'users'" class="tab-content">
        <div class="section-header">
          <h2>{{ $t('admin.userManagement.title') }}</h2>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ userStats.total }}</div>
            <div class="stat-label">{{ $t('admin.userManagement.totalUsers') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ userStats.customers }}</div>
            <div class="stat-label">{{ $t('admin.userManagement.totalCustomers') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ userStats.admins }}</div>
            <div class="stat-label">{{ $t('admin.userManagement.totalAdmins') }}</div>
          </div>
        </div>

        <div v-if="loadingUsers" class="loading">{{ $t('common.loading') }}</div>
        
        <div v-else class="table-container">
          <table class="admin-table">
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
      </div>
    </div>

    <!-- Product Modal -->
    <div v-if="showProductModal" class="modal-overlay" @click="showProductModal = false">
      <div class="modal-content" @click.stop>
        <h3>{{ editingProduct ? $t('admin.productManagement.editProduct') : $t('admin.productManagement.addProduct') }}</h3>
        
        <form @submit.prevent="saveProduct">
          <div class="form-group">
            <label>{{ $t('admin.productManagement.productName') }}</label>
            <input v-model="productForm.name" type="text" required />
          </div>

          <div class="form-group">
            <label>{{ $t('admin.productManagement.category') }}</label>
            <select v-model="productForm.category" required>
              <option value="snack">{{ $t('admin.productManagement.snacks') }}</option>
              <option value="drink">{{ $t('admin.productManagement.drinks') }}</option>
              <option value="milk-tea">{{ $t('admin.productManagement.milkTea') }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>{{ $t('admin.productManagement.price') }}</label>
            <input v-model.number="productForm.price" type="number" min="0" step="1000" required />
          </div>

          <div class="form-group">
            <label>{{ $t('products.inStock') }}</label>
            <select v-model="productForm.inStock">
              <option :value="true">{{ $t('products.inStock') }}</option>
              <option :value="false">{{ $t('products.outOfStock') }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>{{ $t('admin.productManagement.imageUrl') }}</label>
            <input v-model="productForm.imageUrl" type="url" />
          </div>

          <div class="form-group">
            <label>{{ $t('admin.productManagement.description') }}</label>
            <textarea v-model="productForm.description" rows="3"></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showProductModal = false">
              {{ $t('common.cancel') }}
            </button>
            <button type="submit" class="btn btn-primary">
              {{ $t('common.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Order Details Modal -->
    <div v-if="showOrderModal && selectedOrder" class="modal-overlay" @click="showOrderModal = false">
      <div class="modal-content" @click.stop>
        <h3>{{ $t('admin.orderManagement.orderDetails') }}</h3>
        
        <div class="order-details">
          <div class="detail-section">
            <h4>{{ $t('admin.orderManagement.orderId') }}</h4>
            <code>{{ selectedOrder.id }}</code>
          </div>

          <div class="detail-section">
            <h4>{{ $t('admin.orderManagement.status') }}</h4>
            <select 
              :value="selectedOrder.status" 
              @change="updateOrderStatus(selectedOrder.id, ($event.target as HTMLSelectElement).value as Order['status'])"
              class="status-select"
            >
              <option value="pending">{{ $t('admin.orderManagement.pending') }}</option>
              <option value="confirmed">{{ $t('admin.orderManagement.confirmed') }}</option>
              <option value="completed">{{ $t('admin.orderManagement.completed') }}</option>
              <option value="cancelled">{{ $t('admin.orderManagement.cancelled') }}</option>
            </select>
          </div>

          <div class="detail-section">
            <h4>{{ $t('admin.orderManagement.customerInfo') }}</h4>
            <p><strong>{{ $t('admin.orderManagement.name') }}:</strong> {{ selectedOrder.customerInfo.name }}</p>
            <p><strong>{{ $t('admin.orderManagement.phone') }}:</strong> {{ selectedOrder.customerInfo.phone }}</p>
            <p v-if="selectedOrder.customerInfo.email"><strong>{{ $t('admin.orderManagement.email') }}:</strong> {{ selectedOrder.customerInfo.email }}</p>
            <p v-if="selectedOrder.customerInfo.address"><strong>{{ $t('admin.orderManagement.address') }}:</strong> {{ selectedOrder.customerInfo.address }}</p>
          </div>

          <div class="detail-section">
            <h4>{{ $t('admin.orderManagement.items') }}</h4>
            <table class="items-table">
              <thead>
                <tr>
                  <th>{{ $t('admin.productManagement.productName') }}</th>
                  <th>{{ $t('admin.orderManagement.quantity') }}</th>
                  <th>{{ $t('admin.orderManagement.price') }}</th>
                  <th>{{ $t('admin.orderManagement.total') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in selectedOrder.items" :key="item.productId">
                  <td>{{ item.productName }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ formatPrice(item.price) }}</td>
                  <td>{{ formatPrice(item.price * item.quantity) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3"><strong>{{ $t('admin.orderManagement.total') }}</strong></td>
                  <td><strong>{{ formatPrice(selectedOrder.totalAmount) }}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div v-if="selectedOrder.notes" class="detail-section">
            <h4>{{ $t('admin.orderManagement.notes') }}</h4>
            <p>{{ selectedOrder.notes }}</p>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showOrderModal = false">
            {{ $t('common.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-view {
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

/* Tabs */
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

/* Tab content */
.tab-content {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 1.5rem;
  color: #2d3748;
  margin: 0;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #718096;
}

/* Table */
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

.product-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* Status badges */
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

/* Stats */
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

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 30px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2d3748;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2d3748;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4299e1;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* Order details */
.order-details {
  margin-bottom: 20px;
}

.detail-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.detail-section:last-child {
  border-bottom: none;
}

.detail-section h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #2d3748;
}

.detail-section p {
  margin: 5px 0;
  color: #4a5568;
}

.detail-section code {
  background: #edf2f7;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
}

.status-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font-size: 1rem;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.items-table th,
.items-table td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.items-table th {
  background: #f7fafc;
  font-weight: 600;
  color: #2d3748;
}

.items-table tfoot td {
  font-weight: 600;
  border-top: 2px solid #cbd5e0;
}

/* Buttons */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #4299e1;
  color: white;
}

.btn-primary:hover {
  background: #3182ce;
}

.btn-secondary {
  background: #718096;
  color: white;
}

.btn-secondary:hover {
  background: #4a5568;
}

.btn-danger {
  background: #f56565;
  color: white;
}

.btn-danger:hover {
  background: #e53e3e;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .admin-view {
    padding: 70px 10px 30px;
  }

  .tab-content {
    padding: 20px;
  }

  .admin-table {
    font-size: 0.875rem;
  }

  .admin-table th,
  .admin-table td {
    padding: 8px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
