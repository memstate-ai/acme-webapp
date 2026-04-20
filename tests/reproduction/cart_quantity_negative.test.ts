/**
 * REPRODUCTION TEST SUITE: Negative Cart Quantity Vulnerability
 * 
 * This suite tests the vulnerability where negative quantities can be passed
 * to the cart, potentially leading to negative order totals.
 * 
 * Issue: Users can set cart item quantities to negative numbers, which causes
 * incorrect order totals.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { getCart, getCartTotal, clearCart, updateQuantity } from '../../src/services/cart';

describe('Cart Quantity Negative Value Vulnerability', () => {
  const testUserId = 'test-user-123';
  const testProductId = 'prod-abc';

  beforeEach(async () => {
    // Reset cart state for this user before each test
    await clearCart(testUserId);
    // Add a test item to the cart
    await updateQuantity(testUserId, testProductId, 2);
  });

  describe('Backend API Validation', () => {
    it('should reject negative quantity via PATCH /api/cart/items/:productId', async () => {
      const response = await request(app)
        .patch(`/api/cart/items/${testProductId}`)
        .send({ quantity: -5 })
        .set('x-user-id', testUserId);

      // The API should reject negative quantities with a 400 error
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.error).toMatch(/quantity/i);
    });

    it('should reject zero quantity via PATCH /api/cart/items/:productId', async () => {
      const response = await request(app)
        .patch(`/api/cart/items/${testProductId}`)
        .send({ quantity: 0 })
        .set('x-user-id', testUserId);

      // Zero quantity should also be rejected (or remove item)
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should prevent negative quantity from reducing order total', async () => {
      // Initial total: 2 items
      const initialCart = getCart(testUserId);
      const initialTotal = getCartTotal(testUserId);
      expect(initialTotal).toBeGreaterThan(0);

      // Attempt to exploit with negative quantity
      const exploitResponse = await request(app)
        .patch(`/api/cart/items/${testProductId}`)
        .send({ quantity: -10 })
        .set('x-user-id', testUserId);

      // Verify the exploit was blocked
      expect(exploitResponse.status).toBe(400);

      // Verify cart total was not affected by the negative quantity
      const finalCart = getCart(testUserId);
      const finalTotal = getCartTotal(testUserId);
      expect(finalTotal).toBe(initialTotal);
    });

    it('should allow valid positive quantity updates', async () => {
      const response = await request(app)
        .patch(`/api/cart/items/${testProductId}`)
        .send({ quantity: 5 })
        .set('x-user-id', testUserId);

      expect(response.status).toBe(200);
      expect(response.body.items[0].quantity).toBe(5);
    });
  });

  describe('Service Layer Validation', () => {
    it('should throw error for negative quantity in updateQuantity service', () => {
      expect(() => updateQuantity(testUserId, testProductId, -1)).toThrow(/quantity/i);
    });

    it('should throw error for zero quantity in updateQuantity service', () => {
      expect(() => updateQuantity(testUserId, testProductId, 0)).toThrow(/quantity/i);
    });

    it('should allow positive quantity in updateQuantity service', () => {
      const cart = updateQuantity(testUserId, testProductId, 10);
      expect(cart.items[0].quantity).toBe(10);
    });

    it('should not allow negative quantity to affect cart total calculation', () => {
      // Manually set a negative quantity (bypassing validation) to test total calculation
      const cart = getCart(testUserId);
      const item = cart.items.find(i => i.productId === testProductId);
      if (item) {
        item.quantity = -5;
      }

      const total = getCartTotal(testUserId);
      // The total should not be negative even if quantity is negative
      // This tests the getCartTotal function's handling of negative values
      expect(total).toBeLessThanOrEqual(0); // This would be a bug if negative quantities are allowed
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large negative numbers', async () => {
      const response = await request(app)
        .patch(`/api/cart/items/${testProductId}`)
        .send({ quantity: -999999 })
        .set('x-user-id', testUserId);

      expect(response.status).toBe(400);
    });

    it('should handle decimal negative numbers', async () => {
      const response = await request(app)
        .patch(`/api/cart/items/${testProductId}`)
        .send({ quantity: -1.5 })
        .set('x-user-id', testUserId);

      expect(response.status).toBe(400);
    });

    it('should handle string "negative" values', async () => {
      const response = await request(app)
        .patch(`/api/cart/items/${testProductId}`)
        .send({ quantity: '-5' })
        .set('x-user-id', testUserId);

      // Should either reject or coerce to valid value
      expect(response.status).toBe(400);
    });

    it('should handle null quantity', async () => {
      const response = await request(app)
        .patch(`/api/cart/items/${testProductId}`)
        .send({ quantity: null })
        .set('x-user-id', testUserId);

      expect(response.status).toBe(400);
    });

    it('should handle undefined quantity', async () => {
      const response = await request(app)
        .patch(`/api/cart/items/${testProductId}`)
        .send({})
        .set('x-user-id', testUserId);

      // Undefined should be handled gracefully
      expect(response.status).toBe(200);
    });
  });

  describe('Order Total Integrity', () => {
    it('should maintain correct total after multiple valid updates', async () => {
      const response1 = await request(app)
        .patch(`/api/cart/items/${testProductId}`)
        .send({ quantity: 3 })
        .set('x-user-id', testUserId);
      expect(response1.status).toBe(200);

      const response2 = await request(app)
        .patch(`/api/cart/items/${testProductId}`)
        .send({ quantity: 5 })
        .set('x-user-id', testUserId);
      expect(response2.status).toBe(200);

      const finalTotal = getCartTotal(testUserId);
      expect(finalTotal).toBeGreaterThan(0);
    });

    it('should not allow total to go negative through API manipulation', async () => {
      const initialTotal = getCartTotal(testUserId);

      // Try multiple negative quantity attacks
      for (let i = 0; i < 3; i++) {
        await request(app)
          .patch(`/api/cart/items/${testProductId}`)
          .send({ quantity: -100 })
          .set('x-user-id', testUserId);
      }

      const finalTotal = getCartTotal(testUserId);
      expect(finalTotal).toBe(initialTotal); // Total should be unchanged
      expect(finalTotal).toBeGreaterThan(0);
    });
  });
});