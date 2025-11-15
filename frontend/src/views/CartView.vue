<script setup lang="ts">
import { useCartStore } from "@/stores/cart.store";
import { computed, h } from "vue";
import { useRouter } from "vue-router";
import { CartItem } from "@/types/order";
import {
  ShoppingCartOutlined,
  DeleteOutlined,
  ClearOutlined,
  ShoppingOutlined,
} from "@ant-design/icons-vue";
import { Modal, message } from "ant-design-vue";

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
    title: "Clear Shopping Cart",
    content: "Are you sure you want to remove all items from your cart?",
    okText: "Yes, Clear Cart",
    okType: "danger",
    cancelText: "Cancel",
    icon: () => h(ClearOutlined),
    onOk() {
      cartStore.clearCart();
      message.success("Cart cleared successfully");
    },
  });
};

const handleRemoveItem = (productId: string, productName: string) => {
  Modal.confirm({
    title: "Remove Item",
    content: `Remove "${productName}" from cart?`,
    okText: "Remove",
    okType: "danger",
    cancelText: "Cancel",
    onOk() {
      cartStore.removeFromCart(productId);
      message.success("Item removed from cart");
    },
  });
};
</script>

<template>
  <div class="cart-view">
    <div class="container">
      <div class="page-header fade-in">
        <h1>
          <ShoppingCartOutlined />
          Shopping Cart
        </h1>
      </div>

      <a-empty
        v-if="cartStore.items.length === 0"
        description="Your cart is empty"
        class="empty-cart fade-in-up"
      >
        <template #image>
          <ShoppingCartOutlined :style="{ fontSize: '80px', color: '#bfbfbf' }" />
        </template>
        <p class="empty-subtitle">Add some delicious items to get started!</p>
        <a-button type="primary" size="large" @click="router.push('/products')">
          <ShoppingOutlined />
          Browse Products
        </a-button>
      </a-empty>

      <a-row v-else :gutter="[24, 24]" class="cart-content">
        <a-col :xs="24" :lg="16">
          <a-card
            title="Cart Items"
            :bordered="false"
            class="cart-items-card fade-in-up"
          >
            <template #extra>
              <a-button danger @click="handleClearCart">
                <ClearOutlined />
                Clear All
              </a-button>
            </template>

            <a-list
              :data-source="cartStore.items"
              :row-key="(item: CartItem) => item.productId"
            >
              <template #renderItem="{ item }">
                <a-list-item class="cart-item">
                  <template #actions>
                    <a-button
                      type="text"
                      danger
                      @click="handleRemoveItem(item.productId, item.productName)"
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
                      <div class="item-title">{{ item.productName }}</div>
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
                            @change="(value: number | undefined) => cartStore.updateQuantity(item.productId, value ?? 1)"
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
              title="Order Summary"
              :bordered="false"
              class="summary-card fade-in-up"
            >
              <a-descriptions :column="1" bordered>
                <a-descriptions-item label="Subtotal">
                  <span class="summary-value">{{ formattedTotal }}</span>
                </a-descriptions-item>
                <a-descriptions-item label="Items">
                  <a-badge
                    :count="cartStore.totalItems"
                    :number-style="{ backgroundColor: '#52c41a' }"
                  />
                </a-descriptions-item>
                <a-descriptions-item label="Shipping">
                  <a-tag color="green">FREE</a-tag>
                </a-descriptions-item>
              </a-descriptions>

              <a-divider />

              <div class="total-section">
                <div class="total-label">Total</div>
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
                  Proceed to Checkout
                </a-button>
                
                <a-button
                  size="large"
                  block
                  @click="router.push('/products')"
                >
                  <ShoppingOutlined />
                  Continue Shopping
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
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.page-header h1 :deep(.anticon) {
  color: #1890ff;
}

.empty-cart {
  padding: 80px 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.empty-subtitle {
  font-size: 16px;
  color: #8c8c8c;
  margin: 16px 0 24px;
}

.cart-content {
  animation: fadeInUp 0.6s ease-out;
}

.cart-items-card,
.summary-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.cart-items-card :deep(.ant-card-head) {
  border-bottom: 2px solid #f0f0f0;
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
  background: #fafafa;
  padding-left: 12px;
  padding-right: 12px;
  border-radius: 8px;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 8px;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.item-price {
  font-size: 14px;
  color: #8c8c8c;
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
  color: #262626;
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
  color: #262626;
}

.total-value {
  font-size: 24px;
  font-weight: 700;
  color: #52c41a;
}

.checkout-button {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
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

  .empty-cart {
    padding: 60px 16px;
  }

  .cart-item {
    padding: 16px 0;
  }

  .item-details {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }

  .item-quantity-control {
    flex: 1;
  }

  :deep(.ant-list-item-action) {
    margin-top: 16px;
  }
}

@media (max-width: 576px) {
  .page-header h1 {
    font-size: 1.75rem;
  }

  .total-label {
    font-size: 16px;
  }

  .total-value {
    font-size: 20px;
  }

  .item-details {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
