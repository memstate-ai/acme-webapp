"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRouter = void 0;
const express_1 = require("express");
const orders_1 = require("../services/orders");
exports.orderRouter = (0, express_1.Router)();
exports.orderRouter.post("/", (req, res) => {
    try {
        const userId = req.headers["x-user-id"] || "anonymous";
        const { discountCode } = req.body;
        const order = (0, orders_1.createOrder)(userId, discountCode);
        res.status(201).json(order);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.orderRouter.get("/", (req, res) => {
    const userId = req.headers["x-user-id"];
    if (userId)
        return res.json((0, orders_1.getUserOrders)(userId));
    res.json((0, orders_1.getAllOrders)());
});
exports.orderRouter.get("/:id", (req, res) => {
    const order = (0, orders_1.getOrderById)(req.params.id);
    if (!order)
        return res.status(404).json({ error: "Order not found" });
    res.json(order);
});
exports.orderRouter.patch("/:id/status", (req, res) => {
    try {
        const { status } = req.body;
        const order = (0, orders_1.updateOrderStatus)(req.params.id, status);
        res.json(order);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
