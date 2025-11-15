<script setup lang="ts">
import { computed, h } from "vue";
import { Product } from "@/types/product";
import { useCartStore } from "@/stores/cart.store";
import { ShoppingCartOutlined, CheckCircleOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";

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

const categoryColor = computed(() => {
  const colors: Record<string, string> = {
    snack: "orange",
    drink: "blue",
    "milk-tea": "purple",
  };
  return colors[props.product.category] || "default";
});

const addToCart = () => {
  if (props.product.inStock) {
    cartStore.addToCart(props.product);
    message.success({
      content: `Added ${props.product.name} to cart!`,
      icon: () => h(CheckCircleOutlined),
    });
  }
};
</script>

<template>
  <a-card
    hoverable
    class="product-card hover-lift"
    :class="{ 'out-of-stock-card': !product.inStock }"
  >
    <template #cover>
      <div class="product-image-wrapper">
        <img
          v-if="product.imageUrl"
          :src="product.imageUrl"
          :alt="product.name"
          class="product-image"
          @error="
            ($event.target as HTMLImageElement).src =
              'https://via.placeholder.com/300x200?text=No+Image'
          "
        />
        <div v-else class="no-image">
          <span class="no-image-icon">📷</span>
          <span>No Image</span>
        </div>

        <a-tag
          v-if="!product.inStock"
          color="red"
          class="stock-badge"
        >
          Out of Stock
        </a-tag>
        <a-tag
          v-else
          color="green"
          class="stock-badge"
        >
          In Stock
        </a-tag>
      </div>
    </template>

    <a-card-meta :title="product.name">
      <template #description>
        <div class="product-description">
          {{ product.description }}
        </div>
      </template>
    </a-card-meta>

    <div class="product-footer">
      <div class="product-info">
        <div class="price">{{ formattedPrice }}</div>
        <a-tag :color="categoryColor" class="category-tag">
          {{ product.category }}
        </a-tag>
      </div>

      <a-button
        type="primary"
        :disabled="!product.inStock"
        @click="addToCart"
        class="add-to-cart-btn"
        size="large"
      >
        <template #icon>
          <ShoppingCartOutlined />
        </template>
        Add to Cart
      </a-button>
    </div>
  </a-card>
</template>

<style scoped>
.product-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  animation: fadeInUp 0.6s ease-out;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.product-card.out-of-stock-card {
  opacity: 0.7;
}

.product-image-wrapper {
  position: relative;
  height: 220px;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover .product-image {
  transform: scale(1.1);
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #bfbfbf;
  font-size: 14px;
}

.no-image-icon {
  font-size: 48px;
}

.stock-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  font-weight: 600;
  animation: scaleIn 0.4s ease-out;
}

.product-description {
  color: #8c8c8c;
  font-size: 14px;
  line-height: 1.6;
  margin: 12px 0;
  min-height: 44px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.product-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.price {
  font-size: 24px;
  font-weight: 700;
  color: #52c41a;
  animation: pulse 2s ease-in-out infinite;
}

.category-tag {
  text-transform: capitalize;
  font-size: 12px;
  border-radius: 12px;
}

.add-to-cart-btn {
  width: 100%;
  height: 40px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.add-to-cart-btn:not(:disabled):hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

.add-to-cart-btn:active {
  transform: scale(0.98);
}

/* Responsive */
@media (max-width: 768px) {
  .product-image-wrapper {
    height: 180px;
  }

  .price {
    font-size: 20px;
  }

  .add-to-cart-btn {
    font-size: 14px;
  }
}

/* Deep styles for Ant Design components */
:deep(.ant-card-body) {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 20px;
}

:deep(.ant-card-meta-title) {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 8px;
  white-space: normal;
  line-height: 1.4;
}
</style>
