import { Router, Request, Response } from "express";
import { getAllProducts, getProductById, searchProducts, getProductsByCategory, getCategories } from "../services/products";
import type { PaginatedResponse } from "../models/types";

export const productRouter = Router();

/**
 * Validate pagination parameters
 * Returns true if valid, sends 400 error if invalid
 */
function validatePagination(limit: number, offset: number): boolean {
  if (limit < 0 || offset < 0) {
    return false;
  }
  if (!Number.isInteger(limit) || !Number.isInteger(offset)) {
    return false;
  }
  return true;
}

/**
 * GET /api/products - List all products with pagination
 * Query params:
 *   - limit: Number of items per page (default: 10, max: 100)
 *   - offset: Number of items to skip (default: 0, max: 10000)
 *   - q: Search query (optional)
 *   - category: Filter by category (optional)
 */
productRouter.get("/", (req: Request, res: Response) => {
  const { q, category, limit: limitParam, offset: offsetParam } = req.query;

  // Parse pagination parameters
  const limit = limitParam ? parseInt(limitParam as string, 10) : 10;
  const offset = offsetParam ? parseInt(offsetParam as string, 10) : 0;

  // Validate pagination parameters
  if (!validatePagination(limit, offset)) {
    return res.status(400).json({
      error: "Invalid pagination parameters",
      details: "limit and offset must be non-negative integers",
    });
  }

  // Handle search query
  if (q) {
    const result = searchProducts(q as string, limit, offset);
    return res.json(result);
  }

  // Handle category filter
  if (category) {
    const result = getProductsByCategory(category as string, limit, offset);
    return res.json(result);
  }

  // Default: return paginated products
  const result = getAllProducts(limit, offset);
  res.json(result);
});

/**
 * GET /api/products/categories - List all unique categories
 */
productRouter.get("/categories", (_req: Request, res: Response) => {
  res.json(getCategories());
});

/**
 * GET /api/products/:id - Get a single product by ID
 */
productRouter.get("/:id", (req: Request, res: Response) => {
  const product = getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(product);
});