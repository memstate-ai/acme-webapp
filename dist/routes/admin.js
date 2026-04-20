"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const orders_1 = require("../services/orders");
const products_1 = require("../services/products");
exports.adminRouter = (0, express_1.Router)();
// Admin dashboard data
exports.adminRouter.get("/dashboard", (_req, res) => {
    const orders = (0, orders_1.getAllOrders)();
    const products = (0, products_1.getAllProducts)();
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const ordersByStatus = orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
    }, {});
    res.json({
        totalOrders: orders.length,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalProducts: products.length,
        ordersByStatus,
    });
});
// Admin orders page (for CSV export — Issue #6)
exports.adminRouter.get("/orders", (_req, res) => {
    const orders = (0, orders_1.getAllOrders)();
    res.json(orders);
});
