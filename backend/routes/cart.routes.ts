import { Environment } from '@/types/common';
import { D1CartRepository } from '@/repositories/cart.repository';
import { authService } from '@/services/auth.service';
import { CartItem } from '@/types/order';

export const cartRouter = async (request: Request, env: Environment): Promise<Response> => {
  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const method = request.method;

  const cartRepo = new D1CartRepository(env.DB);

  try {
    // Verify authorization for all cart operations
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

    // GET /api/cart/:userId - Get user's cart
    if (method === 'GET' && segments.length === 3) {
      const userId = segments[2];
      
      if (user.id !== userId) {
        return new Response(JSON.stringify({ success: false, message: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const items = await cartRepo.getByUserId(userId);
      
      return new Response(JSON.stringify({ success: true, data: { items } }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // POST /api/cart/:userId - Save/update cart
    if (method === 'POST' && segments.length === 3) {
      const userId = segments[2];
      
      if (user.id !== userId) {
        return new Response(JSON.stringify({ success: false, message: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const { items }: { items: CartItem[] } = await request.json();

      if (!Array.isArray(items)) {
        return new Response(JSON.stringify({ success: false, message: 'Invalid items format' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      await cartRepo.saveCart(userId, items);
      
      return new Response(JSON.stringify({ success: true, message: 'Cart saved successfully' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // DELETE /api/cart/:userId - Clear cart
    if (method === 'DELETE' && segments.length === 3) {
      const userId = segments[2];
      
      if (user.id !== userId) {
        return new Response(JSON.stringify({ success: false, message: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      await cartRepo.clearCart(userId);
      
      return new Response(JSON.stringify({ success: true, message: 'Cart cleared successfully' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: false, message: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in cart router:', error);
    return new Response(JSON.stringify({ success: false, message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
