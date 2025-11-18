<script setup lang="ts">
import { computed, h, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Product, ProductVariant } from "@/types/product";
import { useCartStore } from "@/stores/cart.store";
import { ShoppingCartOutlined, CheckCircleOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";

interface Props {
  product: Product;
}

const { t } = useI18n();
const props = defineProps<Props>();
const cartStore = useCartStore();

const selectedVariant = ref<ProductVariant | null>(null);
const currentImageIndex = ref(0);

const hasVariants = computed(() => {
  return props.product.variants && props.product.variants.length > 0;
});

const displayImages = computed(() => {
  if (props.product.images && props.product.images.length > 0) {
    return props.product.images.map(img => img.imageUrl);
  }
  return props.product.imageUrl ? [props.product.imageUrl] : [];
});

const currentImage = computed(() => {
  return displayImages.value[currentImageIndex.value] || '';
});

const formattedPrice = computed(() => {
  let price = props.product.price;
  if (selectedVariant.value && selectedVariant.value.priceAdjustment) {
    price += selectedVariant.value.priceAdjustment;
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
});

const categoryColor = computed(() => {
  const colors: Record<string, string> = {
    snack: "orange",
    drink: "blue",
    "milk-tea": "purple",
  };
  return colors[props.product.category] || "default";
});

const isInStock = computed(() => {
  if (hasVariants.value) {
    if (selectedVariant.value) {
      return selectedVariant.value.stock > 0;
    }
    // If has variants but none selected, check if any variant has stock
    return props.product.variants!.some(v => v.stock > 0);
  }
  return props.product.inStock;
});

const addToCart = () => {
  if (hasVariants.value && !selectedVariant.value) {
    message.warning('Please select a size');
    return;
  }
  
  if (isInStock.value) {
    cartStore.addToCart(props.product, selectedVariant.value || undefined);
    message.success({
      content: t('products.addedToCart', { name: props.product.name }),
      icon: () => h(CheckCircleOutlined),
    });
  }
};

const selectVariant = (variant: ProductVariant) => {
  selectedVariant.value = variant;
};

const nextImage = () => {
  if (displayImages.value.length > 1) {
    currentImageIndex.value = (currentImageIndex.value + 1) % displayImages.value.length;
  }
};

const prevImage = () => {
  if (displayImages.value.length > 1) {
    currentImageIndex.value = (currentImageIndex.value - 1 + displayImages.value.length) % displayImages.value.length;
  }
};
</script>

<template>
  <a-card
    hoverable
    class="product-card hover-lift"
    :class="{ 'out-of-stock-card': !isInStock }"
  >
    <template #cover>
      <div class="product-image-wrapper">
        <img
          v-if="currentImage"
          :src="currentImage"
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

        <!-- Image navigation buttons -->
        <template v-if="displayImages.length > 1">
          <button class="image-nav prev" @click.stop="prevImage">‹</button>
          <button class="image-nav next" @click.stop="nextImage">›</button>
          <div class="image-indicators">
            <span 
              v-for="(_, idx) in displayImages" 
              :key="idx" 
              :class="{ active: idx === currentImageIndex }"
              @click.stop="currentImageIndex = idx"
            ></span>
          </div>
        </template>

        <a-tag
          v-if="!isInStock"
          color="red"
          class="stock-badge"
        >
          {{ $t('products.outOfStock') }}
        </a-tag>
        <a-tag
          v-else
          color="green"
          class="stock-badge"
        >
          {{ $t('products.inStock') }}
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
      <!-- Variant Selection -->
      <div v-if="hasVariants" class="variants-section">
        <div class="variants-label">Select Size:</div>
        <div class="variants-buttons">
          <button
            v-for="variant in product.variants"
            :key="variant.id"
            :class="['variant-btn', { 
              selected: selectedVariant?.id === variant.id,
              'out-of-stock': variant.stock <= 0
            }]"
            :disabled="variant.stock <= 0"
            @click="selectVariant(variant)"
          >
            {{ variant.size }}
            <span v-if="variant.stock <= 0" class="stock-label">(Out)</span>
          </button>
        </div>
      </div>

      <div class="product-info">
        <div class="price">{{ formattedPrice }}</div>
        <a-tag :color="categoryColor" class="category-tag">
          {{ product.category }}
        </a-tag>
      </div>

      <a-button
        type="primary"
        :disabled="!isInStock"
        @click="addToCart"
        class="add-to-cart-btn"
        size="large"
      >
        <template #icon>
          <ShoppingCartOutlined />
        </template>
        {{ $t('products.addToCart') }}
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

.image-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  z-index: 2;
}

.image-nav:hover {
  background: rgba(0, 0, 0, 0.7);
}

.image-nav.prev {
  left: 10px;
}

.image-nav.next {
  right: 10px;
}

.image-indicators {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 2;
}

.image-indicators span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s;
}

.image-indicators span.active {
  background: white;
  width: 24px;
  border-radius: 4px;
}

.stock-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  font-weight: 600;
  animation: scaleIn 0.4s ease-out;
  z-index: 2;
}

.product-description {
  color: #8c8c8c;
  font-size: 14px;
  line-height: 1.6;
  margin: 12px 0;
  min-height: 44px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.variants-section {
  margin-bottom: 16px;
}

.variants-label {
  font-size: 13px;
  font-weight: 600;
  color: #595959;
  margin-bottom: 8px;
}

.variants-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.variant-btn {
  padding: 6px 14px;
  border: 2px solid #d9d9d9;
  background: white;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.variant-btn:hover:not(:disabled) {
  border-color: #40a9ff;
  color: #40a9ff;
}

.variant-btn.selected {
  border-color: #1890ff;
  background: #1890ff;
  color: white;
}

.variant-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f5;
}

.variant-btn .stock-label {
  font-size: 11px;
  margin-left: 4px;
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
  
  .variant-btn {
    font-size: 12px;
    padding: 5px 12px;
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
