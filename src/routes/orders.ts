import { Router } from "express";
import { createOrder, getOrderById, getUserOrders, getAllOrders, updateOrderStatus } from "../services/orders";

export const orderRouter = Router();

orderRouter.post("/", (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string || "anonymous";
    const { discountCode } = req.body;
    const order = createOrder(userId, discountCode);
    res.status(201).json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

orderRouter.get("/", (req, res) => {
  const userId = req.headers["x-user-id"] as string;
  if (userId) return res.json(getUserOrders(userId));
  res.json(getAllOrders());
});

orderRouter.get("/:id", (req, res) => {
  const order = getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

orderRouter.patch("/:id/status", (req, res) => {
  try {
    const { status } = req.body;
    const order = updateOrderStatus(req.params.id, status);
    res.json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
