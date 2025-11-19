-- Products
-- INSERT INTO products (id, name, description, price, category, imageUrl, inStock, createdAt, updatedAt) VALUES
-- (1, 'Matcha Hạt Phỉ', 'Matcha Hạt Phỉ', 40000, 'milk-tea', 'https://store-backend-production.stock-dev.workers.dev/api/storage/milk_tea/IMG_2362.JPG', 1, datetime('now'), datetime('now')),
-- (2, 'Trà Thái Xanh Kem Bơ Pháp', 'Trà Thái Xanh Kem Bơ Pháp', 40000, 'milk-tea', 'https://store-backend-production.stock-dev.workers.dev/api/storage/milk_tea/IMG_2365.JPG', 1, datetime('now'), datetime('now')),
-- (3, 'Hạt Dẻ Cười Kem Dẻo', 'Hạt Dẻ Cười Kem Dẻo', 40000, 'milk-tea', 'https://store-backend-production.stock-dev.workers.dev/api/storage/milk_tea/IMG_2366.JPG', 1, datetime('now'), datetime('now')),
-- (4, 'Hồng Trà Tiramisus', 'Hồng Trà Tiramisus', 40000, 'milk-tea', 'https://store-backend-production.stock-dev.workers.dev/api/storage/milk_tea/IMG_2361.JPG', 1, datetime('now'), datetime('now')),
-- (5, 'Olong Nhài Cốm Dẻo', 'Olong Nhài Cốm Dẻo', 40000, 'milk-tea', 'https://store-backend-production.stock-dev.workers.dev/api/storage/milk_tea/IMG_2363.JPG', 1, datetime('now'), datetime('now')),
-- (6, 'Choco Hạt Phỉ', 'Choco Hạt Phỉ', 40000, 'milk-tea', 'https://store-backend-production.stock-dev.workers.dev/api/storage/milk_tea/IMG_2364.JPG', 1, datetime('now'), datetime('now')),
-- (7, 'Kiều Mạch Nướng', 'Kiều Mạch Nướng', 40000, 'milk-tea', 'https://store-backend-production.stock-dev.workers.dev/api/storage/milk_tea/IMG_2360.JPG', 1, datetime('now'), datetime('now')),
-- (8, 'Khoai Môn Kem Chese', 'Khoai Môn Kem Chese', 40000, 'milk-tea', 'https://store-backend-production.stock-dev.workers.dev/api/storage/milk_tea/IMG_2359.JPG', 1, datetime('now'), datetime('now'));

-- Variants for Products
-- "id": "1", "productId": "8", "size": "M (500ml)", "stock": 1000, "priceAdjustment": 40000, "createdAt": "2025-11-19T15:15:07.037Z", "updatedAt": "2025-11-19T15:15:07.037Z"
INSERT INTO product_variants (id, productId, size, stock, priceAdjustment, createdAt, updatedAt) VALUES
(1, 1, 'S (350ml)', 0, 0, datetime('now'), datetime('now')),
(2, 1, 'M (500ml)', 1000, 5000, datetime('now'), datetime('now')),
(3, 1, 'L (650ml)', 0, 10000, datetime('now'), datetime('now')),
(4, 2, 'S (350ml)', 0, 0, datetime('now'), datetime('now')),
(5, 2, 'M (500ml)', 1000, 5000, datetime('now'), datetime('now')),
(6, 2, 'L (650ml)', 0, 10000, datetime('now'), datetime('now')),
(7, 3, 'S (350ml)', 0, 0, datetime('now'), datetime('now')),
(8, 3, 'M (500ml)', 1000, 5000, datetime('now'), datetime('now')),
(9, 3, 'L (650ml)', 0, 10000, datetime('now'), datetime('now')),
(10, 4, 'S (350ml)', 0, 0, datetime('now'), datetime('now')),
(11, 4, 'M (500ml)', 1000, 5000, datetime('now'), datetime('now')),
(12, 4, 'L (650ml)', 0, 10000, datetime('now'), datetime('now')),
(13, 5, 'S (350ml)', 0, 0, datetime('now'), datetime('now')),
(14, 5, 'M (500ml)', 1000, 5000, datetime('now'), datetime('now')),
(15, 5, 'L (650ml)', 0, 10000, datetime('now'), datetime('now')),
(16, 6, 'S (350ml)', 0, 0, datetime('now'), datetime('now')),
(17, 6, 'M (500ml)', 1000, 5000, datetime('now'), datetime('now')),
(18, 6, 'L (650ml)', 0, 10000, datetime('now'), datetime('now')),
(19, 7, 'S (350ml)', 0, 0, datetime('now'), datetime('now')),
(20, 7, 'M (500ml)', 1000, 5000, datetime('now'), datetime('now')),
(21, 7, 'L (650ml)', 0, 10000, datetime('now'), datetime('now')),
(22, 8, 'S (350ml)', 0, 0, datetime('now'), datetime('now')),
(23, 8, 'M (500ml)', 1000, 5000, datetime('now'), datetime('now')),
(24, 8, 'L (650ml)', 0, 10000, datetime('now'), datetime('now'));




-- -- admin user (password: admin123)
-- INSERT INTO users (email, name, phone, passwordHash, role, createdAt, updatedAt) VALUES ('vietthai1108@gmail.com', 'Admin User', '+84973797944', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'admin', datetime('now'), datetime('now'));

-- -- Insert normal customers (password: customer123 for all)
-- INSERT INTO users (email, name, phone, passwordHash, role, createdAt, updatedAt) VALUES ('customer1@teatstore.com', 'Customer 1', '+84100000001', 'f6e0a1e2ac41945a9aa7ff8a8aaa0cebc12a3bcc981a929ad5cf810a090e11ae', 'customer', datetime('now'), datetime('now'));
-- INSERT INTO users (email, name, phone, passwordHash, role, createdAt, updatedAt) VALUES ('customer2@teatstore.com', 'Customer 2', '+84100000002', 'f6e0a1e2ac41945a9aa7ff8a8aaa0cebc12a3bcc981a929ad5cf810a090e11ae', 'customer', datetime('now'), datetime('now'));
