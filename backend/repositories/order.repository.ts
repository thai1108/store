import { eq, desc, lt } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { Order, CreateOrderRequest } from '@/types/order';
import { Environment } from '@/types/common';
import { generateId, getCurrentTimestamp } from '@/utils/helpers';
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
    const id = generateId();
    const now = getCurrentTimestamp();

    let totalAmount = 0;
    const enrichedItems = [];

    for (const item of data.items) {
      const product = await db
        .select()
        .from(schema.products)
        .where(eq(schema.products.id, item.productId))
        .limit(1);

      if (!product[0]) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }

      const orderItem = {
        productId: item.productId,
        productName: product[0].name,
        quantity: item.quantity,
        price: product[0].price,
      };

      enrichedItems.push(orderItem);
      totalAmount += orderItem.price * orderItem.quantity;
    }

    const orderData = {
      id,
      userId: data.userId,
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

    await db.insert(schema.orders).values(orderData);

    for (const item of enrichedItems) {
      await db.insert(schema.orderItems).values({
        orderId: id,
        ...item,
      });
    }

    return {
      ...orderData,
      items: enrichedItems,
      customerInfo: data.customerInfo,
    } as Order;
  },

  async getById(env: Environment, id: string): Promise<Order | null> {
    const db = getDb(env);
    
    const orderResult = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, id))
      .limit(1);

    if (!orderResult[0]) {
      return null;
    }

    const itemsResult = await db
      .select()
      .from(schema.orderItems)
      .where(eq(schema.orderItems.orderId, id));

    const order = orderResult[0];
    return {
      ...order,
      items: itemsResult.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
      })),
      customerInfo: {
        name: order.customerName,
        phone: order.customerPhone,
        email: order.customerEmail || undefined,
        address: order.customerAddress || undefined,
      },
    } as Order;
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
      if (decoded) {
        conditions.push(lt(schema.orders.createdAt, decoded.createdAt));
      }
    }

    const results = await db
      .select()
      .from(schema.orders)
      .where(conditions.length > 0 ? conditions[0] : undefined)
      .orderBy(desc(schema.orders.createdAt))
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
          items: items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
          })),
          customerInfo: {
            name: order.customerName,
            phone: order.customerPhone,
            email: order.customerEmail || undefined,
            address: order.customerAddress || undefined,
          },
        } as Order;
      })
    );

    const nextCursor = hasMore && data.length > 0
      ? encodeCursor(data[data.length - 1].id, data[data.length - 1].createdAt)
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

    const conditions = [eq(schema.orders.userId, userId)];
    
    if (pagination?.cursor) {
      const decoded = decodeCursor(pagination.cursor);
      if (decoded) {
        conditions.push(lt(schema.orders.createdAt, decoded.createdAt));
      }
    }

    const results = await db
      .select()
      .from(schema.orders)
      .where(conditions.length > 1 ? conditions[0] : conditions[0])
      .orderBy(desc(schema.orders.createdAt))
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
          items: items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
          })),
          customerInfo: {
            name: order.customerName,
            phone: order.customerPhone,
            email: order.customerEmail || undefined,
            address: order.customerAddress || undefined,
          },
        } as Order;
      })
    );

    const nextCursor = hasMore && data.length > 0
      ? encodeCursor(data[data.length - 1].id, data[data.length - 1].createdAt)
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
      .where(eq(schema.orders.id, id));

    return this.getById(env, id);
  },
};
