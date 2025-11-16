import { Environment } from '@/types/common';
import { handleCors, addCorsHeaders } from '@/utils/cors';
import { productRouter } from '@/routes/product.routes';
import { orderRouter } from '@/routes/order.routes';
import { userRouter } from '@/routes/user.routes';
import { cartRouter } from '@/routes/cart.routes';
import { storageRouter } from '@/routes/storage.routes';
import { adminRouter } from '@/routes/admin.routes';

export default {
  async fetch(request: Request, env: Environment): Promise<Response> {
    // Handle CORS preflight requests
    const corsResponse = handleCors(request);
    if (corsResponse) {
      return corsResponse;
    }

    const url = new URL(request.url);
    const segments = url.pathname.split('/').filter(Boolean);

    let response: Response;

    try {
      // Route to appropriate handler
      if (segments[0] === 'api' && segments[1] === 'admin') {
        response = await adminRouter(request, env);
      } else if (segments[0] === 'api' && segments[1] === 'products') {
        response = await productRouter(request, env);
      } else if (segments[0] === 'api' && segments[1] === 'orders') {
        response = await orderRouter(request, env);
      } else if (segments[0] === 'api' && segments[1] === 'users') {
        response = await userRouter(request, env);
      } else if (segments[0] === 'api' && segments[1] === 'cart') {
        response = await cartRouter(request, env);
      } else if (segments[0] === 'api' && segments[1] === 'storage') {
        response = await storageRouter(request, env);
      } else if (url.pathname === '/api/health') {
        response = new Response(
          JSON.stringify({
            success: true,
            message: 'Store API is healthy',
            timestamp: new Date().toISOString(),
          }),
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
      } else {
        response = new Response(
          JSON.stringify({
            success: false,
            message: 'API endpoint not found',
            availableEndpoints: [
              'GET /api/health',
              'GET /api/products',
              'GET /api/products/:id',
              'POST /api/orders',
              'GET /api/orders/:id',
              'POST /api/users/register',
              'POST /api/users/login',
              'GET /api/users/me',
              'GET /api/users/me/orders',
              'GET /api/cart',
              'POST /api/cart',
              'DELETE /api/cart',
              'GET /api/admin/products (admin)',
              'POST /api/admin/products (admin)',
              'PUT /api/admin/products/:id (admin)',
              'DELETE /api/admin/products/:id (admin)',
              'GET /api/admin/orders (admin)',
              'PUT /api/admin/orders/:id/status (admin)',
              'GET /api/admin/users (admin)',
            ],
          }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    } catch (error) {
      console.error('Unhandled error:', error);
      response = new Response(
        JSON.stringify({
          success: false,
          message: 'Internal server error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Add CORS headers to response
    return addCorsHeaders(response);
  },
};