<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useProductStore } from "@/stores/product.store";
import { ProductFilter } from "@/types/product";
import ProductCard from "@/components/ProductCard.vue";
import { FilterOutlined, ReloadOutlined } from "@ant-design/icons-vue";

const productStore = useProductStore();
const selectedCategory = ref<string>("");
const showInStockOnly = ref(false);
const searchText = ref("");

const categories = [
  { value: "", label: "All Categories" },
  { value: "snack", label: "🍿 Snacks" },
  { value: "drink", label: "🥤 Drinks" },
  { value: "milk-tea", label: "🧋 Milk Tea" },
];

const applyFilters = () => {
  const filter: ProductFilter = {};

  if (selectedCategory.value) {
    filter.category = selectedCategory.value;
  }

  if (showInStockOnly.value) {
    filter.inStock = true;
  }

  productStore.fetchProducts(filter);
};

const resetFilters = () => {
  selectedCategory.value = "";
  showInStockOnly.value = false;
  searchText.value = "";
  productStore.fetchProducts();
};

const filteredProducts = computed(() => {
  if (!searchText.value) return productStore.products;
  
  const search = searchText.value.toLowerCase();
  return productStore.products.filter(
    (product) =>
      product.name.toLowerCase().includes(search) ||
      product.description.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search)
  );
});

const productCount = computed(() => filteredProducts.value.length);

onMounted(() => {
  productStore.fetchProducts();
});
</script>

<template>
  <div class="product-list-view">
    <div class="container">
      <!-- Page Header -->
      <div class="page-header fade-in">
        <h1>
          <FilterOutlined />
          Our Products
        </h1>
        <p>Explore our amazing collection of snacks, drinks, and milk tea</p>
      </div>

      <!-- Filters Card -->
      <a-card class="filters-card fade-in-up" :bordered="false">
        <a-row :gutter="[16, 16]" align="middle">
          <a-col :xs="24" :sm="12" :md="6">
            <a-select
              v-model:value="selectedCategory"
              placeholder="Select Category"
              style="width: 100%"
              size="large"
              @change="applyFilters"
            >
              <a-select-option
                v-for="category in categories"
                :key="category.value"
                :value="category.value"
              >
                {{ category.label }}
              </a-select-option>
            </a-select>
          </a-col>

          <a-col :xs="24" :sm="12" :md="8">
            <a-input-search
              v-model:value="searchText"
              placeholder="Search products..."
              size="large"
              allow-clear
            />
          </a-col>

          <a-col :xs="24" :sm="12" :md="6">
            <a-checkbox
              v-model:checked="showInStockOnly"
              @change="applyFilters"
              class="stock-checkbox"
            >
              <span class="checkbox-label">
                <span class="checkbox-icon">✓</span>
                In Stock Only
              </span>
            </a-checkbox>
          </a-col>

          <a-col :xs="24" :sm="12" :md="4">
            <a-button
              block
              size="large"
              @click="resetFilters"
            >
              <ReloadOutlined />
              Reset
            </a-button>
          </a-col>
        </a-row>

        <a-divider />

        <div class="filter-summary">
          <a-tag color="blue" class="result-tag">
            {{ productCount }} {{ productCount === 1 ? 'Product' : 'Products' }} Found
          </a-tag>
          <a-tag v-if="selectedCategory" color="purple" closable @close="selectedCategory = ''; applyFilters()">
            {{ categories.find(c => c.value === selectedCategory)?.label }}
          </a-tag>
          <a-tag v-if="showInStockOnly" color="green" closable @close="showInStockOnly = false; applyFilters()">
            In Stock Only
          </a-tag>
          <a-tag v-if="searchText" color="orange" closable @close="searchText = ''">
            Search: "{{ searchText }}"
          </a-tag>
        </div>
      </a-card>

      <!-- Products Grid -->
      <div class="products-section">
        <a-spin :spinning="productStore.loading" size="large" tip="Loading products...">
          <div v-if="productStore.error" class="error-state">
            <a-result
              status="error"
              title="Failed to load products"
              :sub-title="productStore.error"
            >
              <template #extra>
                <a-button type="primary" @click="productStore.fetchProducts()">
                  Try Again
                </a-button>
              </template>
            </a-result>
          </div>

          <a-empty
            v-else-if="filteredProducts.length === 0 && !productStore.loading"
            description="No products found matching your criteria"
          >
            <a-button type="primary" @click="resetFilters">
              Reset Filters
            </a-button>
          </a-empty>

          <a-row v-else :gutter="[24, 24]" class="products-grid">
            <a-col
              v-for="product in filteredProducts"
              :key="product.id"
              :xs="24"
              :sm="12"
              :md="12"
              :lg="8"
              :xl="8"
            >
              <ProductCard :product="product" />
            </a-col>
          </a-row>
        </a-spin>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-list-view {
  padding: 40px 24px 80px;
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f2f5 0%, #ffffff 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 20px 20px;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #262626;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.page-header h1 :deep(.anticon) {
  color: #1890ff;
}

.page-header p {
  font-size: 1.1rem;
  color: #8c8c8c;
  margin: 0;
}

.filters-card {
  margin-bottom: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  animation: fadeInUp 0.6s ease-out 0.2s backwards;
}

.filters-card :deep(.ant-card-body) {
  padding: 24px;
}

.stock-checkbox {
  font-size: 16px;
  font-weight: 500;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: #52c41a;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.filter-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.result-tag {
  font-weight: 600;
  font-size: 14px;
  padding: 4px 12px;
}

.products-section {
  animation: fadeInUp 0.6s ease-out 0.4s backwards;
}

.products-grid {
  min-height: 400px;
}

.error-state {
  padding: 60px 0;
}

/* Responsive */
@media (max-width: 768px) {
  .product-list-view {
    padding: 24px 16px 60px;
  }

  .page-header {
    padding: 20px 0;
    margin-bottom: 24px;
  }

  .page-header h1 {
    font-size: 2rem;
    flex-direction: column;
    gap: 8px;
  }

  .page-header p {
    font-size: 1rem;
  }

  .filters-card :deep(.ant-card-body) {
    padding: 16px;
  }

  .filter-summary {
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .page-header h1 {
    font-size: 1.75rem;
  }
}

/* Loading overlay */
:deep(.ant-spin-container) {
  min-height: 400px;
}

:deep(.ant-spin-nested-loading) {
  position: relative;
}

/* Empty state */
:deep(.ant-empty) {
  padding: 60px 20px;
}
</style>
