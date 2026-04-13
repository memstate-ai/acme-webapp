/**
 * Order Service — manages order creation and lifecycle.
 */
import type { Order, OrderItem } from "../models/types";
import { getCart, clearCart } from "./cart";
import { getProductById } from "./products";
import { applyDiscount } from "./discount";

const orders: Order[] = [];
let orderCounter = 1000;

export function createOrder(userId: string, discountCode?: string): Order {
  const cart = getCart(userId);
  if (cart.items.length === 0) throw new Error("Cart is empty");

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

  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const { total: afterDiscount, discount } = discountCode
    ? applyDiscount(subtotal, discountCode)
    : { total: subtotal, discount: 0 };
  const tax = afterDiscount * 0.08;
  const total = afterDiscount + tax;

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
