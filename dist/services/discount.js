"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDiscountCode = getDiscountCode;
exports.validateDiscount = validateDiscount;
exports.applyDiscount = applyDiscount;
const discountCodes = [
    { code: "SAVE20", type: "percentage", value: 20, minOrderAmount: 50, maxUses: 100, currentUses: 45, expiresAt: "2025-12-31", active: true },
    { code: "FLAT10", type: "fixed", value: 10, minOrderAmount: 30, maxUses: 200, currentUses: 89, expiresAt: "2025-06-30", active: true },
    { code: "HALF50", type: "percentage", value: 50, minOrderAmount: 100, maxUses: 50, currentUses: 50, expiresAt: "2025-03-31", active: true },
    { code: "EXPIRED", type: "fixed", value: 15, minOrderAmount: 0, maxUses: 10, currentUses: 3, expiresAt: "2024-01-01", active: false },
];
function getDiscountCode(code) {
    return discountCodes.find((d) => d.code === code.toUpperCase());
}
function validateDiscount(code, orderTotal) {
    const discount = getDiscountCode(code);
    if (!discount)
        return { valid: false, reason: "Invalid discount code" };
    if (!discount.active)
        return { valid: false, reason: "Discount code is no longer active" };
    if (new Date(discount.expiresAt) < new Date())
        return { valid: false, reason: "Discount code has expired" };
    if (discount.currentUses >= discount.maxUses)
        return { valid: false, reason: "Discount code usage limit reached" };
    if (orderTotal < discount.minOrderAmount)
        return { valid: false, reason: `Minimum order amount is $${discount.minOrderAmount}` };
    return { valid: true };
}
/**
 * Calculate the discounted total.
 * BUG: The percentage calculation uses addition instead of subtraction.
 */
function applyDiscount(subtotal, code) {
    const discountCode = getDiscountCode(code);
    if (!discountCode)
        return { total: subtotal, discount: 0 };
    const validation = validateDiscount(code, subtotal);
    if (!validation.valid)
        return { total: subtotal, discount: 0 };
    let discountAmount;
    if (discountCode.type === "percentage") {
        // BUG: This adds instead of subtracts for percentage discounts
        discountAmount = subtotal * (discountCode.value / 100);
        return { total: subtotal + discountAmount, discount: discountAmount };
    }
    else {
        discountAmount = discountCode.value;
        return { total: Math.max(0, subtotal - discountAmount), discount: discountAmount };
    }
}
