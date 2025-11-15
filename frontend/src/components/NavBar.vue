<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";
import { useI18n } from "vue-i18n";
import {
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  HistoryOutlined,
  LoginOutlined,
  UserAddOutlined,
  MenuOutlined,
  GlobalOutlined,
} from "@ant-design/icons-vue";

const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();
const { locale } = useI18n();

const mobileMenuVisible = ref(false);

const handleLogout = () => {
  authStore.logout();
  router.push("/");
};

const closeMobileMenu = () => {
  mobileMenuVisible.value = false;
};

const changeLanguage = (lang: string) => {
  locale.value = lang;
  localStorage.setItem('locale', lang);
};
</script>

<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-header">
        <RouterLink to="/" class="nav-brand" @click="closeMobileMenu">
          <span class="brand-icon">🧋</span>
          <span class="brand-text">TeaStore</span>
        </RouterLink>

        <a-button
          type="text"
          class="mobile-menu-btn"
          @click="mobileMenuVisible = !mobileMenuVisible"
        >
          <MenuOutlined />
        </a-button>
      </div>

      <div class="nav-links" :class="{ 'mobile-open': mobileMenuVisible }">
        <RouterLink
          to="/products"
          class="nav-link"
          @click="closeMobileMenu"
        >
          <AppstoreOutlined />
          <span>{{ $t('nav.products') }}</span>
        </RouterLink>

        <RouterLink
          v-if="authStore.isAuthenticated"
          to="/orders"
          class="nav-link"
          @click="closeMobileMenu"
        >
          <HistoryOutlined />
          <span>{{ $t('nav.orders') }}</span>
        </RouterLink>

        <RouterLink
          v-if="authStore.isAdmin"
          to="/admin"
          class="nav-link admin-link"
          @click="closeMobileMenu"
        >
          <span>{{ $t('nav.adminPanel') }}</span>
        </RouterLink>

        <RouterLink
          to="/cart"
          class="nav-link cart-link"
          @click="closeMobileMenu"
        >
          <a-badge :count="cartStore.totalItems" :overflow-count="99">
            <ShoppingCartOutlined :style="{ fontSize: '20px' }" />
          </a-badge>
          <span class="cart-text">{{ $t('nav.cart') }}</span>
        </RouterLink>

        <!-- Language Switcher -->
        <a-dropdown>
          <a-button type="text" class="language-btn">
            <GlobalOutlined />
            <span class="language-text">{{ locale === 'vi' ? 'VI' : 'EN' }}</span>
          </a-button>
          <template #overlay>
            <a-menu>
              <a-menu-item 
                key="vi" 
                @click="changeLanguage('vi')"
                :class="{ 'active-lang': locale === 'vi' }"
              >
                🇻🇳 {{ $t('language.vietnamese') }}
              </a-menu-item>
              <a-menu-item 
                key="en" 
                @click="changeLanguage('en')"
                :class="{ 'active-lang': locale === 'en' }"
              >
                🇬🇧 {{ $t('language.english') }}
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>

        <div v-if="!authStore.isAuthenticated" class="auth-links">
          <RouterLink to="/login" class="nav-link" @click="closeMobileMenu">
            <LoginOutlined />
            <span>{{ $t('nav.login') }}</span>
          </RouterLink>
          <a-button type="primary" @click="router.push('/register'); closeMobileMenu()">
            <UserAddOutlined />
            {{ $t('nav.register') }}
          </a-button>
        </div>

        <div v-else class="user-menu">
          <a-dropdown>
            <a-button type="text" class="user-btn">
              <UserOutlined />
              {{ authStore.user?.name }}
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item key="profile">
                  <UserOutlined />
                  {{ $t('nav.profile') }}
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" @click="handleLogout" danger>
                  <LogoutOutlined />
                  {{ $t('nav.logout') }}
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 1000;
  padding: 0 24px;
  animation: slideInDown 0.4s ease-out;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 64px;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
  color: #1890ff;
  transition: all 0.3s ease;
}

.nav-brand:hover {
  transform: scale(1.05);
  color: #096dd9;
}

.brand-icon {
  font-size: 2rem;
  animation: pulse 2s ease-in-out infinite;
}

.brand-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.mobile-menu-btn {
  display: none;
  font-size: 20px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 2;
  justify-content: flex-end;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: #595959;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 14px;
}

.nav-link:hover {
  background-color: #f0f2f5;
  color: #1890ff;
  transform: translateY(-2px);
}

.nav-link.router-link-active {
  background-color: #e6f7ff;
  color: #1890ff;
}

.cart-link {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
  color: white !important;
  padding: 8px 16px;
}

.cart-link:hover {
  background: linear-gradient(135deg, #389e0d 0%, #237804 100%);
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
  transform: translateY(-2px);
}

.admin-link {
  background: linear-gradient(135deg, #fa8c16 0%, #fa541c 100%);
  color: white !important;
}

.admin-link:hover {
  background: linear-gradient(135deg, #fa541c 0%, #d4380d 100%);
  box-shadow: 0 4px 12px rgba(250, 140, 22, 0.3);
}

.auth-links {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-menu {
  display: flex;
  align-items: center;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.language-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  padding: 8px 12px;
}

.language-text {
  font-weight: 600;
  font-size: 13px;
}

:deep(.active-lang) {
  background-color: #e6f7ff;
  font-weight: 600;
}

@media (max-width: 768px) {
  .navbar {
    padding: 0 16px;
  }

  .mobile-menu-btn {
    display: block;
  }

  .nav-header {
    width: 100%;
  }

  .nav-links {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    background: white;
    flex-direction: column;
    align-items: stretch;
    padding: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateX(-100%);
    opacity: 0;
    transition: all 0.3s ease;
    max-height: calc(100vh - 64px);
    overflow-y: auto;
  }

  .nav-links.mobile-open {
    transform: translateX(0);
    opacity: 1;
  }

  .nav-link {
    width: 100%;
    justify-content: flex-start;
    padding: 12px 16px;
  }

  .cart-link,
  .admin-link {
    width: 100%;
  }

  .auth-links {
    flex-direction: column;
    width: 100%;
    gap: 12px;
  }

  .auth-links .nav-link,
  .auth-links :deep(.ant-btn) {
    width: 100%;
  }

  .user-menu {
    width: 100%;
  }

  .user-menu :deep(.ant-dropdown-trigger) {
    width: 100%;
  }

  .user-btn {
    width: 100%;
    justify-content: flex-start;
  }

  .cart-text {
    display: inline;
  }
}

@media (min-width: 769px) {
  .cart-text {
    display: none;
  }
}
</style>
