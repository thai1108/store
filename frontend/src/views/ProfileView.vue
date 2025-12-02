<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth-service';

const authStore = useAuthStore();

const isEditing = ref(false);
const isLoading = ref(false);
const isUploadingAvatar = ref(false);
const message = ref({ text: '', type: '' });

const formData = ref({
  name: '',
  phone: '',
  address: '',
});

const avatarPreview = ref<string | null>(null);
const avatarFile = ref<File | null>(null);

onMounted(() => {
  if (authStore.user) {
    formData.value = {
      name: authStore.user.name || '',
      phone: authStore.user.phone || '',
      address: authStore.user.address || '',
    };
    avatarPreview.value = authStore.user.avatarUrl || null;
  }
});

const handleAvatarSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      message.value = { text: 'File size must be less than 5MB', type: 'error' };
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      message.value = { text: 'Please select an image file', type: 'error' };
      return;
    }
    
    avatarFile.value = file;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const handleUploadAvatar = async () => {
  if (!avatarFile.value) return;
  
  isUploadingAvatar.value = true;
  message.value = { text: '', type: '' };
  
  try {
    const response = await authService.uploadAvatar(avatarFile.value);
    
    if (response.success && response.data) {
      // Update user in store
      if (authStore.user) {
        const updatedUser = { ...authStore.user, avatarUrl: response.data.avatarUrl };
        authStore.user = updatedUser;
        authService.setAuth(authStore.token || '', updatedUser);
        avatarPreview.value = response.data.avatarUrl;
      }
      
      message.value = { text: 'Avatar uploaded successfully!', type: 'success' };
      avatarFile.value = null;
    } else {
      message.value = { text: response.message || 'Failed to upload avatar', type: 'error' };
    }
  } catch (error) {
    console.error('Error uploading avatar:', error);
    message.value = { text: 'Failed to upload avatar', type: 'error' };
  } finally {
    isUploadingAvatar.value = false;
  }
};

