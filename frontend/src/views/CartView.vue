<script setup lang="ts">
import { useCartStore } from "@/stores/cart.store";
import { computed, h } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { CartItem } from "@/types/order";
import {
  ShoppingCartOutlined,
  DeleteOutlined,
  ClearOutlined,
  ShoppingOutlined,
} from "@ant-design/icons-vue";
import { Modal, message } from "ant-design-vue";

const { t } = useI18n();
const cartStore = useCartStore();
const router = useRouter();

const formattedTotal = computed(() => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(cartStore.totalAmount);
});

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const handleClearCart = () => {
  Modal.confirm({
    title: t('cart.clearCartConfirm'),
    content: t('cart.clearCartMessage'),
    okText: t('cart.yesClear'),
    okType: "danger",
    cancelText: t('common.cancel'),
    icon: () => h(ClearOutlined),
    onOk() {
      cartStore.clearCart();
      message.success(t('cart.cartCleared'));
    },
  });
};

const handleRemoveItem = (productId: string, productName: string, variantId?: string) => {
  const variantLabel = variantId ? ` (variant)` : '';
  Modal.confirm({
    title: t('cart.removeItem'),
    content: t('cart.removeItemMessage', { name: productName + variantLabel }),
    okText: t('cart.remove'),
    okType: "danger",
    cancelText: t('common.cancel'),
    onOk() {
      cartStore.removeFromCart(productId, variantId);
      message.success(t('cart.itemRemoved'));
    },
  });
};
</script>

<template>
  <div class="cart-view page">
    <div class="page-container">
      <div class="page-header fade-in">
        <h1>
          <ShoppingCartOutlined />
          {{ $t('cart.title') }}
        </h1>
      </div>

      <a-empty
        v-if="cartStore.items.length === 0"
        :description="$t('cart.empty')"
        class="empty-cart fade-in-up"
      >
        <template #image>
          <ShoppingCartOutlined :style="{ fontSize: '80px', color: '#bfbfbf' }" />
        </template>
        <p class="empty-subtitle">{{ $t('cart.emptySubtitle') }}</p>
        <a-button type="primary" size="large" @click="router.push('/products')">
          <ShoppingOutlined />
          {{ $t('cart.browseProducts') }}
        </a-button>
      </a-empty>

      <a-row v-else :gutter="[24, 24]" class="cart-content">
        <a-col :xs="24" :lg="16">
          <a-card
            :title="$t('cart.cartItems')"
            :bordered="false"
            class="cart-items-card fade-in-up"
          >
            <template #extra>
              <a-button danger @click="handleClearCart">
                <ClearOutlined />
                {{ $t('cart.clearAll') }}
              </a-button>
            </template>

            <a-list
              :data-source="cartStore.items"
              :row-key="(item: CartItem) => item.variantId ? `${item.productId}-${item.variantId}` : item.productId"
            >
              <template #renderItem="{ item }">
                <a-list-item class="cart-item">
                  <template #actions>
                    <a-button
                      type="text"
                      danger
                      @click="handleRemoveItem(item.productId, item.productName, item.variantId)"
                    >
                      <DeleteOutlined />
                    </a-button>
                  </template>

                  <a-list-item-meta>
                    <template #avatar>
                      <a-avatar
                        :size="80"
                        shape="square"
                        :src="item.imageUrl || 'https://via.placeholder.com/80x80?text=No+Image'"
                      />
                    </template>

                    <template #title>
                      <div class="item-title">
                        {{ item.productName }}
                        <a-tag v-if="item.variantSize" color="blue" class="variant-tag">
                          {{ item.variantSize }}
                        </a-tag>
                      </div>
                    </template>

                    <template #description>
                      <div class="item-details">
                        <div class="item-price">
                          {{ formatPrice(item.price) }} × {{ item.quantity }}
                        </div>
                        <div class="item-quantity-control">
                          <a-input-number
                            v-model:value="item.quantity"
                            :min="1"
                            :max="99"
                            size="large"
                            @change="(value: number | undefined) => cartStore.updateQuantity(item.productId, value ?? 1, item.variantId)"
                          />
                        </div>
                        <div class="item-subtotal">
                          <a-tag color="green" class="subtotal-tag">
                            {{ formatPrice(item.price * item.quantity) }}
                          </a-tag>
                        </div>
                      </div>
                    </template>
                  </a-list-item-meta>
                </a-list-item>
              </template>
            </a-list>
          </a-card>
        </a-col>

        <a-col :xs="24" :lg="8">
          <a-affix :offset-top="80">
            <a-card
              :title="$t('cart.orderSummary')"
              :bordered="false"
              class="summary-card fade-in-up"
            >
              <a-descriptions :column="1" bordered>
                <a-descriptions-item :label="$t('cart.subtotal')">
                  <span class="summary-value">{{ formattedTotal }}</span>
                </a-descriptions-item>
                <a-descriptions-item :label="$t('cart.items')">
                  <a-badge
                    :count="cartStore.totalItems"
                    :number-style="{ backgroundColor: '#52c41a' }"
                  />
                </a-descriptions-item>
                <a-descriptions-item :label="$t('cart.shipping')">
                  <a-tag color="green">{{ $t('cart.free') }}</a-tag>
                </a-descriptions-item>
              </a-descriptions>

              <a-divider />

              <div class="total-section">
                <div class="total-label">{{ $t('cart.total') }}</div>
                <div class="total-value">{{ formattedTotal }}</div>
              </div>

              <a-space direction="vertical" :size="12" style="width: 100%; margin-top: 24px">
                <a-button
                  type="primary"
                  size="large"
                  block
                  @click="router.push('/checkout')"
                  class="checkout-button"
                >
                  <ShoppingCartOutlined />
                  {{ $t('cart.proceedToCheckout') }}
                </a-button>
                
                <a-button
                  size="large"
                  block
                  @click="router.push('/products')"
                >
                  <ShoppingOutlined />
                  {{ $t('cart.continueShopping') }}
                </a-button>
              </a-space>
            </a-card>
          </a-affix>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<style scoped>
