export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: "customer" | "admin";
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  discountCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface DiscountCode {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount: number;
  maxUses: number;
  currentUses: number;
  expiresAt: string;
  active: boolean;
}

export interface EmailTemplate {
  name: string;
  subject: string;
  htmlBody: string;
}

/**
 * Pagination metadata for API responses
 */
export interface PaginationMetadata {
  total_count: number;
  limit: number;
  offset: number;
  total_pages: number;
}

/**
 * Generic paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  metadata: PaginationMetadata;
}