"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartRouter = void 0;
const express_1 = require("express");
const cart_1 = require("../services/cart");
exports.cartRouter = (0, express_1.Router)();
exports.cartRouter.get("/", (req, res) => {
    const userId = req.headers["x-user-id"] || "anonymous";
    const cart = (0, cart_1.getCart)(userId);
    const total = (0, cart_1.getCartTotal)(userId);
    res.json({ ...cart, total });
});
exports.cartRouter.post("/items", (req, res) => {
    try {
        const userId = req.headers["x-user-id"] || "anonymous";
        const { productId, quantity = 1 } = req.body;
        const cart = (0, cart_1.addItem)(userId, productId, quantity);
        res.json(cart);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.cartRouter.delete("/items/:productId", (req, res) => {
    const userId = req.headers["x-user-id"] || "anonymous";
    const cart = (0, cart_1.removeItem)(userId, req.params.productId);
    res.json(cart);
});
exports.cartRouter.patch("/items/:productId", (req, res) => {
    try {
        const userId = req.headers["x-user-id"] || "anonymous";
        const { quantity } = req.body;
        const cart = (0, cart_1.updateQuantity)(userId, req.params.productId, quantity);
        res.json(cart);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.cartRouter.delete("/", (req, res) => {
    const userId = req.headers["x-user-id"] || "anonymous";
    const cart = (0, cart_1.clearCart)(userId);
    res.json(cart);
});
