import { Environment } from '@/types/common';
import { productService } from '@/services/product.service';
import { orderService } from '@/services/order.service';
import { userRepository } from '@/repositories/user.repository';
import { authenticateRequest, createUnauthorizedResponse } from '@/utils/auth';
import { CreateProductRequest, UpdateProductRequest } from '@/types/product';

export const adminRouter = async (request: Request, env: Environment): Promise<Response> => {
  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const method = request.method;

  try {
    // Authenticate admin for all admin routes
    const authResult = await authenticateRequest(request, env);
    
    if (!authResult.authenticated || !authResult.user) {
      return createUnauthorizedResponse(authResult.error);
    }

    if (authResult.user.role !== 'admin') {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Forbidden: Admin access required' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // GET /api/admin/products - Get all products
    if (method === 'GET' && segments[2] === 'products' && segments.length === 3) {
      const cursor = url.searchParams.get('cursor') || undefined;
      const limit = url.searchParams.get('limit') 
        ? parseInt(url.searchParams.get('limit')!) 
        : undefined;

      const result = await productService.getAll(env, {}, { cursor, limit });
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // POST /api/admin/products - Create product
    if (method === 'POST' && segments[2] === 'products' && segments.length === 3) {
      const data: CreateProductRequest = await request.json();
      const result = await productService.create(env, data);
      
      return new Response(JSON.stringify(result), {
        status: result.success ? 201 : 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // PUT /api/admin/products/:id - Update product
    if (method === 'PUT' && segments[2] === 'products' && segments.length === 4) {
      const id = segments[3];
      const data: Partial<UpdateProductRequest> = await request.json();
      const updateData: UpdateProductRequest = { ...data, id };
      
      const result = await productService.update(env, updateData);
      
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // DELETE /api/admin/products/:id - Delete product
    if (method === 'DELETE' && segments[2] === 'products' && segments.length === 4) {
      const id = segments[3];
      const result = await productService.delete(env, id);
      
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // GET /api/admin/orders - Get all orders
    if (method === 'GET' && segments[2] === 'orders' && segments.length === 3) {
      const cursor = url.searchParams.get('cursor') || undefined;
      const limit = url.searchParams.get('limit') 
        ? parseInt(url.searchParams.get('limit')!) 
        : undefined;

      const result = await orderService.getAll(env, { cursor, limit });
      
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // PUT /api/admin/orders/:id/status - Update order status
    if (method === 'PUT' && segments[2] === 'orders' && segments.length === 5 && segments[4] === 'status') {
      const id = segments[3];
      const body = await request.json() as { status: 'pending' | 'confirmed' | 'completed' | 'cancelled' };
      const result = await orderService.updateStatus(env, id, body.status);
      
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // GET /api/admin/users - Get all users
    if (method === 'GET' && segments[2] === 'users' && segments.length === 3) {
      const users = await userRepository.getAll(env);
      
      return new Response(JSON.stringify({ success: true, data: users }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Admin API endpoint not found' 
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in admin router:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
