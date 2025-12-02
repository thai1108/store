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

const heroStats = computed(() => [
  { label: t('home.featuredProducts'), value: '50+' },
  { label: t('home.features.fastDelivery'), value: '2h' },
  { label: t('home.features.support247'), value: '24/7' },
]);

const collectionCards = computed(() => [
  {
    title: t('products.drinks'),
    description: t('home.features.fastDeliveryDesc'),
    accent: '#1677ff',
    emoji: '🥤',
  },
  {
    title: t('products.milkTea'),
    description: t('home.features.qualityAssuredDesc'),
    accent: '#722ed1',
    emoji: '🧋',
  },
  {
    title: t('products.snacks'),
    description: t('home.features.wideSelectionDesc'),
    accent: '#fa8c16',
    emoji: '🍪',
  },
]);

const goToProducts = () => router.push('/products');
</script>

<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="hero gradient-primary">
      <div class="container hero-grid">
        <div class="hero-content fade-in">
          <div class="eyebrow">TeaStore Experience</div>
          <h1 class="hero-title">{{ $t('home.title') }}</h1>
          <p class="hero-subtitle">
            {{ $t('home.subtitle') }}
          </p>

          <div class="hero-badges">
            <span class="badge">{{ $t('home.features.qualityAssured') }}</span>
            <span class="badge ghost">{{ $t('home.features.support247') }}</span>
          </div>

          <div class="hero-actions">
            <a-button type="primary" size="large" @click="goToProducts" class="cta-button hover-scale">
              <ShoppingOutlined />
              {{ $t('home.browseProducts') }}
            </a-button>
            <a-button size="large" @click="router.push('/register')" class="secondary-button">
              {{ $t('home.joinNow') }}
            </a-button>
          </div>

          <div class="hero-stats">
            <div v-for="stat in heroStats" :key="stat.label" class="stat-card">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </div>

        <div class="hero-visual fade-in">
          <div class="glass-card">
            <div class="glass-header">
              <span class="dot" v-for="n in 3" :key="n"></span>
            </div>
            <div class="glass-body">
              <p class="glass-title">{{ $t('home.featuredProducts') }}</p>
              <p class="glass-description">{{ $t('home.featuredProductsSubtitle') }}</p>
              <div class="glass-tags">
                <span class="glass-tag">{{ $t('products.drinks') }}</span>
                <span class="glass-tag">{{ $t('products.milkTea') }}</span>
                <span class="glass-tag">{{ $t('products.snacks') }}</span>
              </div>
              <div class="glass-cta">
                <a-button type="primary" ghost block @click="goToProducts">{{ $t('home.viewAllProducts') }}</a-button>
              </div>
            </div>
          </div>
          <div class="hero-float-card">
            <div class="float-title">{{ $t('home.readyToShop') }}</div>
            <p class="float-description">{{ $t('home.readyToShopText') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products Section -->
    <section class="collection-highlight">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">{{ $t('home.featuredProducts') }}</h2>
          <p class="section-subtitle">
            {{ $t('home.featuredProductsSubtitle') }}
          </p>
        </div>

        <div class="collection-grid">
          <div
            v-for="card in collectionCards"
            :key="card.title"
            class="collection-card hover-lift"
            :style="{ borderColor: card.accent }"
          >
            <div class="collection-icon" :style="{ background: card.accent + '14', color: card.accent }">
              {{ card.emoji }}
            </div>
            <div class="collection-content">
              <h3>{{ card.title }}</h3>
              <p>{{ card.description }}</p>
            </div>
            <a-button type="link" @click="goToProducts">{{ $t('home.viewAllProducts') }}</a-button>
          </div>
        </div>
      </div>
    </section>

    <section class="featured-products">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">{{ $t('products.title') }}</h2>
          <p class="section-subtitle">{{ $t('products.subtitle') }}</p>
        </div>

        <a-spin :spinning="productStore.loading" size="large">
          <div v-if="productStore.error" class="error-state">
            <a-result status="error" :title="$t('products.failedToLoad')" :sub-title="productStore.error">
              <template #extra>
                <a-button type="primary" @click="productStore.fetchProducts()">
                  {{ $t('products.tryAgain') }}
                </a-button>
              </template>
            </a-result>
          </div>

          <a-row v-else :gutter="[24, 24]" class="products-grid">
            <a-col v-for="product in productStore.products.slice(0, 6)" :key="product.id" :xs="24" :sm="12" :md="12"
              :lg="8" :xl="8">
              <ProductCard :product="product" />
            </a-col>
          </a-row>
        </a-spin>

        <div class="view-more">
          <a-button type="primary" size="large" @click="router.push('/products')" class="hover-scale">
            {{ $t('home.viewAllProducts') }}
          </a-button>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <a-row :gutter="[24, 24]">
          <a-col v-for="(feature, index) in features" :key="index" :xs="24" :sm="12" :lg="6">
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


    <!-- CTA Section -->
    <section class="cta-section gradient-success">
      <div class="container">
        <div class="cta-content fade-in">
          <h2>{{ $t('home.readyToShop') }}</h2>
          <p>{{ $t('home.readyToShopText') }}</p>
          <a-button type="primary" size="large" ghost @click="router.push('/register')" class="hover-scale">
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
  color: #0f172a;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Hero Section */
.hero {
  position: relative;
  padding: 140px 0 100px;
  color: #0b1a2b;
  overflow: hidden;
}

.hero::before {
  content: "";
  position: absolute;
  inset: 20% -20% auto -20%;
  height: 65%;
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.15) 0%, rgba(114, 46, 209, 0.15) 50%, rgba(82, 196, 26, 0.14) 100%);
  filter: blur(60px);
  z-index: 0;
}

