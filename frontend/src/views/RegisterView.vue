<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, UserAddOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import type { Rule } from "ant-design-vue/es/form";

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
    { required: true, message: "Please input your name!", trigger: "blur" },
    { min: 2, message: "Name must be at least 2 characters!", trigger: "blur" },
  ],
  email: [
    { required: true, message: "Please input your email!", trigger: "blur" },
    { type: "email", message: "Please enter a valid email!", trigger: "blur" },
  ],
  password: [
    { required: true, message: "Please input your password!", trigger: "blur" },
    { min: 6, message: "Password must be at least 6 characters!", trigger: "blur" },
  ],
  phone: [
    { pattern: /^[0-9]{10,11}$/, message: "Please enter a valid phone number!", trigger: "blur" },
  ],
};

const handleSubmit = async () => {
  loading.value = true;

  try {
    const result = await authStore.register(formState);

    if (result.success) {
      message.success("Registration successful! Welcome!");
      router.push("/");
    } else {
      message.error(result.message || "Registration failed. Please try again.");
    }
  } catch (err) {
    message.error("An error occurred. Please try again.");
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
          <h1>Create Account</h1>
          <p class="subtitle">Join us and start ordering delicious treats!</p>
        </div>

        <a-form
          :model="formState"
          :rules="rules"
          layout="vertical"
          @finish="handleSubmit"
          class="register-form"
        >
          <a-form-item label="Full Name" name="name">
            <a-input
              v-model:value="formState.name"
              size="large"
              placeholder="Enter your full name"
            >
              <template #prefix>
                <UserOutlined />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item label="Email" name="email">
            <a-input
              v-model:value="formState.email"
              size="large"
              placeholder="Enter your email"
            >
              <template #prefix>
                <MailOutlined />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item label="Phone Number" name="phone">
            <a-input
              v-model:value="formState.phone"
              size="large"
              placeholder="Enter your phone number (optional)"
            >
              <template #prefix>
                <PhoneOutlined />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item label="Password" name="password">
            <a-input-password
              v-model:value="formState.password"
              size="large"
              placeholder="Create a password (min 6 characters)"
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
              {{ loading ? "Creating Account..." : "Create Account" }}
            </a-button>
          </a-form-item>
        </a-form>

        <a-divider>or</a-divider>

        <div class="login-link">
          <span>Already have an account?</span>
          <a-button type="link" @click="router.push('/login')">
            Login now
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

.register-form :deep(.ant-input-affix-wrapper) {
  padding: 12px 16px;
  border-radius: 8px;
}

.register-form :deep(.ant-input-password) {
  padding: 0;
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

  .register-card :deep(.ant-card-body) {
    padding: 32px 24px;
  }

  .register-header h1 {
    font-size: 1.75rem;
  }

  .register-icon {
    width: 64px;
    height: 64px;
    font-size: 28px;
    margin-bottom: 20px;
  }

  .decoration-left,
  .decoration-right {
    display: none;
  }
}
</style>
