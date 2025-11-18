export interface ProductVariant {
  id?: string;
  productId?: string;
  size: string;
  stock: number;
  priceAdjustment?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImage {
  id?: string;
  productId?: string;
  imageUrl: string;
  displayOrder: number;
  createdAt?: string;
}

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
  variants?: ProductVariant[];
  images?: ProductImage[];
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  category: 'snack' | 'drink' | 'milk-tea';
  imageUrl?: string;
  inStock: boolean;
  variants?: Omit<ProductVariant, 'id' | 'productId' | 'createdAt' | 'updatedAt'>[];
  images?: Omit<ProductImage, 'id' | 'productId' | 'createdAt'>[];
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