.hero-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 40px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(24, 144, 255, 0.12);
  color: #1677ff;
  font-weight: 600;
  width: fit-content;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  margin: 0;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.2rem;
  margin: 0;
  color: #334155;
  line-height: 1.6;
}

.hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 12px;
  background: #fff;
  color: #0f172a;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  font-weight: 600;
}

.badge.ghost {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.cta-button,
.secondary-button {
  height: 48px;
  padding: 0 28px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 12px;
}

.secondary-button {
  background: #0f172a;
  color: #fff;
  border: none;
}

.secondary-button:hover {
  background: #111827;
  color: #fff;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 8px;
}

.stat-card {
  background: #fff;
  padding: 14px 16px;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(15, 23, 42, 0.05);
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: #0f172a;
}

.stat-label {
  color: #475569;
  font-weight: 600;
}

.hero-visual {
  position: relative;
  display: grid;
  gap: 16px;
}

.glass-card {
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.82);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.15);
  overflow: hidden;
}

.glass-header {
  display: flex;
  gap: 8px;
  padding: 14px 16px;
  background: linear-gradient(90deg, rgba(22, 119, 255, 0.1), rgba(114, 46, 209, 0.08));
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #1677ff;
}

.glass-body {
  padding: 18px 20px 22px;
}

.glass-title {
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}

.glass-description {
  color: #475569;
  margin-bottom: 12px;
}

.glass-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.glass-tag {
  padding: 8px 10px;
  border-radius: 10px;
  background: #f0f5ff;
  color: #1d4ed8;
  font-weight: 600;
}

.glass-cta :deep(.ant-btn) {
  border-radius: 10px;
}

.hero-float-card {
  position: absolute;
  right: -10px;
  bottom: -10px;
  background: linear-gradient(135deg, #1677ff 0%, #52c41a 100%);
  color: #fff;
  padding: 16px 18px;
  border-radius: 16px;
  width: min(320px, 90%);
  box-shadow: 0 20px 60px rgba(24, 144, 255, 0.35);
}

.float-title {
  font-weight: 800;
  margin-bottom: 6px;
}

.float-description {
  margin: 0;
  opacity: 0.92;
}

/* Collections */
.collection-highlight {
  padding: 70px 0 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-title {
  font-size: 2.4rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 10px;
}

.section-subtitle {
  color: #475569;
  margin: 0;
}

.collection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}

.collection-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 18px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 14px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.collection-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  font-size: 22px;
}

.collection-content h3 {
  margin: 0 0 6px;
  font-weight: 700;
  color: #0f172a;
}

.collection-content p {
  margin: 0;
  color: #475569;
}

/* Featured Products */
.featured-products {
  padding: 70px 0;
}

.products-grid {
  margin-bottom: 36px;
}

.error-state {
  padding: 40px 0;
}

.view-more {
  text-align: center;
  padding-top: 16px;
}

/* Features */
.features-section {
  padding: 70px 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.02) 0%, rgba(15, 23, 42, 0.04) 100%);
}

.feature-card {
  text-align: center;
  padding: 32px 24px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
}

.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
}

.feature-icon {
  font-size: 42px;
  color: #1677ff;
  margin-bottom: 12px;
}

.feature-card h3 {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 10px;
}

.feature-card p {
  color: #475569;
  line-height: 1.6;
  margin: 0;
}

/* CTA Section */
.cta-section {
  padding: 100px 0;
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;
}

.cta-section::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(82, 196, 26, 0.85) 0%, rgba(22, 119, 255, 0.9) 100%);
  z-index: 0;
}

.cta-content {
  position: relative;
  z-index: 1;
  max-width: 640px;
  margin: 0 auto;
}

.cta-content h2 {
  font-size: 2.4rem;
  font-weight: 800;
  margin-bottom: 12px;
}

.cta-content p {
  font-size: 1.1rem;
  margin-bottom: 26px;
  opacity: 0.94;
}

.cta-content :deep(.ant-btn) {
  border-radius: 12px;
  padding: 0 26px;
  height: 46px;
}

/* Responsive */
@media (max-width: 992px) {
  .hero {
    padding: 110px 0 80px;
  }

  .hero-title {
    font-size: 2.4rem;
  }

  .hero-visual {
    order: -1;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-grid {
    gap: 28px;
  }

  .hero-float-card {
    position: relative;
    right: auto;
    bottom: auto;
    width: 100%;
  }

  .cta-section {
    padding: 80px 0;
  }
}

@media (max-width: 576px) {
  .cta-button,
  .secondary-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
