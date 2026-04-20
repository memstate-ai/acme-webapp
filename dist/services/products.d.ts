/**
 * Product Service — manages product catalog.
 */
import type { Product } from "../models/types";
export declare function getAllProducts(): Product[];
export declare function getProductById(id: string): Product | undefined;
export declare function searchProducts(query: string): Product[];
export declare function getProductsByCategory(category: string): Product[];
export declare function getCategories(): string[];
