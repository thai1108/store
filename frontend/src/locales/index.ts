import { createI18n } from 'vue-i18n';
import vi from './vi';
import en from './en';

// Lấy locale từ localStorage hoặc sử dụng mặc định là 'vi'
const savedLocale = localStorage.getItem('locale') || 'vi';

const i18n = createI18n({
  legacy: false,
  locale: savedLocale, // Mặc định là tiếng Việt hoặc ngôn ngữ đã lưu
  fallbackLocale: 'en',
  messages: {
    vi,
    en,
  },
  globalInjection: true,
});

export default i18n;
