<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth.store";
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, UserAddOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import type { Rule } from "ant-design-vue/es/form";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

interface FormState {
  name: string;
  email: string;
  password: string;
  phone: string;
}

const formState = reactive<FormState>({
  name: "",
  email: "",
  password: "",
  phone: "",
});

const loading = ref(false);

const rules: Record<string, Rule[]> = {
  name: [
    { required: true, message: t('auth.register.validation.nameRequired'), trigger: "blur" },
    { min: 2, message: t('auth.register.validation.nameMin'), trigger: "blur" },
  ],
  email: [
    { required: true, message: t('auth.register.validation.emailRequired'), trigger: "blur" },
    { type: "email", message: t('auth.register.validation.emailInvalid'), trigger: "blur" },
  ],
  password: [
    { required: true, message: t('auth.register.validation.passwordRequired'), trigger: "blur" },
    { min: 6, message: t('auth.register.validation.passwordMin'), trigger: "blur" },
  ],
  phone: [
    { pattern: /^[0-9]{10,11}$/, message: t('auth.register.validation.phoneInvalid'), trigger: "blur" },
  ],
};

const handleSubmit = async () => {
  loading.value = true;

  try {
    const result = await authStore.register(formState);

    if (result.success) {
      message.success(t('auth.register.success'));
      router.push("/");
    } else {
      message.error(result.message || t('auth.register.failed'));
    }
  } catch (err) {
    message.error(t('errors.generic'));
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="register-view">
    <div class="register-container">
      <a-card class="register-card fade-in" :bordered="false">
        <div class="register-header">
          <div class="register-icon">
            <UserAddOutlined />
          </div>
          <h1>{{ $t('auth.register.title') }}</h1>
          <p class="subtitle">{{ $t('auth.register.subtitle') }}</p>
        </div>

        <a-form
          :model="formState"
          :rules="rules"
          layout="vertical"
          @finish="handleSubmit"
          class="register-form"
        >
          <a-form-item :label="$t('auth.register.name')" name="name">
            <a-input
              v-model:value="formState.name"
              size="large"
              :placeholder="$t('auth.register.namePlaceholder')"
            >
              <template #prefix>
                <UserOutlined />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item :label="$t('auth.register.email')" name="email">
            <a-input
              v-model:value="formState.email"
              size="large"
              :placeholder="$t('auth.register.emailPlaceholder')"
            >
              <template #prefix>
                <MailOutlined />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item :label="$t('auth.register.phone')" name="phone">
            <a-input
              v-model:value="formState.phone"
              size="large"
              :placeholder="$t('auth.register.phonePlaceholder')"
            >
              <template #prefix>
                <PhoneOutlined />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item :label="$t('auth.register.password')" name="password">
            <a-input-password
              v-model:value="formState.password"
              size="large"
              :placeholder="$t('auth.register.passwordPlaceholder')"
            >
              <template #prefix>
                <LockOutlined />
              </template>
            </a-input-password>
          </a-form-item>

          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              size="large"
              :loading="loading"
              block
              class="register-button"
            >
              <UserAddOutlined v-if="!loading" />
              {{ loading ? $t('auth.register.creating') : $t('auth.register.createButton') }}
            </a-button>
          </a-form-item>
        </a-form>

        <a-divider>{{ $t('common.or') }}</a-divider>

        <div class="login-link">
          <span>{{ $t('auth.register.haveAccount') }}</span>
          <a-button type="link" @click="router.push('/login')">
            {{ $t('auth.register.loginNow') }}
          </a-button>
        </div>
      </a-card>

      <div class="decoration-left"></div>
      <div class="decoration-right"></div>
    </div>
  </div>
</template>

<style scoped>
.register-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #fa8c16 0%, #fa541c 100%);
  position: relative;
  overflow: hidden;
}

.register-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 500px;
}

.register-card {
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.register-card :deep(.ant-card-body) {
  padding: 48px 40px;
}

.register-header {
  text-align: center;
  margin-bottom: 40px;
}

.register-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, #fa8c16 0%, #fa541c 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: white;
  animation: pulse 2s ease-in-out infinite;
}

.register-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #262626;
  margin-bottom: 8px;
}

.subtitle {
  color: #8c8c8c;
  font-size: 14px;
  margin: 0;
}

.register-form {
  margin-top: 32px;
}

.register-form :deep(.ant-form-item-label > label) {
  font-weight: 500;
  font-size: 14px;
}

.register-form :deep(.ant-input),
.register-form :deep(.ant-input-affix-wrapper) {
  border-radius: 8px;
  border: 1px solid #d9d9d9;
  transition: all 0.3s ease;
  font-size: 16px;
}

.register-form :deep(.ant-input:focus),
.register-form :deep(.ant-input-affix-wrapper:focus),
.register-form :deep(.ant-input-affix-wrapper-focused) {
  border-color: #fa8c16;
  box-shadow: 0 0 0 2px rgba(250, 140, 22, 0.1);
}

.register-form :deep(.ant-input-affix-wrapper > input.ant-input) {
  padding: 12px 16px 12px 0;
  font-size: 16px;
}

.register-form :deep(.ant-input-prefix) {
  margin-right: 12px;
  margin-left: 16px;
  color: #8c8c8c;
  font-size: 16px;
}

.register-form :deep(.ant-input-password) {
  border-radius: 8px;
}

.register-form :deep(.ant-input-password .ant-input) {
  padding: 12px 16px 12px 0;
  font-size: 16px;
}

.register-button {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  background: linear-gradient(135deg, #fa8c16 0%, #fa541c 100%);
  border: none;
  transition: all 0.3s ease;
}

.register-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(250, 140, 22, 0.4);
}

.login-link {
  text-align: center;
  color: #8c8c8c;
  font-size: 14px;
}

.login-link span {
  margin-right: 4px;
}

/* Decorations */
.decoration-left,
.decoration-right {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite ease-in-out;
}

.decoration-left {
  top: -150px;
  left: -150px;
}

.decoration-right {
  bottom: -150px;
  right: -150px;
  animation-delay: 10s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-30px) rotate(180deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .register-view {
    padding: 20px 16px;
  }

  .register-container {
    max-width: 100%;
  }

  .register-card :deep(.ant-card-body) {
    padding: 32px 20px;
  }

  .register-header h1 {
    font-size: 1.5rem;
  }

  .register-icon {
    width: 64px;
    height: 64px;
    font-size: 28px;
    margin-bottom: 20px;
  }

  .register-form :deep(.ant-input-affix-wrapper > input.ant-input),
  .register-form :deep(.ant-input-password .ant-input) {
    padding: 10px 12px 10px 0;
    font-size: 14px;
  }

  .register-form :deep(.ant-input-prefix) {
    margin-right: 8px;
    font-size: 14px;
  }

  .register-button {
    height: 44px;
    font-size: 15px;
  }

  .decoration-left,
  .decoration-right {
    display: none;
  }
}

@media (max-width: 480px) {
  .register-view {
    padding: 16px 12px;
  }

  .register-card :deep(.ant-card-body) {
    padding: 24px 16px;
  }

  .register-header h1 {
    font-size: 1.35rem;
  }

  .subtitle {
    font-size: 13px;
  }

  .register-link,
  .login-link {
    font-size: 13px;
  }
}
</style>
