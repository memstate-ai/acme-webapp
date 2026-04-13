import { describe, it, expect } from "vitest";
import { getAllProducts, searchProducts, getProductsByCategory } from "./products";

describe("ProductService", () => {
  describe("getAllProducts", () => {
    it("should return default pagination (limit 10, offset 0)", () => {
      const result = getAllProducts();
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeLessThanOrEqual(10);
      expect(result.metadata.limit).toBe(10);
      expect(result.metadata.offset).toBe(0);
      expect(result.metadata.total_count).toBeGreaterThan(0);
      expect(result.metadata.total_pages).toBeGreaterThan(0);
    });

    it("should apply correct limit and offset", () => {
      const result = getAllProducts(5, 5);
      expect(result.metadata.limit).toBe(5);
      expect(result.metadata.offset).toBe(5);
      expect(result.data.length).toBeLessThanOrEqual(5);
    });

    it("should calculate total_pages correctly", () => {
      const limit = 2;
      const result = getAllProducts(limit, 0);
      const expectedPages = Math.ceil(result.metadata.total_count / limit);
      expect(result.metadata.total_pages).toBe(expectedPages);
    });

    it("should return an empty array if offset is out of bounds", () => {
      const result = getAllProducts(10, 10000);
      expect(result.data).toEqual([]);
      expect(result.metadata.total_count).toBeGreaterThan(0);
      expect(result.metadata.offset).toBe(10000);
    });

    it("should return all products if limit is very large", () => {
      const result = getAllProducts(1000, 0);
      expect(result.data.length).toBe(result.metadata.total_count);
      expect(result.metadata.limit).toBe(100); // Should be capped at MAX_LIMIT
    });

    it("should cap limit at MAX_LIMIT (100)", () => {
      const result = getAllProducts(1000, 0);
      expect(result.metadata.limit).toBe(100);
    });

    it("should cap offset at MAX_OFFSET (10000)", () => {
      const result = getAllProducts(10, 50000);
      expect(result.metadata.offset).toBe(10000);
    });

    it("should handle limit of 0 by using minimum of 1", () => {
      const result = getAllProducts(0, 0);
      expect(result.metadata.limit).toBe(1);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it("should handle negative limit by using minimum of 1", () => {
      const result = getAllProducts(-5, 0);
      expect(result.metadata.limit).toBe(1);
    });

    it("should handle negative offset by using minimum of 0", () => {
      const result = getAllProducts(10, -5);
      expect(result.metadata.offset).toBe(0);
    });
  });

  describe("searchProducts", () => {
    it("should return products matching search query", () => {
      const result = searchProducts("headphones");
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].name.toLowerCase()).toContain("headphones");
    });

    it("should return empty array for no matches", () => {
      const result = searchProducts("xyznonexistent123");
      expect(result.data).toEqual([]);
      expect(result.metadata.total_count).toBe(0);
      expect(result.metadata.total_pages).toBe(0);
    });

    it("should apply pagination to search results", () => {
      const result = searchProducts("", 2, 0);
      expect(result.data.length).toBeLessThanOrEqual(2);
      expect(result.metadata.limit).toBe(2);
    });

    it("should be case-insensitive", () => {
      const result1 = searchProducts("HEADPHONES");
      const result2 = searchProducts("headphones");
      expect(result1.data.length).toBe(result2.data.length);
    });
  });

  describe("getProductsByCategory", () => {
    it("should return products in specified category", () => {
      const result = getProductsByCategory("electronics");
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data.every((p) => p.category === "electronics")).toBe(true);
    });

    it("should return empty array for non-existent category", () => {
      const result = getProductsByCategory("nonexistent");
      expect(result.data).toEqual([]);
      expect(result.metadata.total_count).toBe(0);
    });

    it("should apply pagination to category results", () => {
      const result = getProductsByCategory("accessories", 1, 0);
      expect(result.data.length).toBeLessThanOrEqual(1);
      expect(result.metadata.limit).toBe(1);
    });
  });
});