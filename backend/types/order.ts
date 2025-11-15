export interface Order {
  id: string;
  userId?: string; // Optional for guest orders
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  customerInfo: CustomerInfo;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface CreateOrderRequest {
  items: Omit<OrderItem, 'productName'>[];
  customerInfo: CustomerInfo;
  notes?: string;
  userId?: string;
}