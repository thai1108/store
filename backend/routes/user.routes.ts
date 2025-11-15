import { Environment } from '@/types/common';
import { authService } from '@/services/auth.service';
import { orderService } from '@/services/order.service';
import { AuthRequest, RegisterRequest } from '@/types/auth';

export const userRouter = async (request: Request, env: Environment): Promise<Response> => {
  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const method = request.method;

  try {
    // POST /api/users/register - Register new user
    if (method === 'POST' && segments.length === 3 && segments[2] === 'register') {
      const data: RegisterRequest = await request.json();
      const result = await authService.register(env, data);
      
      return new Response(JSON.stringify(result), {
        status: result.success ? 201 : 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // POST /api/users/login - User login
    if (method === 'POST' && segments.length === 3 && segments[2] === 'login') {
      const data: AuthRequest = await request.json();
      const result = await authService.login(env, data);
      
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // GET /api/users/me - Get current user info
    if (method === 'GET' && segments.length === 3 && segments[2] === 'me') {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const token = authHeader.substring(7);
      const user = await authService.verifyToken(env, token);
      
      if (!user) {
        return new Response(JSON.stringify({ success: false, message: 'Invalid token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true, data: user }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // GET /api/users/me/orders - Get user's order history
    if (method === 'GET' && segments.length === 4 && segments[2] === 'me' && segments[3] === 'orders') {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const token = authHeader.substring(7);
      const user = await authService.verifyToken(env, token);
      
      if (!user) {
        return new Response(JSON.stringify({ success: false, message: 'Invalid token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const result = await orderService.getUserOrders(env, user.id);
      
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
    console.error('Error in user router:', error);
    return new Response(JSON.stringify({ success: false, message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};