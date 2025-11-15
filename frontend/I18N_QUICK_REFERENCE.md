# i18n Quick Reference Guide

## For Developers: Adding New Translations

### 1. Add Translation Keys

**Vietnamese (`src/locales/vi.ts`):**
```typescript
export default {
  myFeature: {
    title: 'Tiêu đề của tôi',
    description: 'Mô tả',
    button: 'Nhấn vào đây'
  }
}
```

**English (`src/locales/en.ts`):**
```typescript
export default {
  myFeature: {
    title: 'My Title',
    description: 'Description',
    button: 'Click here'
  }
}
```

### 2. Use in Vue Components

**In Template:**
```vue
<template>
  <h1>{{ $t('myFeature.title') }}</h1>
  <p>{{ $t('myFeature.description') }}</p>
  <button>{{ $t('myFeature.button') }}</button>
</template>
```

**In Script (Composition API):**
```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Use in JavaScript
const title = t('myFeature.title')
console.log(title) // 'Tiêu đề của tôi' or 'My Title'
</script>
```

### 3. Parameterized Messages

**Add key with parameters:**
```typescript
// vi.ts
welcome: 'Xin chào, {name}!'

// en.ts
welcome: 'Hello, {name}!'
```

**Use with parameter:**
```vue
<template>
  <p>{{ $t('welcome', { name: userName }) }}</p>
</template>
```

### 4. Reactive Lists (Computed Properties)

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const options = computed(() => [
  { value: 1, label: t('myFeature.option1') },
  { value: 2, label: t('myFeature.option2') },
])
</script>
```

### 5. Change Language Programmatically

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const switchToEnglish = () => {
  locale.value = 'en'
  localStorage.setItem('user-locale', 'en')
}

const switchToVietnamese = () => {
  locale.value = 'vi'
  localStorage.setItem('user-locale', 'vi')
}
</script>
```

## Translation Key Naming Conventions

### Structure:
```
section.feature.specific
```

### Examples:
- `auth.login.title` - Login page title
- `auth.login.validation.emailRequired` - Email validation error
- `products.categories.snack` - Snack category name
- `cart.proceedToCheckout` - Checkout button text

### Best Practices:
1. **Be specific:** Use descriptive key names
2. **Group logically:** Keep related translations together
3. **Use camelCase:** For multi-word keys
4. **Avoid nesting too deep:** Max 3-4 levels

## Common Patterns

### Form Labels
```typescript
form: {
  email: 'Email',
  emailPlaceholder: 'Nhập email của bạn',
  password: 'Mật khẩu',
  passwordPlaceholder: 'Nhập mật khẩu'
}
```

### Validation Messages
```typescript
validation: {
  required: 'Trường này là bắt buộc',
  emailInvalid: 'Email không hợp lệ',
  minLength: 'Tối thiểu {min} ký tự'
}
```

### Actions
```typescript
actions: {
  save: 'Lưu',
  cancel: 'Hủy',
  delete: 'Xóa',
  edit: 'Chỉnh sửa'
}
```

### Status Messages
```typescript
status: {
  success: 'Thành công!',
  error: 'Có lỗi xảy ra',
  loading: 'Đang tải...'
}
```

## Testing Translations

### Manual Testing:
1. Switch to Vietnamese: Check all text displays correctly
2. Switch to English: Verify translations match intent
3. Test with long text: Ensure UI doesn't break
4. Check placeholders: Verify they're visible in inputs
5. Test modals: Confirm confirmation dialogs are translated

### Check Coverage:
```bash
# Search for hardcoded strings (potential untranslated text)
grep -r "placeholder=\"[A-Z]" src/
grep -r ">Back to<" src/
grep -r ">View<" src/
```

## Current Language Support

| Language | Code | Status | Default |
|----------|------|--------|---------|
| Vietnamese | `vi` | ✅ Complete | ✅ Yes |
| English | `en` | ✅ Complete | ❌ No |

## Available Translation Sections

### Common (`common.*`)
- Buttons, actions, generic terms
- Example: `common.save`, `common.cancel`

### Navigation (`nav.*`)
- Menu items, links
- Example: `nav.home`, `nav.products`

### Home (`home.*`)
- Landing page content
- Example: `home.title`, `home.subtitle`

### Products (`products.*`)
- Product listing, filtering, details
- Example: `products.title`, `products.addToCart`

### Cart (`cart.*`)
- Shopping cart functionality
- Example: `cart.title`, `cart.checkout`

### Auth (`auth.*`)
- Login, register, authentication
- Example: `auth.login.title`, `auth.register.success`

### Checkout (`checkout.*`)
- Order placement
- Example: `checkout.title`, `checkout.placeOrder`

### Orders (`orders.*`)
- Order history
- Example: `orders.title`, `orders.status`

### Admin (`admin.*`)
- Admin panel
- Example: `admin.title`, `admin.dashboard`

### Errors (`errors.*`)
- Error messages
- Example: `errors.generic`, `errors.network`

## Troubleshooting

### Translation not showing:
1. Check key exists in BOTH `vi.ts` and `en.ts`
2. Verify spelling matches exactly (case-sensitive)
3. Ensure proper nesting structure
4. Check browser console for warnings

### Language not switching:
1. Verify localStorage has correct value
2. Check language switcher is updating `locale.value`
3. Ensure i18n is properly initialized in `main.ts`

### Missing translations:
1. Add to both language files
2. Restart dev server if using HMR
3. Clear browser cache if needed

## IDE Setup (VS Code)

### Recommended Extensions:
- **i18n Ally** - Translation management
- **Vue Language Features (Volar)** - Vue 3 support

### i18n Ally Configuration:
```json
{
  "i18n-ally.localesPaths": ["src/locales"],
  "i18n-ally.keystyle": "nested",
  "i18n-ally.enabledFrameworks": ["vue", "vue-sfc"]
}
```

## Resources

- [vue-i18n Documentation](https://vue-i18n.intlify.dev/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

**Last Updated:** December 2024  
**Version:** 1.0  
**Maintainer:** Development Team
