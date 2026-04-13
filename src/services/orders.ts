/**
 * Order Service — manages order creation and lifecycle.
 */
import type { Order, OrderItem } from "../models/types";
import { getCart, clearCart } from "./cart";
import { getProductById, decrementStock, hasSufficientStock } from "./products";
import { applyDiscount } from "./discount";

const orders: Order[] = [];
let orderCounter = 1000;

/**
 * Create a new order from the user's cart.
 * Validates sufficient stock for all items before creating the order.
 * Decrements stock for each product after successful order creation.
 * 
 * @param userId - The ID of the user placing the order
 * @param discountCode - Optional discount code to apply
 * @returns The created order
 * @throws Error if cart is empty, insufficient stock, or product not found
 */
export function createOrder(userId: string, discountCode?: string): Order {
  const cart = getCart(userId);
  if (cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  // Step 1: Validate all items have sufficient stock BEFORE any modifications
  // This ensures atomicity - either all items succeed or none do
  const stockValidationErrors: string[] = [];
  
  for (const cartItem of cart.items) {
    const product = getProductById(cartItem.productId);
    if (!product) {
      throw new Error(`Product ${cartItem.productId} not found`);
    }
    
    if (!hasSufficientStock(cartItem.productId, cartItem.quantity)) {
      stockValidationErrors.push(
        `Product "${product.name}" (ID: ${cartItem.productId}): ` +
        `Available: ${product.stock}, Requested: ${cartItem.quantity}`
      );
    }
  }

  // If any validation failed, throw a comprehensive error
  if (stockValidationErrors.length > 0) {
    throw new Error(
      `Insufficient stock for one or more items:\n` +
      stockValidationErrors.join("\n")
    );
  }

  // Step 2: Create order items from cart
  const items: OrderItem[] = cart.items.map((ci) => {
    const product = getProductById(ci.productId);
    return {
      productId: ci.productId,
      productName: product?.name ?? "Unknown",
      quantity: ci.quantity,
      unitPrice: ci.price,
      total: ci.price * ci.quantity,
    };
  });

  // Step 3: Calculate totals
  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const { total: afterDiscount, discount } = discountCode
    ? applyDiscount(subtotal, discountCode)
    : { total: subtotal, discount: 0 };
  const tax = afterDiscount * 0.08;
  const total = afterDiscount + tax;

  // Step 4: Create and save the order
  const order: Order = {
    id: `ORD-${++orderCounter}`,
    userId,
    items,
    subtotal,
    discount,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
    status: "pending",
    discountCode: discountCode ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  orders.push(order);

  // Step 5: Decrement stock for each item (after order is saved)
  // This ensures stock is only decremented for valid orders
  for (const cartItem of cart.items) {
    decrementStock(cartItem.productId, cartItem.quantity);
  }

  // Step 6: Clear the cart
  clearCart(userId);

  return order;
}

export function getOrderById(id: string): Order | undefined {
  return orders.find((o) => o.id === id);
}

export function getUserOrders(userId: string): Order[] {
  return orders.filter((o) => o.userId === userId);
}

export function getAllOrders(): Order[] {
  return orders;
}

export function updateOrderStatus(orderId: string, status: Order["status"]): Order {
  const order = orders.find((o) => o.id === orderId);
  if (!order) throw new Error(`Order ${orderId} not found`);
  order.status = status;
  order.updatedAt = new Date().toISOString();
  return order;
}