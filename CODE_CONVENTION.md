# 📘 Code Convention – Snack/Drink/Milk Tea Selling Website

## Table of Contents
1. [General Guidelines](#1-general-guidelines)  
2. [Frontend Convention (Vue)](#2-frontend-convention-vue)  
3. [Backend Convention (Cloudflare Worker)](#3-backend-convention-cloudflare-worker)  
4. [API Design](#4-api-design)  
5. [Folder Structure Guidelines](#5-folder-structure-guidelines)  
6. [Style Guide & Linting](#6-style-guide--linting)  
7. [Git Convention](#7-git-convention)  
8. [Review Code Checklist](#8-review-code-checklist)

---

# 1. General Guidelines

### ✔️ Code Principles
- Clean Code: easy to read – easy to understand – easy to maintain.
- All variable/function names must be **meaningful**.
- Avoid hard-coded values: use `.env` or configuration files.
- Prefer immutability: use `const` whenever possible.
- Separate logic by domain (`product`, `order`, `auth`, `customer`).
- No function should exceed **50 lines**.
- No file should exceed **300 lines**.
- TypeScript strict mode is recommended.

---

# 2. Frontend Convention (Vue)

## 2.1 File & Component Naming

| Type          | Naming Convention    |
| ------------- | -------------------- |
| Vue Component | `PascalCase.vue`     |
| Page/View     | `PascalCaseView.vue` |
| Store         | `xxx.store.ts`       |
| Composable    | `useSomething.ts`    |
| TS/JS file    | `kebab-case.ts`      |

**Examples:**
```

ProductCard.vue
OrderHistoryView.vue
useFetchProducts.ts
product.store.ts

````

---

## 2.2 Vue File Structure

```vue
<script setup lang="ts">
// Import order: Vue → libraries → stores → components → utils
</script>

<template>
  <!-- Avoid heavy logic in the template -->
</template>

<style scoped>
/* Avoid using !important */
</style>
````

---

## 2.3 Naming Rules

* Variables/parameters: `camelCase`
* Components: `PascalCase`
* Emitted events: `kebab-case`
* Constants: `UPPER_SNAKE_CASE`

---

## 2.4 Vue Coding Rules

* Put business logic in `services` or `composables`, NOT inside components.
* Use `computed` instead of methods if cache is needed.
* Use `watch` only when necessary.
* Always use TypeScript for `<script setup>`.

---

# 3. Backend Convention (Cloudflare Worker)

## 3.1 Directory Structure

```
/backend
  /routes
  /services
  /repositories
  /types
  /utils
  index.ts
```

---

## 3.2 Route & Service Rules

Route should only forward requests:

```ts
export const productRouter = async (req: Request, env: Env) => {
  return productService.getAll(env);
};
```

Service contains business logic:

```ts
export const productService = {
  async getAll(env: Env) {
    return {
      success: true,
      data: await env.DB.listProducts(),
    };
  },
};
```

---

## 3.3 Error Response & Logging Rules

### Standard Error Response

```json
{
  "success": false,
  "message": "Product not found"
}
```

### Recommended Status Codes

| Code | Meaning        |
| ---- | -------------- |
| 200  | OK             |
| 201  | Created        |
| 400  | Bad Request    |
| 401  | Unauthorized   |
| 403  | Forbidden      |
| 404  | Not Found      |
| 500  | Internal Error |

Logging rules:

* Use `console.error()` for backend errors.
* Never log sensitive data.

---

## 3.4 Naming Rules

* Function: `camelCase`
* Class: `PascalCase`
* Interface/Type: `PascalCase`
* R2 bucket name: `kebab-case`
* KV key: `snake_case`

---

# 4. API Design

## 4.1 RESTful Standard Endpoints

```
GET     /api/products
GET     /api/products/:id
POST    /api/products
PUT     /api/products/:id
DELETE  /api/products/:id

POST    /api/orders
GET     /api/orders/:id
GET     /api/users/me/orders
```

---

## 4.2 Standard Response Format

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

---

## 4.3 Naming Conventions

* No verbs in endpoints
  ❌ `/api/getProducts`
  ✔️ `/api/products`

* Collections use **plural nouns**
  ✔️ `/products`, `/orders`

---

## 4.4 API Versioning

```
/api/v1/products
```

---

# 5. Folder Structure Guidelines

```
/frontend
  /src
    /components
    /views
    /stores
    /services
    /composables
    /assets
    /utils
    /router
    /types

/backend
  /routes
  /services
  /repositories
  /types
  /utils
  index.ts

/scripts
.env
```

---

# 6. Style Guide & Linting

## 6.1 Tools

* ESLint
* Prettier
* Stylelint (if using CSS)
* TypeScript strict mode

---

## 6.2 Prettier Config

```json
{
  "singleQuote": true,
  "semi": true,
  "printWidth": 100,
  "trailingComma": "all",
  "tabWidth": 2
}
```

---

## 6.3 ESLint Rules (Recommended)

```json
{
  "rules": {
    "no-unused-vars": "error",
    "no-console": "warn",
    "eqeqeq": "error",
    "curly": "error",
    "no-var": "error",
    "prefer-const": "error"
  }
}
```

---

# 7. Git Convention

## 7.1 Branching Strategy

```
main
develop
feature/*
fix/*
hotfix/*
```

---

## 7.2 Conventional Commit Style

```
feat: add product management page  
fix: incorrect product price rounding  
refactor: simplify order service  
style: format code  
chore: update dependencies  
docs: update API documentation  
```

---

# 8. Review Code Checklist

### ✔️ Functionality

* Does the code work correctly?
* Are edge cases handled?

### ✔️ Clean Code

* Are functions/files too long?
* Any duplicated logic?

### ✔️ Security

* No exposed API keys.
* Input validated properly.

### ✔️ Performance

* Avoid unnecessary R2 or KV calls.
* Avoid duplicated queries.

### ✔️ Formatting

* Prettier applied?
* No temporary files committed?
