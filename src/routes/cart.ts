import { Router } from "express";
import { getCart, addItem, removeItem, updateQuantity, clearCart, getCartTotal } from "../services/cart";

export const cartRouter = Router();

cartRouter.get("/", (req, res) => {
  const userId = req.headers["x-user-id"] as string || "anonymous";
  const cart = getCart(userId);
  const total = getCartTotal(userId);
  res.json({ ...cart, total });
});

cartRouter.post("/items", (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string || "anonymous";
    const { productId, quantity = 1 } = req.body;
    const cart = addItem(userId, productId, quantity);
    res.json(cart);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

cartRouter.delete("/items/:productId", (req, res) => {
  const userId = req.headers["x-user-id"] as string || "anonymous";
  const cart = removeItem(userId, req.params.productId);
  res.json(cart);
});

cartRouter.patch("/items/:productId", (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string || "anonymous";
    const { quantity } = req.body;
    const cart = updateQuantity(userId, req.params.productId, quantity);
    res.json(cart);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

cartRouter.delete("/", (req, res) => {
  const userId = req.headers["x-user-id"] as string || "anonymous";
  const cart = clearCart(userId);
  res.json(cart);
});
