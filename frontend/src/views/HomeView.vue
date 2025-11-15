<script setup lang="ts">
import { onMounted } from "vue";
import { useProductStore } from "@/stores/product.store";
import ProductCard from "@/components/ProductCard.vue";

const productStore = useProductStore();

onMounted(() => {
  productStore.fetchProducts();
});
</script>

<template>
  <div class="home-view">
    <section class="hero">
      <div class="hero-content">
        <h1>Welcome to TeaStore</h1>
        <p>Discover the finest selection of snacks, drinks, and milk tea</p>
        <router-link to="/products" class="cta-button">
          Browse Products
        </router-link>
      </div>
    </section>

    <section class="featured-products">
      <div class="container">
        <h2>Featured Products</h2>

        <div v-if="productStore.loading" class="loading">
          Loading products...
        </div>

        <div v-else-if="productStore.error" class="error">
          {{ productStore.error }}
        </div>

        <div v-else class="products-grid">
          <ProductCard
            v-for="product in productStore.products.slice(0, 6)"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-view {
  min-height: 100vh;
}

.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 120px 20px 80px;
  text-align: center;
}

.hero-content h1 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 20px;
}

.hero-content p {
  font-size: 1.2rem;
  margin-bottom: 30px;
  opacity: 0.9;
}

.cta-button {
  background-color: white;
  color: #667eea;
  padding: 15px 30px;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: transform 0.2s;
  display: inline-block;
}

.cta-button:hover {
  transform: translateY(-2px);
}

.featured-products {
  padding: 80px 20px;
  background-color: #f7fafc;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.featured-products h2 {
  text-align: center;
  font-size: 2.5rem;
  color: #2d3748;
  margin-bottom: 50px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.loading,
.error {
  text-align: center;
  padding: 40px;
  font-size: 1.1rem;
}

.error {
  color: #e53e3e;
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2rem;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>
