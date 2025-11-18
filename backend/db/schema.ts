import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';

export const products = sqliteTable('products', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  price: real('price').notNull(),
  category: text('category', { enum: ['snack', 'drink', 'milk-tea'] }).notNull(),
  imageUrl: text('imageUrl'),
  inStock: integer('inStock', { mode: 'boolean' }).default(true),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
}, (table) => ({
  categoryIdx: index('idx_products_category').on(table.category),
  inStockIdx: index('idx_products_instock').on(table.inStock),
  createdAtIdx: index('idx_products_created_at').on(table.createdAt),
}));

export const productImages = sqliteTable('product_images', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  productId: integer('productId', { mode: 'number' }).notNull().references(() => products.id, { onDelete: 'cascade' }),
  imageUrl: text('imageUrl').notNull(),
  displayOrder: integer('displayOrder').notNull().default(0),
  createdAt: text('createdAt').notNull(),
}, (table) => ({
  productIdIdx: index('idx_product_images_productid').on(table.productId),
}));

export const productVariants = sqliteTable('product_variants', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  productId: integer('productId', { mode: 'number' }).notNull().references(() => products.id, { onDelete: 'cascade' }),
  size: text('size').notNull(),
  stock: integer('stock').notNull().default(0),
  priceAdjustment: real('priceAdjustment').default(0),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
}, (table) => ({
  productIdIdx: index('idx_product_variants_productid').on(table.productId),
}));

export const users = sqliteTable('users', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  phone: text('phone'),
  address: text('address'),
  avatarUrl: text('avatarUrl'),
  passwordHash: text('passwordHash').notNull(),
  role: text('role', { enum: ['customer', 'admin'] }).notNull().default('customer'),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
  createdAtIdx: index('idx_users_created_at').on(table.createdAt),
}));

export const orders = sqliteTable('orders', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: integer('userId', { mode: 'number' }).references(() => users.id),
  totalAmount: real('totalAmount').notNull(),
  status: text('status', { 
    enum: ['pending', 'confirmed', 'completed', 'cancelled'] 
  }).notNull().default('pending'),
  customerName: text('customerName').notNull(),
  customerPhone: text('customerPhone').notNull(),
  customerEmail: text('customerEmail'),
  customerAddress: text('customerAddress'),
  notes: text('notes'),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
}, (table) => ({
  userIdIdx: index('idx_orders_userid').on(table.userId),
  statusIdx: index('idx_orders_status').on(table.status),
  createdAtIdx: index('idx_orders_created_at').on(table.createdAt),
}));

export const orderItems = sqliteTable('order_items', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  orderId: integer('orderId', { mode: 'number' }).notNull().references(() => orders.id),
  productId: integer('productId', { mode: 'number' }).notNull().references(() => products.id),
  productName: text('productName').notNull(),
  variantId: integer('variantId', { mode: 'number' }),
  variantSize: text('variantSize'),
  quantity: integer('quantity').notNull(),
  price: real('price').notNull(),
}, (table) => ({
  orderIdIdx: index('idx_order_items_orderid').on(table.orderId),
}));

export const cartItems = sqliteTable('cart_items', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('userId').notNull().references(() => users.id),
  productId: text('productId').notNull().references(() => products.id),
  productName: text('productName').notNull(),
  variantId: text('variantId'),
  variantSize: text('variantSize'),
  quantity: integer('quantity').notNull(),
  price: real('price').notNull(),
  imageUrl: text('imageUrl'),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
}, (table) => ({
  userIdIdx: index('idx_cart_items_userid').on(table.userId),
}));

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type InsertProductImage = typeof productImages.$inferInsert;
export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = typeof productVariants.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;
