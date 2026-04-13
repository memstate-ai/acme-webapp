/**
 * Discount Service — applies discount codes to orders.
 *
 * BUG: percentage discounts are calculated incorrectly.
 * When applying a percentage discount code, the total is calculated
 * incorrectly. Example: Cart total: $100.00 with 20% discount should
 * be $80.00 but returns $120.00 (adds instead of subtracts).
 */
import type { DiscountCode } from "../models/types";
export declare function getDiscountCode(code: string): DiscountCode | undefined;
export declare function validateDiscount(code: string, orderTotal: number): {
    valid: boolean;
    reason?: string;
};
/**
 * Calculate the discounted total.
 * BUG: The percentage calculation uses addition instead of subtraction.
 */
export declare function applyDiscount(subtotal: number, code: string): {
    total: number;
    discount: number;
};
