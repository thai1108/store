import { Product, CreateProductRequest, ProductFilter } from '@/types/product';
import { Environment } from '@/types/common';
import { generateId, getCurrentTimestamp } from '@/utils/helpers';

export const productRepository = {
  async getAll(env: Environment, filter?: ProductFilter): Promise<Product[]> {
    let query = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];

    if (filter?.category) {
      query += ' AND category = ?';
      params.push(filter.category);
    }

    if (filter?.inStock !== undefined) {
      query += ' AND inStock = ?';
      params.push(filter.inStock ? 1 : 0);
    }

    if (filter?.minPrice !== undefined) {
      query += ' AND price >= ?';
      params.push(filter.minPrice);
    }

    if (filter?.maxPrice !== undefined) {
      query += ' AND price <= ?';
      params.push(filter.maxPrice);
    }

    query += ' ORDER BY createdAt DESC';

    const result = await env.DB.prepare(query).bind(...params).all();
    return result.results as Product[];
  },

  async getById(env: Environment, id: string): Promise<Product | null> {
    const result = await env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
    return result as Product | null;
  },

  async create(env: Environment, data: CreateProductRequest): Promise<Product> {
    const id = generateId();
    const now = getCurrentTimestamp();

    const product: Product = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    await env.DB.prepare(
      `INSERT INTO products (id, name, description, price, category, imageUrl, inStock, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        product.id,
        product.name,
        product.description,
        product.price,
        product.category,
        product.imageUrl || null,
        product.inStock ? 1 : 0,
        product.createdAt,
        product.updatedAt,
      )
      .run();

    return product;
  },

  async update(env: Environment, id: string, data: Partial<Product>): Promise<Product | null> {
    const existing = await this.getById(env, id);
    if (!existing) {
      return null;
    }

    const updatedProduct = {
      ...existing,
      ...data,
      id,
      updatedAt: getCurrentTimestamp(),
    };

    await env.DB.prepare(
      `UPDATE products SET name = ?, description = ?, price = ?, category = ?, 
       imageUrl = ?, inStock = ?, updatedAt = ? WHERE id = ?`,
    )
      .bind(
        updatedProduct.name,
        updatedProduct.description,
        updatedProduct.price,
        updatedProduct.category,
        updatedProduct.imageUrl || null,
        updatedProduct.inStock ? 1 : 0,
        updatedProduct.updatedAt,
        id,
      )
      .run();

    return updatedProduct;
  },

  async delete(env: Environment, id: string): Promise<boolean> {
    const result = await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
    return result.changes > 0;
  },
};