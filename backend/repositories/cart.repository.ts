import { CartItem } from '../types/order';

export interface CartRepository {
  getByUserId(userId: string): Promise<CartItem[]>;
  saveCart(userId: string, items: CartItem[]): Promise<void>;
  clearCart(userId: string): Promise<void>;
  addItem(userId: string, item: CartItem): Promise<void>;
  updateItemQuantity(userId: string, productId: string, quantity: number): Promise<void>;
  removeItem(userId: string, productId: string): Promise<void>;
}

export class D1CartRepository implements CartRepository {
  constructor(private db: D1Database) {}

  async getByUserId(userId: string): Promise<CartItem[]> {
    const result = await this.db
      .prepare(
        `SELECT productId, productName, quantity, price, imageUrl
         FROM cart_items 
         WHERE userId = ?
         ORDER BY createdAt DESC`
      )
      .bind(userId)
      .all();

    return (result.results as unknown as CartItem[]) || [];
  }

  async saveCart(userId: string, items: CartItem[]): Promise<void> {
    // Clear existing cart
    await this.clearCart(userId);

    // Insert new items
    if (items.length === 0) return;

    const now = new Date().toISOString();
    
    // Use batch insert for better performance
    const statements = items.map((item) =>
      this.db
        .prepare(
          `INSERT INTO cart_items (userId, productId, productName, quantity, price, imageUrl, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          userId,
          item.productId,
          item.productName,
          item.quantity,
          item.price,
          item.imageUrl || null,
          now,
          now
        )
    );

    await this.db.batch(statements);
  }

  async clearCart(userId: string): Promise<void> {
    await this.db
      .prepare('DELETE FROM cart_items WHERE userId = ?')
      .bind(userId)
      .run();
  }

  async addItem(userId: string, item: CartItem): Promise<void> {
    const now = new Date().toISOString();
    
    // Check if item already exists
    const existing = await this.db
      .prepare('SELECT quantity FROM cart_items WHERE userId = ? AND productId = ?')
      .bind(userId, item.productId)
      .first();

    if (existing) {
      // Update quantity
      await this.db
        .prepare(
          `UPDATE cart_items 
           SET quantity = quantity + ?, updatedAt = ?
           WHERE userId = ? AND productId = ?`
        )
        .bind(item.quantity, now, userId, item.productId)
        .run();
    } else {
      // Insert new item
      await this.db
        .prepare(
          `INSERT INTO cart_items (userId, productId, productName, quantity, price, imageUrl, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          userId,
          item.productId,
          item.productName,
          item.quantity,
          item.price,
          item.imageUrl || null,
          now,
          now
        )
        .run();
    }
  }

  async updateItemQuantity(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<void> {
    if (quantity <= 0) {
      await this.removeItem(userId, productId);
      return;
    }

    const now = new Date().toISOString();
    await this.db
      .prepare(
        `UPDATE cart_items 
         SET quantity = ?, updatedAt = ?
         WHERE userId = ? AND productId = ?`
      )
      .bind(quantity, now, userId, productId)
      .run();
  }

  async removeItem(userId: string, productId: string): Promise<void> {
    await this.db
      .prepare('DELETE FROM cart_items WHERE userId = ? AND productId = ?')
      .bind(userId, productId)
      .run();
  }
}
