import { Order, CreateOrderRequest } from '@/types/order';
import { Environment } from '@/types/common';
import { generateId, getCurrentTimestamp } from '@/utils/helpers';
import { productRepository } from './product.repository';

export const orderRepository = {
  async create(env: Environment, data: CreateOrderRequest): Promise<Order> {
    const id = generateId();
    const now = getCurrentTimestamp();

    // Get product details and calculate total
    let totalAmount = 0;
    const enrichedItems = [];

    for (const item of data.items) {
      const product = await productRepository.getById(env, item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }

      const orderItem = {
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
      };

      enrichedItems.push(orderItem);
      totalAmount += orderItem.price * orderItem.quantity;
    }

    const order: Order = {
      id,
      userId: data.userId,
      items: enrichedItems,
      totalAmount,
      status: 'pending',
      customerInfo: data.customerInfo,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };

    // Store in database
    await env.DB.prepare(
      `INSERT INTO orders (id, userId, totalAmount, status, customerName, customerPhone, 
       customerEmail, customerAddress, notes, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        order.id,
        order.userId || null,
        order.totalAmount,
        order.status,
        order.customerInfo.name,
        order.customerInfo.phone,
        order.customerInfo.email || null,
        order.customerInfo.address || null,
        order.notes || null,
        order.createdAt,
        order.updatedAt,
      )
      .run();

    // Store order items
    for (const item of order.items) {
      await env.DB.prepare(
        'INSERT INTO order_items (orderId, productId, productName, quantity, price) VALUES (?, ?, ?, ?, ?)',
      )
        .bind(order.id, item.productId, item.productName, item.quantity, item.price)
        .run();
    }

    // Cache order in KV for quick access (if available)
    if (env.ORDER_CACHE) {
      await env.ORDER_CACHE.put(`order_${order.id}`, JSON.stringify(order), {
        expirationTtl: 24 * 60 * 60, // 24 hours
      });
    }

    return order;
  },

  async getById(env: Environment, id: string): Promise<Order | null> {
    // Try cache first (if available)
    if (env.ORDER_CACHE) {
      const cached = await env.ORDER_CACHE.get(`order_${id}`);
      if (cached) {
        return JSON.parse(cached) as Order;
      }
    }

    // Fallback to database
    const orderResult = await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first();
    if (!orderResult) {
      return null;
    }

    const itemsResult = await env.DB.prepare('SELECT * FROM order_items WHERE orderId = ?')
      .bind(id)
      .all();

    const order: Order = {
      id: orderResult.id as string,
      userId: orderResult.userId as string | undefined,
      totalAmount: orderResult.totalAmount as number,
      status: orderResult.status as Order['status'],
      customerInfo: {
        name: orderResult.customerName as string,
        phone: orderResult.customerPhone as string,
        email: orderResult.customerEmail as string | undefined,
        address: orderResult.customerAddress as string | undefined,
      },
      notes: orderResult.notes as string | undefined,
      items: itemsResult.results as Order['items'],
      createdAt: orderResult.createdAt as string,
      updatedAt: orderResult.updatedAt as string,
    };

    // Cache for future requests (if available)
    if (env.ORDER_CACHE) {
      await env.ORDER_CACHE.put(`order_${id}`, JSON.stringify(order), {
        expirationTtl: 24 * 60 * 60,
      });
    }

    return order;
  },

  async getByUserId(env: Environment, userId: string): Promise<Order[]> {
    const ordersResult = await env.DB.prepare('SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC')
      .bind(userId)
      .all();

    const orders: Order[] = [];
    for (const orderRow of ordersResult.results) {
      const itemsResult = await env.DB.prepare('SELECT * FROM order_items WHERE orderId = ?')
        .bind(orderRow.id)
        .all();

      const order: Order = {
        id: orderRow.id as string,
        userId: orderRow.userId as string,
        totalAmount: orderRow.totalAmount as number,
        status: orderRow.status as Order['status'],
        customerInfo: {
          name: orderRow.customerName as string,
          phone: orderRow.customerPhone as string,
          email: orderRow.customerEmail as string | undefined,
          address: orderRow.customerAddress as string | undefined,
        },
        notes: orderRow.notes as string | undefined,
        items: itemsResult.results as Order['items'],
        createdAt: orderRow.createdAt as string,
        updatedAt: orderRow.updatedAt as string,
      };

      orders.push(order);
    }

    return orders;
  },

  async updateStatus(env: Environment, id: string, status: Order['status']): Promise<Order | null> {
    const existing = await this.getById(env, id);
    if (!existing) {
      return null;
    }

    const updatedAt = getCurrentTimestamp();

    await env.DB.prepare('UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?')
      .bind(status, updatedAt, id)
      .run();

    const updatedOrder = {
      ...existing,
      status,
      updatedAt,
    };

    // Update cache (if available)
    if (env.ORDER_CACHE) {
      await env.ORDER_CACHE.put(`order_${id}`, JSON.stringify(updatedOrder), {
        expirationTtl: 24 * 60 * 60,
      });
    }

    return updatedOrder;
  },
};