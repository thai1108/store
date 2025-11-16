<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useProducts } from '@/composables/admin/useProducts';
import { Product, CreateProductRequest } from '@/types/product';
import ProductTable from '@/components/admin/ProductTable.vue';
import ProductModal from '@/components/admin/ProductModal.vue';

const { t } = useI18n();
const { products, loading, fetchProducts, createProduct, updateProduct, deleteProduct } = useProducts();

const showModal = ref(false);
const editingProduct = ref<Product | null>(null);

const openAddModal = () => {
  editingProduct.value = null;
  showModal.value = true;
};

const openEditModal = (product: Product) => {
  editingProduct.value = product;
  showModal.value = true;
};

const handleSave = async (data: Partial<CreateProductRequest>) => {
  const result = editingProduct.value
    ? await updateProduct(editingProduct.value.id, data)
    : await createProduct(data as CreateProductRequest);

  if (result.success) {
    alert(t(editingProduct.value ? 'admin.productManagement.productUpdated' : 'admin.productManagement.productAdded'));
    showModal.value = false;
  } else {
    alert(result.message || t('errors.general'));
  }
};

const handleDelete = async (product: Product) => {
  if (!confirm(t('admin.productManagement.deleteConfirm', { name: product.name }))) {
    return;
  }

  const result = await deleteProduct(product.id);
  if (result.success) {
    alert(t('admin.productManagement.productDeleted'));
  } else {
    alert(result.message || t('errors.general'));
  }
};

onMounted(() => {
  fetchProducts();
});
</script>

<template>
  <div class="admin-products-view">
    <div class="section-header">
      <h2>{{ $t('admin.productManagement.title') }}</h2>
      <button class="btn btn-primary" @click="openAddModal">
        {{ $t('admin.productManagement.addProduct') }}
      </button>
    </div>

    <ProductTable
      :products="products"
      :loading="loading"
      @edit="openEditModal"
      @delete="handleDelete"
    />

    <ProductModal
      :show="showModal"
      :product="editingProduct"
      @close="showModal = false"
      @save="handleSave"
    />
  </div>
</template>

<style scoped>
.admin-products-view {
  padding: 30px;
  background: white;
  border-radius: 8px;
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

@media (max-width: 768px) {
  .admin-products-view {
    padding: 20px;
  }

  .section-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
}
</style>
