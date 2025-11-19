// Helper: build cursor condition for pagination
function buildCursorCondition(createdAt: unknown, id: unknown) {
  if (
    typeof createdAt === 'string' && createdAt.length > 0 &&
    (typeof id === 'string' || typeof id === 'number') && String(id).length > 0
  ) {
    const idNum = typeof id === 'string' ? Number(id) : id;
    return or(
      lt(schema.orders.createdAt, createdAt),
      and(
        eq(schema.orders.createdAt, createdAt),
        lt(schema.orders.id, idNum)
      )
    );
  }
  return undefined;
}
import { eq, desc, lt, and, or } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { Order, CreateOrderRequest } from '@/types/order';
import { Environment } from '@/types/common';
import { getCurrentTimestamp } from '@/utils/helpers';
import {
  CursorPaginationParams,
  CursorPaginationResult,
  decodeCursor,
  encodeCursor,
  getLimit,
} from '@/utils/pagination';

export const orderRepository = {
  async create(env: Environment, data: CreateOrderRequest): Promise<Order> {
    const db = getDb(env);
    const now = getCurrentTimestamp();

    let totalAmount = 0;
    const enrichedItems = [];

    // ANTI-HACK: Validate tất cả items từ database, không tin tưởng client
    for (const item of data.items) {
      const product = await db
        .select()
        .from(schema.products)
        .where(eq(schema.products.id, Number(item.productId)))
        .limit(1);

      if (!product[0]) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }

      // 2. Kiểm tra product còn hàng không
      if (!product[0].inStock) {
        throw new Error(`Product "${product[0].name}" is out of stock`);
      }

      let finalPrice = product[0].price;
      let variantId: number | null = null;
      let variantSize: string | null = null;
      let variantPrice: number | null = null; // Giá variant riêng (nếu có)

      // 3. Nếu có variant, validate và tính giá từ database
      if (item.variantId) {
        const variant = await db
          .select()
          .from(schema.productVariants)
          .where(eq(schema.productVariants.id, Number(item.variantId)))
          .limit(1);

        if (!variant[0]) {
          throw new Error(`Variant with ID ${item.variantId} not found`);
        }

        // ANTI-HACK: Kiểm tra variant có thuộc product này không
        if (variant[0].productId !== product[0].id) {
          throw new Error(`Variant ${item.variantId} does not belong to product ${item.productId}`);
        }

        // ANTI-HACK: Kiểm tra stock của variant
        if (variant[0].stock < item.quantity) {
          throw new Error(`Variant "${variant[0].size}" only has ${variant[0].stock} items in stock, but ${item.quantity} were requested`);
        }

        // Tính giá cuối cùng = giá base + price adjustment
        finalPrice = product[0].price + (variant[0].priceAdjustment || 0);
        variantPrice = variant[0].priceAdjustment || 0; // Lưu giá variant để tracking
        variantId = variant[0].id;
        variantSize = variant[0].size;

        // 4. Giảm stock của variant
        await db
          .update(schema.productVariants)
          .set({ 
            stock: variant[0].stock - item.quantity,
            updatedAt: now,
          })
          .where(eq(schema.productVariants.id, variant[0].id));
      }

      // 5. Tạo order item với giá đã validate từ DB
      const orderItem = {
        productId: Number(item.productId),
        productName: product[0].name,
        variantId,
        variantSize,
        variantPrice, // Lưu giá variant riêng để tracking
        quantity: item.quantity,
        price: finalPrice, // GIÁ TỪ DATABASE, KHÔNG PHẢI TỪ CLIENT
      };

      enrichedItems.push(orderItem);
      totalAmount += orderItem.price * orderItem.quantity;
    }

    const orderData = {
      userId: Number(data.userId),
      totalAmount,
      status: 'pending' as const,
      customerName: data.customerInfo.name,
      customerPhone: data.customerInfo.phone,
      customerEmail: data.customerInfo.email || null,
      customerAddress: data.customerInfo.address || null,
      notes: data.notes || null,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.insert(schema.orders).values(orderData);
    console.log('Inserted order result:', result);
    const orderId = result?.meta?.last_row_id;
    if (!orderId || typeof orderId !== 'number' || orderId <= 0) {
      throw new Error('Failed to create order: invalid orderId');
    }
    
    console.log('💾 Inserting order items into DB...');
    for (const item of enrichedItems) {
      console.log('Inserting item:', item);
      await db.insert(schema.orderItems).values({
        orderId,
        ...item,
      });
    }
    
    console.log('✅ Order created successfully with ID:', orderId);
    
    return {
      id: Number(orderId),
      ...orderData,
      userId: String(orderData.userId),
      items: enrichedItems.map(item => ({
        productId: String(item.productId),
        productName: item.productName,
        variantId: item.variantId ? String(item.variantId) : undefined,
        variantSize: item.variantSize || undefined,
        quantity: item.quantity,
        price: item.price,
      })),
      customerInfo: data.customerInfo,
      notes: orderData.notes === null ? undefined : orderData.notes,
    };
  },

  async getById(env: Environment, id: string): Promise<Order | null> {
    const db = getDb(env);

    const orderResult = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, Number(id)))
      .limit(1);

    if (!orderResult[0]) {
      return null;
    }

    const itemsResult = await db
      .select()
      .from(schema.orderItems)
      .where(eq(schema.orderItems.orderId, Number(id)));

    const order = orderResult[0];
    return {
      ...order,
      id: Number(order.id),
      userId: String(order.userId),
      items: itemsResult.map(item => ({
        productId: String(item.productId),
        productName: item.productName,
        variantId: item.variantId ? String(item.variantId) : undefined,
        variantSize: item.variantSize || undefined,
        quantity: item.quantity,
        price: item.price,
      })),
      customerInfo: {
        name: order.customerName,
        phone: order.customerPhone,
        email: order.customerEmail || undefined,
        address: order.customerAddress || undefined,
      },
      notes: order.notes === null ? undefined : order.notes,
    };
  },

  async getAll(
    env: Environment,
    pagination?: CursorPaginationParams,
  ): Promise<CursorPaginationResult<Order>> {
    const db = getDb(env);
    const limit = getLimit(pagination?.limit) + 1;

    const conditions = [];
    if (pagination?.cursor) {
      const decoded = decodeCursor(pagination.cursor);
      const cursorCondition = buildCursorCondition(decoded?.createdAt, decoded?.id ? Number(decoded.id) : undefined);
      if (cursorCondition) {
        conditions.push(cursorCondition);
      }
    }
    const query = conditions.length > 0
      ? db.select().from(schema.orders).where(and(...conditions))
      : db.select().from(schema.orders);
    const results = await query
      .orderBy(desc(schema.orders.createdAt), desc(schema.orders.id))
      .limit(limit);

    const hasMore = results.length > limit - 1;
    const data = hasMore ? results.slice(0, -1) : results;

    const enrichedOrders = await Promise.all(
      data.map(async (order) => {
        const items = await db
          .select()
          .from(schema.orderItems)
          .where(eq(schema.orderItems.orderId, order.id));

        return {
          ...order,
          id: Number(order.id),
          userId: String(order.userId),
          items: items.map(item => ({
            productId: String(item.productId),
            productName: item.productName,
            variantId: item.variantId ? String(item.variantId) : undefined,
            variantSize: item.variantSize || undefined,
            quantity: item.quantity,
            price: item.price,
          })),
          customerInfo: {
            name: order.customerName,
            phone: order.customerPhone,
            email: order.customerEmail || undefined,
            address: order.customerAddress || undefined,
          },
          notes: order.notes === null ? undefined : order.notes,
        };
      })
    );

    const nextCursor = hasMore && data.length > 0
      ? encodeCursor(String(data[data.length - 1].id), data[data.length - 1].createdAt)
      : null;

    return {
      data: enrichedOrders,
      nextCursor,
      hasMore,
    };
  },

  async getUserOrders(
    env: Environment,
    userId: string,
    pagination?: CursorPaginationParams,
  ): Promise<CursorPaginationResult<Order>> {
    const db = getDb(env);
    const limit = getLimit(pagination?.limit) + 1;

    const conditions = [eq(schema.orders.userId, Number(userId))];
    if (pagination?.cursor) {
      const decoded = decodeCursor(pagination.cursor);
      const cursorCondition = buildCursorCondition(decoded?.createdAt, decoded?.id ? Number(decoded.id) : undefined);
      if (cursorCondition) {
        conditions.push(cursorCondition);
      }
    }
    const query = conditions.length > 0
      ? db.select().from(schema.orders).where(and(...conditions))
      : db.select().from(schema.orders);
    const results = await query
      .orderBy(desc(schema.orders.createdAt), desc(schema.orders.id))
      .limit(limit);

    const hasMore = results.length > limit - 1;
    const data = hasMore ? results.slice(0, -1) : results;

    const enrichedOrders = await Promise.all(
      data.map(async (order) => {
        const items = await db
          .select()
          .from(schema.orderItems)
          .where(eq(schema.orderItems.orderId, order.id));

        return {
          ...order,
          id: Number(order.id),
          userId: String(order.userId),
          items: items.map(item => ({
            productId: String(item.productId),
            productName: item.productName,
            variantId: item.variantId ? String(item.variantId) : undefined,
            variantSize: item.variantSize || undefined,
            quantity: item.quantity,
            price: item.price,
          })),
          customerInfo: {
            name: order.customerName,
            phone: order.customerPhone,
            email: order.customerEmail || undefined,
            address: order.customerAddress || undefined,
          },
          notes: order.notes === null ? undefined : order.notes,
        };
      })
    );

    const nextCursor = hasMore && data.length > 0
      ? encodeCursor(String(data[data.length - 1].id), data[data.length - 1].createdAt)
      : null;

    return {
      data: enrichedOrders,
      nextCursor,
      hasMore,
    };
  },

  async updateStatus(
    env: Environment,
    id: string,
    status: Order['status'],
  ): Promise<Order | null> {
    const db = getDb(env);

    await db
      .update(schema.orders)
      .set({
        status,
        updatedAt: getCurrentTimestamp(),
      })
      .where(eq(schema.orders.id, Number(id)));

    return this.getById(env, id);
  },
};
