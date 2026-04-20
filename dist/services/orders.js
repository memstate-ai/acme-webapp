"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = createOrder;
exports.getOrderById = getOrderById;
exports.getUserOrders = getUserOrders;
exports.getAllOrders = getAllOrders;
exports.updateOrderStatus = updateOrderStatus;
const cart_1 = require("./cart");
const products_1 = require("./products");
const discount_1 = require("./discount");
const orders = [];
let orderCounter = 1000;
function createOrder(userId, discountCode) {
    const cart = (0, cart_1.getCart)(userId);
    if (cart.items.length === 0)
        throw new Error("Cart is empty");
    const items = cart.items.map((ci) => {
        const product = (0, products_1.getProductById)(ci.productId);
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
        ? (0, discount_1.applyDiscount)(subtotal, discountCode)
        : { total: subtotal, discount: 0 };
    const tax = afterDiscount * 0.08;
    const total = afterDiscount + tax;
    const order = {
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
    (0, cart_1.clearCart)(userId);
    return order;
}
function getOrderById(id) {
    return orders.find((o) => o.id === id);
}
function getUserOrders(userId) {
    return orders.filter((o) => o.userId === userId);
}
function getAllOrders() {
    return orders;
}
function updateOrderStatus(orderId, status) {
    const order = orders.find((o) => o.id === orderId);
    if (!order)
        throw new Error(`Order ${orderId} not found`);
    order.status = status;
    order.updatedAt = new Date().toISOString();
    return order;
}
