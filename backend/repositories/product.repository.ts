import { eq, and, gte, lte, desc, lt } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { Product, CreateProductRequest, ProductFilter } from '@/types/product';
import { Environment } from '@/types/common';
import { generateId, getCurrentTimestamp } from '@/utils/helpers';
import { 
  CursorPaginationParams, 
  CursorPaginationResult,
  decodeCursor,
  encodeCursor,
  getLimit,
} from '@/utils/pagination';

export const productRepository = {
  async getAll(
    env: Environment, 
    filter?: ProductFilter,
    pagination?: CursorPaginationParams,
  ): Promise<CursorPaginationResult<Product>> {
    const db = getDb(env);
    const limit = getLimit(pagination?.limit) + 1;
    
    const conditions = [];
    
    if (filter?.category) {
      conditions.push(eq(schema.products.category, filter.category as any));
    }
    
    if (filter?.inStock !== undefined) {
      conditions.push(eq(schema.products.inStock, filter.inStock));
    }
    
    if (filter?.minPrice !== undefined) {
      conditions.push(gte(schema.products.price, filter.minPrice));
    }
    
    if (filter?.maxPrice !== undefined) {
      conditions.push(lte(schema.products.price, filter.maxPrice));
    }

    if (pagination?.cursor) {
      const decoded = decodeCursor(pagination.cursor);
      if (decoded) {
        conditions.push(lt(schema.products.createdAt, decoded.createdAt));
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db
      .select()
      .from(schema.products)
      .where(whereClause)
      .orderBy(desc(schema.products.createdAt))
      .limit(limit);

    const hasMore = results.length > limit - 1;
    const data = hasMore ? results.slice(0, -1) : results;
    
    const nextCursor = hasMore && data.length > 0
      ? encodeCursor(data[data.length - 1].id, data[data.length - 1].createdAt)
      : null;

    return {
      data: data as Product[],
      nextCursor,
      hasMore,
    };
  },

  async getById(env: Environment, id: string): Promise<Product | null> {
    const db = getDb(env);
    const result = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.id, id))
      .limit(1);

    return result[0] as Product | null;
  },

  async create(env: Environment, data: CreateProductRequest): Promise<Product> {
    const db = getDb(env);
    const id = generateId();
    const now = getCurrentTimestamp();

    const product: Product = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(schema.products).values(product);

    return product;
  },

  async update(env: Environment, id: string, data: Partial<Product>): Promise<Product | null> {
    const db = getDb(env);
    const existing = await this.getById(env, id);
    
    if (!existing) {
      return null;
    }

    const updatedProduct = {
      ...data,
      updatedAt: getCurrentTimestamp(),
    };

    await db
      .update(schema.products)
      .set(updatedProduct)
      .where(eq(schema.products.id, id));

    return { ...existing, ...updatedProduct } as Product;
  },

  async delete(env: Environment, id: string): Promise<boolean> {
    const db = getDb(env);
    const result = await db
      .delete(schema.products)
      .where(eq(schema.products.id, id));

    return (result as any).changes > 0;
  },
};