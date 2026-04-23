/**
 * Product Service — manages product catalog.
 */
import type { Product } from "../models/types";

// Sample product data
const products: Product[] = [
  { id: "p1", name: "Wireless Headphones", description: "Premium noise-cancelling wireless headphones", price: 149.99, category: "electronics", stock: 50, imageUrl: "/images/headphones.jpg", createdAt: "2024-01-15" },
  { id: "p2", name: "Running Shoes", description: "Lightweight performance running shoes", price: 89.99, category: "footwear", stock: 120, imageUrl: "/images/shoes.jpg", createdAt: "2024-01-20" },
  { id: "p3", name: "Coffee Maker", description: "12-cup programmable coffee maker", price: 79.99, category: "kitchen", stock: 35, imageUrl: "/images/coffee.jpg", createdAt: "2024-02-01" },
  { id: "p4", name: "Backpack", description: "Durable laptop backpack with USB port", price: 59.99, category: "accessories", stock: 200, imageUrl: "/images/backpack.jpg", createdAt: "2024-02-10" },
  { id: "p5", name: "Smart Watch", description: "Fitness tracker with heart rate monitor", price: 199.99, category: "electronics", stock: 75, imageUrl: "/images/watch.jpg", createdAt: "2024-02-15" },
  { id: "p6", name: "Yoga Mat", description: "Non-slip exercise yoga mat", price: 29.99, category: "fitness", stock: 300, imageUrl: "/images/yoga.jpg", createdAt: "2024-03-01" },
  { id: "p7", name: "Desk Lamp", description: "LED desk lamp with adjustable brightness", price: 44.99, category: "office", stock: 90, imageUrl: "/images/lamp.jpg", createdAt: "2024-03-05" },
  { id: "p8", name: "Water Bottle", description: "Insulated stainless steel water bottle", price: 24.99, category: "accessories", stock: 500, imageUrl: "/images/bottle.jpg", createdAt: "2024-03-10" },
];

export function getAllProducts(): Product[] {
  return products;
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function searchProducts(query: string): Product[] {
  const lower = query.toLowerCase();
  return products.filter(
    (p) => p.name.toLowerCase().includes(lower) || p.description.toLowerCase().includes(lower)
  );
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getCategories(): string[] {
  return [...new Set(products.map((p) => p.category))];
}

/**
 * Decrement product stock by the specified quantity.
 * Validates that sufficient stock exists before decrementing.
 * 
 * @param productId - The ID of the product to decrement
 * @param quantity - The quantity to decrement (must be positive)
 * @returns The updated product
 * @throws Error if product not found or insufficient stock
 */
export function decrementStock(productId: string, quantity: number): Product {
  // Validate quantity is positive
  if (quantity <= 0) {
    throw new Error(`Invalid quantity: ${quantity}. Quantity must be positive.`);
  }

  const productIndex = products.findIndex((p) => p.id === productId);
  if (productIndex === -1) {
    throw new Error(`Product ${productId} not found`);
  }

  const product = products[productIndex];
  
  // Check if sufficient stock exists
  if (product.stock < quantity) {
    throw new Error(
      `Insufficient stock for product "${product.name}". ` +
      `Available: ${product.stock}, Requested: ${quantity}`
    );
  }

  // Decrement stock
  products[productIndex].stock -= quantity;
  
  return products[productIndex];
}

/**
 * Update product stock to a specific value.
 * Useful for restocking or inventory adjustments.
 * 
 * @param productId - The ID of the product to update
 * @param newStock - The new stock value (must be non-negative)
 * @returns The updated product
 * @throws Error if product not found or invalid stock value
 */
export function updateStock(productId: string, newStock: number): Product {
  if (newStock < 0) {
    throw new Error(`Invalid stock value: ${newStock}. Stock cannot be negative.`);
  }

  const productIndex = products.findIndex((p) => p.id === productId);
  if (productIndex === -1) {
    throw new Error(`Product ${productId} not found`);
  }

  products[productIndex].stock = newStock;
  return products[productIndex];
}

/**
 * Check if a product has sufficient stock for a given quantity.
 * 
 * @param productId - The ID of the product to check
 * @param quantity - The quantity to check availability for
 * @returns true if sufficient stock exists, false otherwise
 */
export function hasSufficientStock(productId: string, quantity: number): boolean {
  if (quantity <= 0) return false;
  
  const product = getProductById(productId);
  return product !== undefined && product.stock >= quantity;
}