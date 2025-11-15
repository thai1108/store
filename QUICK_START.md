# 🚀 Quick Start Guide - TeaStore Frontend

## Prerequisites
- Node.js v16+ installed
- npm or yarn package manager

## Installation

### 1. Install Dependencies
```bash
cd frontend
npm install
```

This will install:
- Vue 3
- Ant Design Vue v4.1.2
- @ant-design/icons-vue v7.0.1
- Pinia (state management)
- Vue Router
- Axios
- TypeScript
- Vite (build tool)

### 2. Start Development Server
```bash
npm run dev
```

The app will be available at: `http://localhost:5173`

### 3. Build for Production
```bash
npm run build
```

Built files will be in the `dist/` directory.

---

## 🎨 New Features Overview

### For Users
1. **Beautiful Home Page** - Hero section with animated elements
2. **Advanced Product Filters** - Search, category filter, stock filter
3. **Smooth Shopping Cart** - Easy quantity management with confirmations
4. **Modern Login/Register** - Validated forms with beautiful UI
5. **Mobile Friendly** - Works perfectly on all devices

### For Developers
1. **Ant Design Components** - Professional UI components
2. **TypeScript Support** - Type-safe code
3. **Responsive Design** - Mobile-first approach
4. **Animations** - Smooth transitions everywhere
5. **Code Quality** - ESLint + Prettier configured

---

## 📱 Testing Responsive Design

### Desktop View (1200px+)
- Full navigation bar
- 3-4 column product grid
- Sticky cart summary
- All features visible

### Tablet View (768px - 1199px)
- Horizontal navigation
- 2-3 column product grid
- Adjusted spacing

### Mobile View (< 768px)
- Hamburger menu
- 1 column layout
- Stackable filters
- Touch-friendly buttons

---

## 🎯 Key Pages to Test

1. **Home** (`/`)
   - Hero section with CTA buttons
   - Featured products grid
   - Feature cards section

2. **Products** (`/products`)
   - Advanced filtering
   - Real-time search
   - Product cards with animations

3. **Cart** (`/cart`)
   - Add/remove items
   - Update quantities
   - Order summary

4. **Login** (`/login`)
   - Form validation
   - Error handling
   - Responsive design

5. **Register** (`/register`)
   - Multi-field form
   - Password validation
   - Phone number validation

---

## 🛠️ Development Tips

### Hot Module Replacement (HMR)
Vite provides instant updates during development. Just save your file and see changes immediately!

### Component Structure
```
frontend/src/
├── components/       # Reusable components
│   ├── NavBar.vue
│   └── ProductCard.vue
├── views/           # Page components
│   ├── HomeView.vue
│   ├── ProductListView.vue
│   ├── CartView.vue
│   ├── LoginView.vue
│   └── RegisterView.vue
├── stores/          # Pinia stores
├── services/        # API services
├── types/           # TypeScript types
└── assets/          # Static assets
```

### Adding New Ant Design Components
```typescript
// Already configured globally in main.ts
// Just import icons as needed:
import { YourIcon } from '@ant-design/icons-vue';
```

### Custom Animations
Use the utility classes from `style.css`:
```vue
<div class="fade-in">Content</div>
<div class="hover-lift">Hover me</div>
<div class="scale-in">Scale animation</div>
```

---

## 🎨 Customization

### Theme Colors
Edit in `src/assets/style.css`:
```css
:root {
  --primary-color: #1890ff;
  --success-color: #52c41a;
  --warning-color: #faad14;
  --error-color: #ff4d4f;
}
```

### Ant Design Theme
Modify in `main.ts`:
```typescript
import Antd from "ant-design-vue";
app.use(Antd);
```

---

## 🐛 Common Issues

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
# Or use a different port
npm run dev -- --port 3000
```

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Restart VS Code TypeScript server
# CMD/CTRL + Shift + P -> "TypeScript: Restart TS Server"
```

---

## 📚 Resources

- [Vue 3 Docs](https://vuejs.org/)
- [Ant Design Vue](https://antdv.com/)
- [Vite Guide](https://vitejs.dev/)
- [Pinia Docs](https://pinia.vuejs.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## ✅ Checklist Before Deployment

- [ ] Run `npm run build` successfully
- [ ] Test all pages on mobile/tablet/desktop
- [ ] Check all forms validation
- [ ] Verify API endpoints configuration
- [ ] Test user authentication flow
- [ ] Check console for errors
- [ ] Optimize images if needed
- [ ] Configure environment variables
- [ ] Set up proper CORS for backend
- [ ] Test shopping cart functionality

---

## 🎉 You're Ready!

The frontend is now fully refactored with:
- ✅ Modern UI using Ant Design Vue
- ✅ Smooth animations throughout
- ✅ Full responsive design
- ✅ Type-safe with TypeScript
- ✅ Production-ready code

Happy coding! 🚀