const handleSubmit = async () => {
  if (!formData.value.name.trim()) {
    message.value = { text: 'Name is required', type: 'error' };
    return;
  }
  
  isLoading.value = true;
  message.value = { text: '', type: '' };
  
  try {
    const response = await authService.updateProfile({
      name: formData.value.name.trim(),
      phone: formData.value.phone.trim() || undefined,
      address: formData.value.address.trim() || undefined,
    });
    
    if (response.success && response.data) {
      // Update user in store
      authStore.user = response.data;
      authService.setAuth(authStore.token || '', response.data);
      
      message.value = { text: 'Profile updated successfully!', type: 'success' };
      isEditing.value = false;
    } else {
      message.value = { text: response.message || 'Failed to update profile', type: 'error' };
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    message.value = { text: 'Failed to update profile', type: 'error' };
  } finally {
    isLoading.value = false;
  }
};

const cancelEdit = () => {
  if (authStore.user) {
    formData.value = {
      name: authStore.user.name || '',
      phone: authStore.user.phone || '',
      address: authStore.user.address || '',
    };
  }
  isEditing.value = false;
  message.value = { text: '', type: '' };
};

const userRole = computed(() => {
  return authStore.user?.role === 'admin' ? 'Admin' : 'Customer';
});
</script>

<template>
  <div class="profile-view page">
    <div class="container">
      <div class="profile-header">
        <h1>{{ $t('profile.title') }}</h1>
        <p class="subtitle">{{ $t('profile.subtitle') }}</p>
      </div>

      <div class="profile-content">
        <!-- Avatar Section -->
        <div class="avatar-section">
          <div class="avatar-container">
            <img 
              v-if="avatarPreview" 
              :src="avatarPreview" 
              :alt="authStore.user?.name"
              class="avatar-image"
            />
            <div v-else class="avatar-placeholder">
              <span>{{ authStore.user?.name.charAt(0).toUpperCase() }}</span>
            </div>
          </div>
          
          <div class="avatar-upload">
            <input 
              type="file" 
              id="avatar-input" 
              accept="image/*"
              @change="handleAvatarSelect"
              style="display: none"
            />
            <label for="avatar-input" class="btn btn-secondary">
              {{ $t('profile.changeAvatar') }}
            </label>
            
            <button 
              v-if="avatarFile" 
              @click="handleUploadAvatar"
              :disabled="isUploadingAvatar"
              class="btn btn-primary"
            >
              {{ isUploadingAvatar ? $t('profile.uploading') : $t('profile.uploadAvatar') }}
            </button>
          </div>
        </div>

        <!-- Message Alert -->
        <div v-if="message.text" :class="['alert', `alert-${message.type}`]">
          {{ message.text }}
        </div>

        <!-- Profile Info -->
        <div class="profile-info">
          <div class="info-header">
            <h2>{{ $t('profile.personalInfo') }}</h2>
            <button 
              v-if="!isEditing"
              @click="isEditing = true" 
              class="btn btn-secondary"
            >
              {{ $t('common.edit') }}
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="profile-form">
            <div class="form-group">
              <label>{{ $t('profile.email') }}</label>
              <input 
                type="email" 
                :value="authStore.user?.email" 
                disabled
                class="form-control"
              />
              <small class="form-hint">{{ $t('profile.emailHint') }}</small>
            </div>

            <div class="form-group">
              <label>{{ $t('profile.name') }}</label>
              <input 
                type="text" 
                v-model="formData.name"
                :disabled="!isEditing"
                class="form-control"
                :class="{ 'disabled': !isEditing }"
              />
            </div>

            <div class="form-group">
              <label>{{ $t('profile.phone') }}</label>
              <input 
                type="tel" 
                v-model="formData.phone"
                :disabled="!isEditing"
                :placeholder="$t('profile.phonePlaceholder')"
                class="form-control"
                :class="{ 'disabled': !isEditing }"
              />
            </div>

            <div class="form-group">
              <label>{{ $t('profile.address') }}</label>
              <textarea 
                v-model="formData.address"
                :disabled="!isEditing"
                :placeholder="$t('profile.addressPlaceholder')"
                class="form-control"
                :class="{ 'disabled': !isEditing }"
                rows="3"
              ></textarea>
            </div>

            <div class="form-group">
              <label>{{ $t('profile.role') }}</label>
              <input 
                type="text" 
                :value="userRole" 
                disabled
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>{{ $t('profile.memberSince') }}</label>
              <input 
                type="text" 
                :value="new Date(authStore.user?.createdAt || '').toLocaleDateString()" 
                disabled
                class="form-control"
              />
            </div>

            <div v-if="isEditing" class="form-actions">
              <button 
                type="button" 
                @click="cancelEdit" 
                class="btn btn-secondary"
                :disabled="isLoading"
              >
                {{ $t('common.cancel') }}
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="isLoading"
              >
                {{ isLoading ? $t('profile.saving') : $t('common.save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-view {
  padding: 80px 20px 60px;
  min-height: 100vh;
  background-color: #f7fafc;
}

.container {
  max-width: 900px;
  margin: 0 auto;
}

.profile-header {
  text-align: center;
  margin-bottom: 40px;
}

.profile-header h1 {
  font-size: 2.5rem;
  color: #2d3748;
  margin-bottom: 10px;
}

.subtitle {
  color: #718096;
  font-size: 1.1rem;
}

.profile-content {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 40px;
  border-bottom: 1px solid #e2e8f0;
}

.avatar-container {
  margin-bottom: 20px;
}

.avatar-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #f7fafc;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.avatar-placeholder {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.avatar-upload {
  display: flex;
  gap: 10px;
  align-items: center;
}

.alert {
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.95rem;
}

.alert-success {
  background-color: #c6f6d5;
  color: #22543d;
  border: 1px solid #9ae6b4;
}

.alert-error {
  background-color: #fed7d7;
  color: #742a2a;
  border: 1px solid #fc8181;
}

.profile-info {
  margin-top: 20px;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.info-header h2 {
  font-size: 1.5rem;
  color: #2d3748;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.form-control {
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-control:disabled,
.form-control.disabled {
  background-color: #f7fafc;
  cursor: not-allowed;
  color: #718096;
}

.form-hint {
  margin-top: 5px;
  font-size: 0.85rem;
  color: #718096;
}

textarea.form-control {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 10px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background-color: #e2e8f0;
  color: #2d3748;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #cbd5e0;
}

@media (max-width: 768px) {
  .profile-view {
    padding: 80px 15px 40px;
  }

  .profile-content {
    padding: 30px 20px;
  }

  .profile-header h1 {
    font-size: 2rem;
  }

  .avatar-image,
  .avatar-placeholder {
    width: 120px;
    height: 120px;
  }

  .avatar-placeholder span {
    font-size: 2.5rem;
  }

  .avatar-upload {
    flex-direction: column;
    width: 100%;
  }

  .avatar-upload button,
  .avatar-upload label {
    width: 100%;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>
