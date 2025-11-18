import { eq, and, gte, lte, desc, lt, or, inArray } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { Product, CreateProductRequest, ProductFilter, ProductVariant, ProductImage } from '@/types/product';
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
  async loadVariantsAndImages(env: Environment, productIds: number[]): Promise<{
    variants: Map<number, ProductVariant[]>;
    images: Map<number, ProductImage[]>;
  }> {
    if (productIds.length === 0) {
      return { variants: new Map(), images: new Map() };
    }

    const db = getDb(env);
    
    const [variantsData, imagesData] = await Promise.all([
      db.select()
        .from(schema.productVariants)
        .where(inArray(schema.productVariants.productId, productIds)),
      db.select()
        .from(schema.productImages)
        .where(inArray(schema.productImages.productId, productIds))
        .orderBy(schema.productImages.displayOrder),
    ]);

    const variants = new Map<number, ProductVariant[]>();
    const images = new Map<number, ProductImage[]>();

    variantsData.forEach((v) => {
      if (!variants.has(v.productId)) variants.set(v.productId, []);
      variants.get(v.productId)!.push({
        id: String(v.id),
        productId: String(v.productId),
        size: v.size,
        stock: v.stock,
        priceAdjustment: v.priceAdjustment || 0,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
      });
    });

    imagesData.forEach((img) => {
      if (!images.has(img.productId)) images.set(img.productId, []);
      images.get(img.productId)!.push({
        id: String(img.id),
        productId: String(img.productId),
        imageUrl: img.imageUrl,
        displayOrder: img.displayOrder,
        createdAt: img.createdAt,
      });
    });

    return { variants, images };
  },

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
        conditions.push(
          or(
            lt(schema.products.createdAt, decoded.createdAt),
            and(
              eq(schema.products.createdAt, decoded.createdAt),
              lt(schema.products.id, Number(decoded.id))
            )
          )
        );
      }
    }

    const validConditions = conditions.filter(Boolean);
    const query = validConditions.length > 0
      ? db.select().from(schema.products).where(and(...validConditions))
      : db.select().from(schema.products);
    const results = await query
      .orderBy(desc(schema.products.createdAt), desc(schema.products.id))
      .limit(limit);

    const hasMore = results.length > limit - 1;
    const data = hasMore ? results.slice(0, -1) : results;
    
    // Load variants and images for all products
    const productIds = data.map(p => p.id);
    const { variants, images } = await this.loadVariantsAndImages(env, productIds);
    
    const productsWithRelations: Product[] = data.map(p => ({
      id: String(p.id),
      name: p.name,
      description: p.description || '',
      price: p.price,
      category: p.category,
      imageUrl: p.imageUrl || undefined,
      inStock: p.inStock ?? true,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      variants: variants.get(p.id) || [],
      images: images.get(p.id) || [],
    }));

    const nextCursor = hasMore && data.length > 0
      ? encodeCursor(String(data[data.length - 1].id), data[data.length - 1].createdAt)
      : null;

    return {
      data: productsWithRelations,
      nextCursor,
      hasMore,
    };
  },

  async getById(env: Environment, id: string): Promise<Product | null> {
    const db = getDb(env);
    const result = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.id, Number(id)))
      .limit(1);

    if (!result[0]) return null;

    const product = result[0];
    const { variants, images } = await this.loadVariantsAndImages(env, [product.id]);

    return {
      id: String(product.id),
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl || undefined,
      inStock: product.inStock ?? true,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      variants: variants.get(product.id) || [],
      images: images.get(product.id) || [],
    };
  },

  async create(env: Environment, data: CreateProductRequest): Promise<Product> {
    const db = getDb(env);
    const now = getCurrentTimestamp();
    const insertData = {
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      imageUrl: data.imageUrl,
      inStock: data.inStock,
      createdAt: now,
      updatedAt: now,
    };
    
    const result = await db.insert(schema.products).values(insertData);
    
    // D1 returns lastInsertRowid as a number in meta
    const productId = typeof result === 'object' && 'meta' in result 
      ? (result.meta as any).last_row_id 
      : (result as any).lastInsertRowid;

    if (!productId) {
      throw new Error('Failed to get product ID after insert');
    }

    // Insert variants if provided
    if (data.variants && data.variants.length > 0) {
      const variantInserts = data.variants.map(v => ({
        productId: Number(productId),
        size: v.size,
        stock: v.stock,
        priceAdjustment: v.priceAdjustment || 0,
        createdAt: now,
        updatedAt: now,
      }));
      await db.insert(schema.productVariants).values(variantInserts);
    }

    // Insert images if provided
    if (data.images && data.images.length > 0) {
      const imageInserts = data.images.map((img, idx) => ({
        productId: Number(productId),
        imageUrl: img.imageUrl,
        displayOrder: img.displayOrder ?? idx,
        createdAt: now,
      }));
      await db.insert(schema.productImages).values(imageInserts);
    }

    return this.getById(env, String(productId)) as Promise<Product>;
  },

  async update(env: Environment, id: string, data: Partial<Product>): Promise<Product | null> {
    const db = getDb(env);
    const existing = await this.getById(env, id);
    if (!existing) {
      return null;
    }
    
    const { id: _, variants, images, ...updateData } = data;
    const updatedProduct = {
      ...updateData,
      updatedAt: getCurrentTimestamp(),
    };
    
    await db
      .update(schema.products)
      .set(updatedProduct)
      .where(eq(schema.products.id, Number(id)));

    // Update variants if provided
    if (variants !== undefined) {
      // Delete existing variants
      await db.delete(schema.productVariants).where(eq(schema.productVariants.productId, Number(id)));
      
      // Insert new variants
      if (variants.length > 0) {
        const now = getCurrentTimestamp();
        const variantInserts = variants.map(v => ({
          productId: Number(id),
          size: v.size,
          stock: v.stock,
          priceAdjustment: v.priceAdjustment || 0,
          createdAt: now,
          updatedAt: now,
        }));
        await db.insert(schema.productVariants).values(variantInserts);
      }
    }

    // Update images if provided
    if (images !== undefined) {
      // Delete existing images
      await db.delete(schema.productImages).where(eq(schema.productImages.productId, Number(id)));
      
      // Insert new images
      if (images.length > 0) {
        const now = getCurrentTimestamp();
        const imageInserts = images.map((img, idx) => ({
          productId: Number(id),
          imageUrl: img.imageUrl,
          displayOrder: img.displayOrder ?? idx,
          createdAt: now,
        }));
        await db.insert(schema.productImages).values(imageInserts);
      }
    }

    return this.getById(env, id);
  },

  async delete(env: Environment, id: string): Promise<boolean> {
    const db = getDb(env);
    const result = await db
      .delete(schema.products)
      .where(eq(schema.products.id, Number(id)));
    return (result as any).changes > 0;
  },
};