"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRouter = void 0;
const express_1 = require("express");
const products_1 = require("../services/products");
exports.productRouter = (0, express_1.Router)();
exports.productRouter.get("/", (req, res) => {
    const { q, category } = req.query;
    if (q)
        return res.json((0, products_1.searchProducts)(q));
    if (category)
        return res.json((0, products_1.getProductsByCategory)(category));
    res.json((0, products_1.getAllProducts)());
});
exports.productRouter.get("/categories", (_req, res) => {
    res.json((0, products_1.getCategories)());
});
exports.productRouter.get("/:id", (req, res) => {
    const product = (0, products_1.getProductById)(req.params.id);
    if (!product)
        return res.status(404).json({ error: "Product not found" });
    res.json(product);
});
