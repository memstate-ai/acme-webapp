/**
 * Order Service — manages order creation and lifecycle.
 */
import type { Order } from "../models/types";
export declare function createOrder(userId: string, discountCode?: string): Order;
export declare function getOrderById(id: string): Order | undefined;
export declare function getUserOrders(userId: string): Order[];
export declare function getAllOrders(): Order[];
export declare function updateOrderStatus(orderId: string, status: Order["status"]): Order;
