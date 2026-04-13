/**
 * Cart Service — manages shopping cart operations.
 * Stores cart state in-memory (per-user map).
 */
import type { Cart, CartItem, Product } from "../models/types";
import { getProductById } from "./products";

// In-memory cart storage (would be Redis/DB in production)
const carts = new Map<string, Cart>();

export function getCart(userId: string): Cart {
  if (!carts.has(userId)) {
    carts.set(userId, { userId, items: [], updatedAt: new Date().toISOString() });
  }
  return carts.get(userId)!;
}

export function addItem(userId: string, productId: string, quantity: number): Cart {
  const cart = getCart(userId);
  const product = getProductById(productId);
  if (!product) throw new Error(`Product ${productId} not found`);
  if (product.stock < quantity) throw new Error("Insufficient stock");

  const existing = cart.items.find((i) => i.productId === productId);
  if (existing) {
    existing.quantity += quantity;
    existing.price = product.price;
  } else {
    cart.items.push({ productId, quantity, price: product.price });
  }
  cart.updatedAt = new Date().toISOString();
  return cart;
}

export function removeItem(userId: string, productId: string): Cart {
  const cart = getCart(userId);
  cart.items = cart.items.filter((i) => i.productId !== productId);
  cart.updatedAt = new Date().toISOString();
  return cart;
}

export function updateQuantity(userId: string, productId: string, quantity: number): Cart {
  const cart = getCart(userId);
  const item = cart.items.find((i) => i.productId === productId);
  if (!item) throw new Error(`Item ${productId} not in cart`);
  if (quantity <= 0) return removeItem(userId, productId);

  const product = getProductById(productId);
  if (product && product.stock < quantity) throw new Error("Insufficient stock");

  item.quantity = quantity;
  cart.updatedAt = new Date().toISOString();
  return cart;
}

export function clearCart(userId: string): Cart {
  const cart: Cart = { userId, items: [], updatedAt: new Date().toISOString() };
  carts.set(userId, cart);
  return cart;
}

export function getCartTotal(userId: string): number {
  const cart = getCart(userId);
  return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartItemCount(userId: string): number {
  const cart = getCart(userId);
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}
