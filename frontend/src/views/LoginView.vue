<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth.store";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import type { Rule } from "ant-design-vue/es/form";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

interface FormState {
  email: string;
  password: string;
}

const formState = reactive<FormState>({
  email: "",
  password: "",
});

const loading = ref(false);

const rules: Record<string, Rule[]> = {
  email: [
    { required: true, message: t('auth.login.validation.emailRequired'), trigger: "blur" },
    { type: "email", message: t('auth.login.validation.emailInvalid'), trigger: "blur" },
  ],
  password: [
    { required: true, message: t('auth.login.validation.passwordRequired'), trigger: "blur" },
    { min: 6, message: t('auth.login.validation.passwordMin'), trigger: "blur" },
  ],
};

const handleSubmit = async () => {
  loading.value = true;

  try {
    const result = await authStore.login(formState.email, formState.password);

    if (result.success) {
      message.success(t('auth.login.success'));
      router.push("/");
    } else {
      message.error(result.message || t('auth.login.failed'));
    }
  } catch (err) {
    message.error(t('errors.generic'));
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-view page">
    <div class="login-container">
      <a-card class="login-card fade-in" :bordered="false">
        <div class="login-header">
          <div class="login-icon">
            <UserOutlined />
          </div>
          <h1>{{ $t('auth.login.title') }}</h1>
          <p class="subtitle">{{ $t('auth.login.subtitle') }}</p>
        </div>

        <a-form
          :model="formState"
          :rules="rules"
          layout="vertical"
          @finish="handleSubmit"
          class="login-form"
        >
          <a-form-item :label="$t('auth.login.email')" name="email">
            <a-input
              v-model:value="formState.email"
              size="large"
              :placeholder="$t('auth.login.emailPlaceholder')"
            >
              <template #prefix>
                <UserOutlined />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item :label="$t('auth.login.password')" name="password">
            <a-input-password
              v-model:value="formState.password"
              size="large"
              :placeholder="$t('auth.login.passwordPlaceholder')"
            >
              <template #prefix>
                <LockOutlined />
              </template>
            </a-input-password>
          </a-form-item>

          <a-form-item>
            <div class="form-footer">
              <a-checkbox>{{ $t('auth.login.rememberMe') }}</a-checkbox>
              <a href="#" class="forgot-link">{{ $t('auth.login.forgotPassword') }}</a>
            </div>
          </a-form-item>

          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              size="large"
              :loading="loading"
              block
              class="login-button"
            >
              <LoginOutlined v-if="!loading" />
              {{ loading ? $t('auth.login.loggingIn') : $t('auth.login.loginButton') }}
            </a-button>
          </a-form-item>
        </a-form>

        <a-divider>{{ $t('common.or') }}</a-divider>

        <div class="register-link">
          <span>{{ $t('auth.login.noAccount') }}</span>
          <a-button type="link" @click="router.push('/register')">
            {{ $t('auth.login.registerNow') }}
          </a-button>
        </div>
      </a-card>

      <div class="decoration-left"></div>
      <div class="decoration-right"></div>
    </div>
  </div>
</template>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.login-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 450px;
}

.login-card {
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.login-card :deep(.ant-card-body) {
  padding: 48px 40px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: white;
  animation: pulse 2s ease-in-out infinite;
}

.login-header h1 {
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

.login-form {
  margin-top: 32px;
}

.login-form :deep(.ant-form-item-label > label) {
  font-weight: 500;
  font-size: 14px;
}

.login-form :deep(.ant-input),
.login-form :deep(.ant-input-affix-wrapper) {
  border-radius: 8px;
  border: 1px solid #d9d9d9;
  transition: all 0.3s ease;
  font-size: 16px;
}

.login-form :deep(.ant-input:focus),
.login-form :deep(.ant-input-affix-wrapper:focus),
.login-form :deep(.ant-input-affix-wrapper-focused) {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.login-form :deep(.ant-input-affix-wrapper > input.ant-input) {
  padding: 12px 16px 12px 0;
  font-size: 16px;
}

.login-form :deep(.ant-input-prefix) {
  margin-right: 12px;
  margin-left: 16px;
  color: #8c8c8c;
  font-size: 16px;
}

.login-form :deep(.ant-input-password) {
  border-radius: 8px;
}

.login-form :deep(.ant-input-password .ant-input) {
  padding: 12px 16px 12px 0;
  font-size: 16px;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-link {
  color: #1890ff;
  font-size: 14px;
}

.forgot-link:hover {
  text-decoration: underline;
}

.login-button {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.register-link {
  text-align: center;
  color: #8c8c8c;
  font-size: 14px;
}

.register-link span {
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
  .login-view {
    padding: 20px 16px;
  }

  .login-container {
    max-width: 100%;
  }

  .login-card :deep(.ant-card-body) {
    padding: 32px 20px;
  }

  .login-header h1 {
    font-size: 1.5rem;
  }

  .login-icon {
    width: 64px;
    height: 64px;
    font-size: 28px;
    margin-bottom: 20px;
  }

  .login-form :deep(.ant-input-affix-wrapper > input.ant-input),
  .login-form :deep(.ant-input-password .ant-input) {
    padding: 10px 12px 10px 0;
    font-size: 14px;
  }

  .login-form :deep(.ant-input-prefix) {
    margin-right: 8px;
    font-size: 14px;
  }

  .login-button {
    height: 44px;
    font-size: 15px;
  }

  .form-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .decoration-left,
  .decoration-right {
    display: none;
  }
}

@media (max-width: 480px) {
  .login-view {
    padding: 16px 12px;
  }

  .login-card :deep(.ant-card-body) {
    padding: 24px 16px;
  }

  .login-header h1 {
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
