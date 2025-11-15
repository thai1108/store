import { Environment } from '@/types/common';
import { productService } from '@/services/product.service';
import { CreateProductRequest, UpdateProductRequest, ProductFilter } from '@/types/product';

export const productRouter = async (request: Request, env: Environment): Promise<Response> => {
  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const method = request.method;

  try {
    // GET /api/products - Get all products with optional filters
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

      const result = await productService.getAll(env, filter);
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // GET /api/products/:id - Get product by ID
    if (method === 'GET' && segments.length === 3) {
      const id = segments[2];
      const result = await productService.getById(env, id);
      
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // POST /api/products - Create new product
    if (method === 'POST' && segments.length === 2) {
      const data: CreateProductRequest = await request.json();
      const result = await productService.create(env, data);
      
      return new Response(JSON.stringify(result), {
        status: result.success ? 201 : 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // PUT /api/products/:id - Update product
    if (method === 'PUT' && segments.length === 3) {
      const id = segments[2];
      const data: Partial<UpdateProductRequest> = await request.json();
      const updateData: UpdateProductRequest = { ...data, id };
      
      const result = await productService.update(env, updateData);
      
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // DELETE /api/products/:id - Delete product
    if (method === 'DELETE' && segments.length === 3) {
      const id = segments[2];
      const result = await productService.delete(env, id);
      
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: false, message: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in product router:', error);
    return new Response(JSON.stringify({ success: false, message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};