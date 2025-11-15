<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useProductStore } from "@/stores/product.store";
import { ProductFilter } from "@/types/product";
import ProductCard from "@/components/ProductCard.vue";

const productStore = useProductStore();
const selectedCategory = ref<string>("");
const showInStockOnly = ref(false);

const categories = [
  { value: "", label: "All Categories" },
  { value: "snack", label: "Snacks" },
  { value: "drink", label: "Drinks" },
  { value: "milk-tea", label: "Milk Tea" },
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

onMounted(() => {
  productStore.fetchProducts();
});
</script>

<template>
  <div class="product-list-view">
    <div class="container">
      <h1>Our Products</h1>

      <div class="filters">
        <div class="filter-group">
          <label for="category">Category:</label>
          <select
            id="category"
            v-model="selectedCategory"
            @change="applyFilters"
          >
            <option
              v-for="category in categories"
              :key="category.value"
              :value="category.value"
            >
              {{ category.label }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>
            <input
              type="checkbox"
              v-model="showInStockOnly"
              @change="applyFilters"
            />
            In Stock Only
          </label>
        </div>
      </div>

      <div v-if="productStore.loading" class="loading">Loading products...</div>

      <div v-else-if="productStore.error" class="error">
        {{ productStore.error }}
      </div>

      <div v-else-if="productStore.products.length === 0" class="no-products">
        No products found matching your criteria.
      </div>

      <div v-else class="products-grid">
        <ProductCard
          v-for="product in productStore.products"
          :key="product.id"
          :product="product"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-list-view {
  padding: 40px 20px;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  font-size: 2.5rem;
  color: #2d3748;
  margin-bottom: 40px;
}

.filters {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
  display: flex;
  gap: 30px;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-weight: 500;
  color: #4a5568;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  min-width: 150px;
}

.filter-group input[type="checkbox"] {
  margin-right: 8px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

.loading,
.error,
.no-products {
  text-align: center;
  padding: 60px 20px;
  font-size: 1.1rem;
}

.error {
  color: #e53e3e;
}

.no-products {
  color: #718096;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .filter-group {
    width: 100%;
  }

  .filter-group select {
    min-width: 100%;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>