.cart-view {
  padding: var(--space-lg) 0 var(--space-xl);
}

.page-header {
  text-align: center;
  margin-bottom: var(--space-md);
  padding: var(--space-md) 0 var(--space-sm);
}

.page-header h1 {
  font-size: 2.4rem;
  font-weight: 800;
  color: var(--text-strong);
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.page-header h1 :deep(.anticon) {
  color: var(--brand-primary);
}

.empty-cart {
  padding: 80px 24px;
  background: var(--surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.empty-subtitle {
  font-size: 16px;
  color: var(--text-muted);
  margin: 16px 0 24px;
}

.cart-content {
  animation: fadeInUp 0.6s ease-out;
}

.cart-items-card,
.summary-card {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.cart-items-card :deep(.ant-card-head) {
  border-bottom: 2px solid var(--border-subtle);
}

.cart-items-card :deep(.ant-card-head-title) {
  font-size: 20px;
  font-weight: 600;
}

.cart-item {
  padding: 20px 0;
  transition: all 0.3s ease;
}

.cart-item:hover {
  background: rgba(15, 23, 42, 0.02);
  padding-left: 12px;
  padding-right: 12px;
  border-radius: 8px;
}

.item-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-strong);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.variant-tag {
  font-size: 12px;
  font-weight: 500;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.item-price {
  font-size: 14px;
  color: var(--text-muted);
}

.item-quantity-control {
  display: flex;
  align-items: center;
}

.item-subtotal {
  display: flex;
  align-items: center;
}

.subtotal-tag {
  font-size: 16px;
  font-weight: 600;
  padding: 4px 12px;
}

.summary-card {
  position: sticky;
  top: 96px;
}

.summary-card :deep(.ant-card-head-title) {
  font-size: 18px;
  font-weight: 600;
}

.summary-value {
  font-weight: 600;
  color: var(--text-strong);
}

.total-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.total-label {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-strong);
}

.total-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--brand-accent);
}

.checkout-button {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, var(--brand-accent) 0%, color-mix(in srgb, var(--brand-accent) 80%, var(--text-strong)) 100%);
  border: none;
  transition: all 0.3s ease;
}

.checkout-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(82, 196, 26, 0.3);
}

/* Responsive */
@media (max-width: 992px) {
  .summary-card {
    position: static;
  }
}

@media (max-width: 768px) {
  .cart-view {
    padding: var(--space-md) 0 var(--space-lg);
  }

  .page-header {
    padding: var(--space-sm) 0;
    margin-bottom: 24px;
  }

  .page-header h1 {
    font-size: 2rem;
    flex-direction: column;
    gap: 8px;
  }

  .summary-card {
    position: static;
  }
}

@media (max-width: 576px) {
  .page-header h1 {
    font-size: 1.75rem;
  }
}
</style>
