-- Sample products for testing
INSERT INTO products (id, name, description, price, category, imageUrl, inStock, createdAt, updatedAt) VALUES
('prod-1', 'Bubble Milk Tea', 'Classic bubble tea with chewy tapioca pearls', 45000, 'milk-tea', 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=300', 1, datetime('now'), datetime('now')),
('prod-2', 'Taro Milk Tea', 'Creamy taro flavored milk tea with a purple twist', 50000, 'milk-tea', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300', 1, datetime('now'), datetime('now')),
('prod-3', 'Green Tea Latte', 'Smooth green tea with steamed milk', 40000, 'drink', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300', 1, datetime('now'), datetime('now')),
('prod-4', 'Potato Chips', 'Crispy salted potato chips', 25000, 'snack', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300', 1, datetime('now'), datetime('now')),
('prod-5', 'Chocolate Cookies', 'Homemade chocolate chip cookies', 35000, 'snack', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300', 1, datetime('now'), datetime('now')),
('prod-6', 'Iced Coffee', 'Cold brew coffee with ice', 30000, 'drink', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300', 1, datetime('now'), datetime('now'));

-- Sample admin user (password: admin123)
INSERT INTO users (id, email, name, phone, passwordHash, role, createdAt, updatedAt) VALUES
('user-admin', 'admin@teatstore.com', 'Admin User', '+84123456789', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'admin', datetime('now'), datetime('now'));

-- Sample customer user (password: customer123)  
INSERT INTO users (id, email, name, phone, passwordHash, role, createdAt, updatedAt) VALUES
('user-customer', 'customer@teatstore.com', 'Customer User', '+84987654321', 'f6e0a1e2ac41945a9aa7ff8a8aaa0cebc12a3bcc981a929ad5cf810a090e11ae', 'customer', datetime('now'), datetime('now'));
