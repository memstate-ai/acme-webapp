"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cart_1 = require("./routes/cart");
const products_1 = require("./routes/products");
const orders_1 = require("./routes/orders");
const auth_1 = require("./routes/auth");
const admin_1 = require("./routes/admin");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static("public"));
// Routes
app.use("/api/auth", auth_1.authRouter);
app.use("/api/cart", cart_1.cartRouter);
app.use("/api/products", products_1.productRouter);
app.use("/api/orders", orders_1.orderRouter);
app.use("/admin", admin_1.adminRouter);
// Health check
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
app.listen(PORT, () => {
    console.log(`Acme Webapp running on http://localhost:${PORT}`);
});
exports.default = app;
