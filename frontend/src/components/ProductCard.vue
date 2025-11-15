<script setup lang="ts">
import { computed } from "vue";
import { Product } from "@/types/product";
import { useCartStore } from "@/stores/cart.store";

interface Props {
  product: Product;
}

const props = defineProps<Props>();
const cartStore = useCartStore();

const formattedPrice = computed(() => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(props.product.price);
});

const addToCart = () => {
  cartStore.addToCart(props.product);
};
</script>

<template>
  <div class="product-card">
    <div class="product-image">
      <img
        v-if="product.imageUrl"
        :src="product.imageUrl"
        :alt="product.name"
        @error="
          $event.target.src =
            'https://via.placeholder.com/300x200?text=No+Image'
        "
      />
      <div v-else class="no-image">📷 No Image</div>

      <div v-if="!product.inStock" class="out-of-stock">Out of Stock</div>
    </div>

    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <p class="product-description">{{ product.description }}</p>

      <div class="product-footer">
        <div class="price-category">
          <span class="price">{{ formattedPrice }}</span>
          <span class="category">{{ product.category }}</span>
        </div>

        <button
          @click="addToCart"
          :disabled="!product.inStock"
          class="add-to-cart-btn"
        >
          Add to Cart
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.product-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f7fafc;
  color: #a0aec0;
  font-size: 1.2rem;
}

.out-of-stock {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #e53e3e;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.product-info {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
  line-height: 1.4;
}

.product-description {
  color: #718096;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 16px;
  flex: 1;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.price-category {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.price {
  font-size: 1.1rem;
  font-weight: 700;
  color: #48bb78;
}

.category {
  font-size: 0.8rem;
  color: #a0aec0;
  background-color: #edf2f7;
  padding: 2px 8px;
  border-radius: 12px;
  text-transform: capitalize;
}

.add-to-cart-btn {
  background-color: #3182ce;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.add-to-cart-btn:hover:not(:disabled) {
  background-color: #2c5aa0;
}

.add-to-cart-btn:disabled {
  background-color: #cbd5e0;
  cursor: not-allowed;
}
</style>
