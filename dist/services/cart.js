"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCart = getCart;
exports.addItem = addItem;
exports.removeItem = removeItem;
exports.updateQuantity = updateQuantity;
exports.clearCart = clearCart;
exports.getCartTotal = getCartTotal;
exports.getCartItemCount = getCartItemCount;
const products_1 = require("./products");
// In-memory cart storage (would be Redis/DB in production)
const carts = new Map();
function getCart(userId) {
    if (!carts.has(userId)) {
        carts.set(userId, { userId, items: [], updatedAt: new Date().toISOString() });
    }
    return carts.get(userId);
}
function addItem(userId, productId, quantity) {
    const cart = getCart(userId);
    const product = (0, products_1.getProductById)(productId);
    if (!product)
        throw new Error(`Product ${productId} not found`);
    if (product.stock < quantity)
        throw new Error("Insufficient stock");
    const existing = cart.items.find((i) => i.productId === productId);
    if (existing) {
        existing.quantity += quantity;
        existing.price = product.price;
    }
    else {
        cart.items.push({ productId, quantity, price: product.price });
    }
    cart.updatedAt = new Date().toISOString();
    return cart;
}
function removeItem(userId, productId) {
    const cart = getCart(userId);
    cart.items = cart.items.filter((i) => i.productId !== productId);
    cart.updatedAt = new Date().toISOString();
    return cart;
}
function updateQuantity(userId, productId, quantity) {
    const cart = getCart(userId);
    const item = cart.items.find((i) => i.productId === productId);
    if (!item)
        throw new Error(`Item ${productId} not in cart`);
    if (quantity <= 0)
        return removeItem(userId, productId);
    const product = (0, products_1.getProductById)(productId);
    if (product && product.stock < quantity)
        throw new Error("Insufficient stock");
    item.quantity = quantity;
    cart.updatedAt = new Date().toISOString();
    return cart;
}
function clearCart(userId) {
    const cart = { userId, items: [], updatedAt: new Date().toISOString() };
    carts.set(userId, cart);
    return cart;
}
function getCartTotal(userId) {
    const cart = getCart(userId);
    return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
function getCartItemCount(userId) {
    const cart = getCart(userId);
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}
