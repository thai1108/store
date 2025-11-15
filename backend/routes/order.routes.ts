import { Environment } from '@/types/common';
import { orderService } from '@/services/order.service';
import { CreateOrderRequest } from '@/types/order';
import { authenticateRequest, createUnauthorizedResponse } from '@/utils/auth';

export const orderRouter = async (request: Request, env: Environment): Promise<Response> => {
  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const method = request.method;

  try {
    // POST /api/orders - Create new order
    if (method === 'POST' && segments.length === 2) {
      // Authenticate user
      const authResult = await authenticateRequest(request, env);
      
      if (!authResult.authenticated || !authResult.userId) {
        return createUnauthorizedResponse(authResult.error);
      }

      const data: CreateOrderRequest = await request.json();
      
      // Use userId from token, not from payload
      const orderData: CreateOrderRequest = {
        ...data,
        userId: authResult.userId,
      };
      
      const result = await orderService.create(env, orderData);
      
      return new Response(JSON.stringify(result), {
        status: result.success ? 201 : 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // GET /api/orders/:id - Get order by ID
    if (method === 'GET' && segments.length === 3) {
      const id = segments[2];
      const result = await orderService.getById(env, id);
      
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // PUT /api/orders/:id/status - Update order status
    if (method === 'PUT' && segments.length === 4 && segments[3] === 'status') {
      const id = segments[2];
      const body = await request.json() as { status: 'pending' | 'confirmed' | 'completed' | 'cancelled' };
      const result = await orderService.updateStatus(env, id, body.status);
      
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: false, message: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in order router:', error);
    return new Response(JSON.stringify({ success: false, message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};