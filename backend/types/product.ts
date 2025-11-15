export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'snack' | 'drink' | 'milk-tea';
  imageUrl?: string;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  category: 'snack' | 'drink' | 'milk-tea';
  imageUrl?: string;
  inStock: boolean;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
}

export interface ProductFilter {
  category?: string;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
}