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
