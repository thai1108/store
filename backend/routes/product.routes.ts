import { Environment } from '@/types/common';
import { productService } from '@/services/product.service';
import { ProductFilter } from '@/types/product';
import { applyRateLimit, rateLimitConfigs } from '@/utils/rate-limit';

export const productRouter = async (request: Request, env: Environment): Promise<Response> => {
  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const method = request.method;

  try {
    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(request, rateLimitConfigs.relaxed);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // GET /api/products - Get all products with optional filters (public)
    if (method === 'GET' && segments.length === 2) {
      const filter: ProductFilter = {};
      
      const category = url.searchParams.get('category');
      if (category) {filter.category = category;}
      
      const inStock = url.searchParams.get('inStock');
      if (inStock) {filter.inStock = inStock === 'true';}
      
      const minPrice = url.searchParams.get('minPrice');
      if (minPrice) {filter.minPrice = parseFloat(minPrice);}
      
      const maxPrice = url.searchParams.get('maxPrice');
      if (maxPrice) {filter.maxPrice = parseFloat(maxPrice);}

      const cursor = url.searchParams.get('cursor') || undefined;
      const limit = url.searchParams.get('limit') 
        ? parseInt(url.searchParams.get('limit')!) 
        : undefined;

      const result = await productService.getAll(env, filter, { cursor, limit });
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // GET /api/products/:id - Get product by ID (public)
    if (method === 'GET' && segments.length === 3) {
      const id = segments[2];
      const result = await productService.getById(env, id);
      
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Not found' 
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in product router:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};