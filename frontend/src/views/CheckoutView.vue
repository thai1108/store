<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@/stores/auth.store";
import { orderService } from "@/services/order-service";

const { t } = useI18n();
const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

const form = ref({
  name: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
});

const loading = ref(false);
const error = ref("");
const success = ref(false);

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

const handleSubmit = async () => {
  if (!form.value.name || !form.value.phone) {
    error.value = t('checkout.validation.required');
    return;
  }

  if (cartStore.items.length === 0) {
    error.value = t('checkout.validation.emptyCart');
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const orderData = {
      items: cartStore.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      customerInfo: {
        name: form.value.name,
        phone: form.value.phone,
        email: form.value.email || undefined,
        address: form.value.address || undefined,
      },
      notes: form.value.notes || undefined,
    };

    const result = await orderService.create(orderData);

    if (result.success) {
      success.value = true;
      cartStore.clearCart();

      setTimeout(() => {
        if (authStore.isAuthenticated) {
          router.push("/orders");
        } else {
          router.push("/");
        }
      }, 2000);
    } else {
      error.value = result.message || t('checkout.failed');
    }
  } catch (err) {
    error.value = t('errors.network');
  } finally {
    loading.value = false;
  }
};

// Pre-fill form with user data if authenticated
if (authStore.isAuthenticated && authStore.user) {
  form.value.name = authStore.user.name;
  form.value.email = authStore.user.email;
  form.value.phone = authStore.user.phone || "";
}
</script>

<template>
  <div class="checkout-view">
    <div class="container">
      <h1>{{ $t('checkout.title') }}</h1>

      <div v-if="success" class="alert alert-success">
        {{ $t('checkout.success') }}
      </div>

      <div v-else class="checkout-content">
        <div class="checkout-form">
          <div class="card">
            <h2>{{ $t('checkout.customerInfo') }}</h2>

            <div v-if="error" class="alert alert-error">
              {{ error }}
            </div>

            <form @submit.prevent="handleSubmit">
              <div class="form-group">
                <label for="name"
                  >{{ $t('checkout.name') }} <span class="required">*</span>:</label
                >
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  class="form-control"
                  :placeholder="$t('checkout.namePlaceholder')"
                  required
                />
              </div>

              <div class="form-group">
                <label for="phone"
                  >{{ $t('checkout.phone') }} <span class="required">*</span>:</label
                >
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  class="form-control"
                  :placeholder="$t('checkout.phonePlaceholder')"
                  required
                />
              </div>

              <div class="form-group">
                <label for="email">{{ $t('checkout.email') }}:</label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  class="form-control"
                  :placeholder="$t('checkout.emailPlaceholder')"
                />
              </div>

              <div class="form-group">
                <label for="address">{{ $t('checkout.address') }}:</label>
                <textarea
                  id="address"
                  v-model="form.address"
                  class="form-control"
                  rows="3"
                  :placeholder="$t('checkout.addressPlaceholder')"
                ></textarea>
              </div>

              <div class="form-group">
                <label for="notes">{{ $t('checkout.notes') }}:</label>
                <textarea
                  id="notes"
                  v-model="form.notes"
                  class="form-control"
                  rows="3"
                  :placeholder="$t('checkout.notesPlaceholder')"
                ></textarea>
              </div>

              <button
                type="submit"
                class="btn btn-success"
                :disabled="loading || cartStore.items.length === 0"
              >
                <span v-if="loading" class="loading-spinner"></span>
                <span v-else>{{ $t('checkout.placeOrder') }} ({{ formattedTotal }})</span>
              </button>
            </form>
          </div>
        </div>

        <div class="order-summary">
          <div class="card">
            <h2>{{ $t('checkout.orderSummary') }}</h2>

            <div class="order-items">
              <div
                v-for="item in cartStore.items"
                :key="item.productId"
                class="order-item"
              >
                <div class="item-info">
                  <h4>{{ item.productName }}</h4>
                  <p>{{ formatPrice(item.price) }} × {{ item.quantity }}</p>
                </div>
                <div class="item-total">
                  {{ formatPrice(item.price * item.quantity) }}
                </div>
              </div>
            </div>

            <div class="order-total">
              <div class="total-row">
                <span>{{ $t('checkout.subtotal') }}:</span>
                <span>{{ formattedTotal }}</span>
              </div>
              <div class="total-row final-total">
                <span>{{ $t('checkout.total') }}:</span>
                <span>{{ formattedTotal }}</span>
              </div>
            </div>

            <div class="payment-note">
              <p><strong>{{ $t('checkout.payment') }}:</strong> {{ $t('checkout.paymentMethod') }}</p>
              <p class="text-muted">
                {{ $t('checkout.paymentNote') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkout-view {
  padding: 40px 20px;
  min-height: 100vh;
  background-color: #f7fafc;
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

.checkout-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 40px;
}

.card h2 {
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.required {
  color: #e53e3e;
}

.order-items {
  margin-bottom: 24px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #edf2f7;
}

.order-item:last-child {
  border-bottom: none;
}

.item-info h4 {
  font-size: 1rem;
  color: #2d3748;
  margin-bottom: 4px;
}

.item-info p {
  color: #718096;
  font-size: 0.9rem;
}

.item-total {
  font-weight: 600;
  color: #2d3748;
}

.order-total {
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #4a5568;
}

.final-total {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2d3748;
  border-top: 1px solid #e2e8f0;
  padding-top: 12px;
  margin-top: 12px;
}

.payment-note {
  background-color: #f7fafc;
  padding: 16px;
  border-radius: 8px;
  margin-top: 24px;
}

.payment-note p {
  margin-bottom: 8px;
}

.payment-note p:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }
}
</style>
