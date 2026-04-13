import { Router } from "express";
import { getAllOrders } from "../services/orders";
import { getAllProducts } from "../services/products";

export const adminRouter = Router();

// Admin dashboard data
adminRouter.get("/dashboard", (_req, res) => {
  const orders = getAllOrders();
  const products = getAllProducts();
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const ordersByStatus = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  res.json({
    totalOrders: orders.length,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalProducts: products.length,
    ordersByStatus,
  });
});

// Admin orders page (for CSV export — Issue #6)
adminRouter.get("/orders", (_req, res) => {
  const orders = getAllOrders();
  res.json(orders);
});
