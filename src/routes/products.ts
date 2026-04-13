import { Router } from "express";
import { getAllProducts, getProductById, searchProducts, getProductsByCategory, getCategories } from "../services/products";

export const productRouter = Router();

productRouter.get("/", (req, res) => {
  const { q, category } = req.query;
  if (q) return res.json(searchProducts(q as string));
  if (category) return res.json(getProductsByCategory(category as string));
  res.json(getAllProducts());
});

productRouter.get("/categories", (_req, res) => {
  res.json(getCategories());
});

productRouter.get("/:id", (req, res) => {
  const product = getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});
