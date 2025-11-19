import { Environment } from '@/types/common';
import { D1CartRepository } from '@/repositories/cart.repository';
import { CartItem } from '@/types/order';
import { authenticateRequest, createUnauthorizedResponse } from '@/utils/auth';
import { applyRateLimit, rateLimitConfigs } from '@/utils/rate-limit';

export const cartRouter = async (request: Request, env: Environment): Promise<Response> => {
  // Apply moderate rate limiting (100 requests per minute)
  const rateLimitResponse = await applyRateLimit(request, rateLimitConfigs.relaxed);
  if (rateLimitResponse) return rateLimitResponse;

  const url = new URL(request.url);
  const method = request.method;

  const cartRepo = new D1CartRepository(env.DB);

  try {
    // Authenticate user
    const authResult = await authenticateRequest(request, env);
    
    if (!authResult.authenticated || !authResult.userId) {
      return createUnauthorizedResponse(authResult.error);
    }

    const userId = authResult.userId;

    // GET /api/cart - Get user's cart
    if (method === 'GET') {
      const items = await cartRepo.getByUserId(userId);
      
      return new Response(JSON.stringify({ success: true, data: { items } }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // POST /api/cart - Save/update cart
    if (method === 'POST') {
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

    // DELETE /api/cart - Clear cart
    if (method === 'DELETE') {
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
