<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useProductStore } from "@/stores/product.store";
import ProductCard from "@/components/ProductCard.vue";
import { useI18n } from "vue-i18n";
import {
  ShoppingOutlined,
  RocketOutlined,
  SafetyOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons-vue";

const productStore = useProductStore();
const router = useRouter();
const { t } = useI18n();

onMounted(() => {
  productStore.fetchProducts();
});

const features = computed(() => [
  {
    icon: ShoppingOutlined,
    title: t('home.features.wideSelection'),
    description: t('home.features.wideSelectionDesc'),
  },
  {
    icon: RocketOutlined,
    title: t('home.features.fastDelivery'),
    description: t('home.features.fastDeliveryDesc'),
  },
  {
    icon: SafetyOutlined,
    title: t('home.features.qualityAssured'),
    description: t('home.features.qualityAssuredDesc'),
  },
  {
    icon: CustomerServiceOutlined,
    title: t('home.features.support247'),
    description: t('home.features.support247Desc'),
  },
]);
</script>

<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="hero gradient-primary">
      <div class="hero-content fade-in">
        <h1 class="hero-title">{{ $t('home.title') }}</h1>
        <p class="hero-subtitle">
          {{ $t('home.subtitle') }}
        </p>
        <div class="hero-actions">
          <a-button
            type="primary"
            size="large"
            @click="router.push('/products')"
            class="cta-button hover-scale"
          >
            <ShoppingOutlined />
            {{ $t('home.browseProducts') }}
          </a-button>
          <a-button
            size="large"
            @click="router.push('/register')"
            class="secondary-button"
          >
            {{ $t('home.joinNow') }}
          </a-button>
        </div>
      </div>
      <div class="hero-decoration">
        <div class="bubble bubble-1"></div>
        <div class="bubble bubble-2"></div>
        <div class="bubble bubble-3"></div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <a-row :gutter="[24, 24]">
          <a-col
            v-for="(feature, index) in features"
            :key="index"
            :xs="24"
            :sm="12"
            :lg="6"
          >
            <a-card class="feature-card hover-lift" :bordered="false">
              <div class="feature-icon">
                <component :is="feature.icon" />
              </div>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </section>

    <!-- Featured Products Section -->
    <section class="featured-products">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">{{ $t('home.featuredProducts') }}</h2>
          <p class="section-subtitle">
            {{ $t('home.featuredProductsSubtitle') }}
          </p>
        </div>

        <a-spin :spinning="productStore.loading" size="large">
          <div v-if="productStore.error" class="error-state">
            <a-result
              status="error"
              :title="$t('products.failedToLoad')"
              :sub-title="productStore.error"
            >
              <template #extra>
                <a-button
                  type="primary"
                  @click="productStore.fetchProducts()"
                >
                  {{ $t('products.tryAgain') }}
                </a-button>
              </template>
            </a-result>
          </div>

          <a-row
            v-else
            :gutter="[24, 24]"
            class="products-grid"
          >
            <a-col
              v-for="product in productStore.products.slice(0, 6)"
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

        <div class="view-more">
          <a-button
            type="primary"
            size="large"
            @click="router.push('/products')"
            class="hover-scale"
          >
            {{ $t('home.viewAllProducts') }}
          </a-button>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section gradient-success">
      <div class="container">
        <div class="cta-content fade-in">
          <h2>{{ $t('home.readyToShop') }}</h2>
          <p>{{ $t('home.readyToShopText') }}</p>
          <a-button
            type="primary"
            size="large"
            ghost
            @click="router.push('/register')"
            class="hover-scale"
          >
            {{ $t('home.createFreeAccount') }}
          </a-button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-view {
  min-height: 100vh;
}

/* Hero Section */
.hero {
  position: relative;
  padding: 120px 24px 100px;
  text-align: center;
  overflow: hidden;
  color: white;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 24px;
  line-height: 1.2;
  animation: fadeInUp 0.8s ease-out;
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 40px;
  opacity: 0.95;
  line-height: 1.6;
  animation: fadeInUp 0.8s ease-out 0.2s backwards;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  animation: fadeInUp 0.8s ease-out 0.4s backwards;
}

.cta-button,
.secondary-button {
  height: 48px;
  padding: 0 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 24px;
  transition: all 0.3s ease;
}

.secondary-button {
  background: white;
  color: #667eea;
  border: none;
}

.secondary-button:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

/* Hero Decorations */
.hero-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1;
}

.bubble {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite ease-in-out;
}

.bubble-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  left: -100px;
  animation-delay: 0s;
}

.bubble-2 {
  width: 200px;
  height: 200px;
  top: 50%;
  right: -50px;
  animation-delay: 7s;
}

.bubble-3 {
  width: 150px;
  height: 150px;
  bottom: -75px;
  left: 30%;
  animation-delay: 14s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-50px) rotate(180deg);
  }
}

/* Features Section */
.features-section {
  padding: 80px 24px;
  background: #fff;
}

.feature-card {
  text-align: center;
  padding: 32px 24px;
  border-radius: 16px;
  background: linear-gradient(135deg, #f6f9fc 0%, #ffffff 100%);
  transition: all 0.3s ease;
  animation: fadeInUp 0.6s ease-out;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
}

.feature-icon {
  font-size: 48px;
  color: #1890ff;
  margin-bottom: 16px;
  animation: pulse 2s ease-in-out infinite;
}

.feature-card h3 {
  font-size: 20px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 12px;
}

.feature-card p {
  color: #8c8c8c;
  line-height: 1.6;
  margin: 0;
}

/* Featured Products Section */
.featured-products {
  padding: 80px 24px;
  background: #f0f2f5;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #262626;
  margin-bottom: 16px;
  animation: fadeInUp 0.6s ease-out;
}

.section-subtitle {
  font-size: 1.1rem;
  color: #8c8c8c;
  animation: fadeInUp 0.6s ease-out 0.1s backwards;
}

.products-grid {
  margin-bottom: 48px;
}

.error-state {
  padding: 40px 0;
}

.view-more {
  text-align: center;
  padding-top: 24px;
}

/* CTA Section */
.cta-section {
  padding: 100px 24px;
  text-align: center;
  color: white;
}

.cta-content h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
}

.cta-content p {
  font-size: 1.2rem;
  margin-bottom: 32px;
  opacity: 0.95;
}

/* Responsive */
@media (max-width: 768px) {
  .hero {
    padding: 100px 16px 60px;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .hero-actions {
    flex-direction: column;
  }

  .cta-button,
  .secondary-button {
    width: 100%;
  }

  .features-section,
  .featured-products,
  .cta-section {
    padding: 60px 16px;
  }

  .section-title {
    font-size: 2rem;
  }

  .cta-content h2 {
    font-size: 2rem;
  }

  .bubble {
    display: none;
  }
}

@media (max-width: 576px) {
  .hero-title {
    font-size: 2rem;
  }

  .section-title {
    font-size: 1.75rem;
  }
}
</style>
