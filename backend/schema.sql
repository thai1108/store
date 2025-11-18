-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('snack', 'drink', 'milk-tea')),
  imageUrl TEXT,
  inStock INTEGER DEFAULT 1,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  avatarUrl TEXT,
  passwordHash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER,
  totalAmount REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  customerName TEXT NOT NULL,
  customerPhone TEXT NOT NULL,
  customerEmail TEXT,
  customerAddress TEXT,
  notes TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users (id)
);

-- Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  productId INTEGER NOT NULL,
  imageUrl TEXT NOT NULL,
  displayOrder INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (productId) REFERENCES products (id) ON DELETE CASCADE
);

-- Create product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  productId INTEGER NOT NULL,
  size TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  priceAdjustment REAL DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (productId) REFERENCES products (id) ON DELETE CASCADE
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orderId INTEGER NOT NULL,
  productId INTEGER NOT NULL,
  productName TEXT NOT NULL,
  variantId INTEGER,
  variantSize TEXT,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  FOREIGN KEY (orderId) REFERENCES orders (id),
  FOREIGN KEY (productId) REFERENCES products (id)
);

-- Create cart_items table for persisting user carts
CREATE TABLE IF NOT EXISTS cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  productId INTEGER NOT NULL,
  productName TEXT NOT NULL,
  variantId INTEGER,
  variantSize TEXT,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  imageUrl TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users (id),
  FOREIGN KEY (productId) REFERENCES products (id),
  UNIQUE(userId, productId, variantId)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_instock ON products (inStock);
CREATE INDEX IF NOT EXISTS idx_product_images_productid ON product_images (productId);
CREATE INDEX IF NOT EXISTS idx_product_variants_productid ON product_variants (productId);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_orders_userid ON orders (userId);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_order_items_orderid ON order_items (orderId);
CREATE INDEX IF NOT EXISTS idx_cart_items_userid ON cart_items (userId);