/**
 * Cart Service — manages shopping cart operations.
 * Stores cart state in-memory (per-user map).
 */
import type { Cart } from "../models/types";
export declare function getCart(userId: string): Cart;
export declare function addItem(userId: string, productId: string, quantity: number): Cart;
export declare function removeItem(userId: string, productId: string): Cart;
export declare function updateQuantity(userId: string, productId: string, quantity: number): Cart;
export declare function clearCart(userId: string): Cart;
export declare function getCartTotal(userId: string): number;
export declare function getCartItemCount(userId: string): number;
