const fs = require('fs');

const categories = ['milk-tea', 'drink', 'snack'];
const productNames = [
  'Bubble Milk Tea', 'Taro Milk Tea', 'Green Tea Latte', 'Matcha Latte', 'Thai Milk Tea',
  'Brown Sugar Milk Tea', 'Honeydew Milk Tea', 'Strawberry Milk Tea', 'Mango Smoothie', 'Passion Fruit Tea',
  'Lychee Tea', 'Peach Tea', 'Wintermelon Tea', 'Oolong Tea', 'Jasmine Tea',
  'Iced Coffee', 'Hot Coffee', 'Cappuccino', 'Espresso', 'Americano',
  'Potato Chips', 'Chocolate Cookies', 'Brownies', 'Cheesecake', 'Tiramisu',
  'Pudding', 'Ice Cream', 'Waffle', 'Croissant', 'Donut'
];

const imageUrls = [
  'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=300',
  'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300',
  'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300',
  'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300',
  'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300',
  'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300',
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300',
  'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=300',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300'
];

let sql = `-- Generated seed data with 1000 products and 1000 customers\n\n`;

// Generate 1000 products
sql += `-- Insert 1000 products\n`;
for (let i = 1; i <= 1000; i++) {
  const name = productNames[Math.floor(Math.random() * productNames.length)];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const price = Math.floor(Math.random() * 50 + 20) * 1000; // 20k-70k
  const imageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];
  const description = `Delicious ${name} - Product #${i}`;
  const inStock = Math.random() > 0.1 ? 1 : 0; // 90% in stock
  
  sql += `INSERT INTO products (name, description, price, category, imageUrl, inStock, createdAt, updatedAt) VALUES ('${name} #${i}', '${description}', ${price}, '${category}', '${imageUrl}', ${inStock}, datetime('now'), datetime('now'));\n`;
}

sql += `\n-- Sample admin user (password: admin123)\n`;
sql += `INSERT INTO users (email, name, phone, passwordHash, role, createdAt, updatedAt) VALUES ('admin@teatstore.com', 'Admin User', '+84123456789', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'admin', datetime('now'), datetime('now'));\n\n`;

// Generate 1000 customers
sql += `-- Insert 1000 customers (password: customer123 for all)\n`;
for (let i = 1; i <= 1000; i++) {
  const email = `customer${i}@teatstore.com`;
  const name = `Customer ${i}`;
  const phone = `+84${String(100000000 + i).substring(0, 9)}`;
  const passwordHash = 'f6e0a1e2ac41945a9aa7ff8a8aaa0cebc12a3bcc981a929ad5cf810a090e11ae'; // customer123
  
  sql += `INSERT INTO users (email, name, phone, passwordHash, role, createdAt, updatedAt) VALUES ('${email}', '${name}', '${phone}', '${passwordHash}', 'customer', datetime('now'), datetime('now'));\n`;
}

fs.writeFileSync('sample-data.sql', sql, 'utf8');
console.log('✅ Generated sample-data.sql with 1000 products and 1000 customers');
