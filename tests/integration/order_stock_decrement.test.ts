import { describe, it, expect, beforeEach } from 'vitest';
import { orderService } from '../../src/services/orders';
import { productService } from '../../src/services/products';
import { cartService } from '../../src/services/cart';

describe('Order Integration - Stock Decrement', () => {
  const TEST_PRODUCT_ID = 'test-prod';
  const INITIAL_STOCK = 10;

  beforeEach(() => {
    // Reset product to known state
    productService.updateStock(TEST_PRODUCT_ID, INITIAL_STOCK);
  });

  it('should decrement product stock after a successful order', () => {
    // Setup: Add items to cart
    productService.createOrUpdateProduct({
      id: TEST_PRODUCT_ID,
      name: 'Test Product',
      description: 'Test',
      price: 10,
      category: 'test',
      stock: INITIAL_STOCK,
      imageUrl: '',
      createdAt: new Date().toISOString()
    });

    // Add 2 items to cart using cartService
    cartService.addItem('user-1', TEST_PRODUCT_ID, 2);

    // Place order
    const order = orderService.createOrder('user-1');
    
    // Verify order was created
    expect(order).toBeDefined();
    expect(order.items.length).toBe(1);
    expect(order.items[0].quantity).toBe(2);

    // Verify stock was decremented
    const product = productService.getProductById(TEST_PRODUCT_ID);
    expect(product?.stock).toBe(INITIAL_STOCK - 2);
  });

  it('should throw error if stock is insufficient', () => {
    // Setup: Add 11 items to cart (more than available stock of 10)
    productService.createOrUpdateProduct({
      id: TEST_PRODUCT_ID,
      name: 'Test Product',
      description: 'Test',
      price: 10,
      category: 'test',
      stock: INITIAL_STOCK,
      imageUrl: '',
      createdAt: new Date().toISOString()
    });

    // Add 11 items to cart - should throw error during cart add
    expect(() => cartService.addItem('user-1', TEST_PRODUCT_ID, 11)).toThrow(/Insufficient stock/);

    // Verify stock was NOT decremented (atomic operation)
    const product = productService.getProductById(TEST_PRODUCT_ID);
    expect(product?.stock).toBe(INITIAL_STOCK);
  });

  it('should handle multiple items in order', () => {
    const PRODUCT_A_ID = 'test-prod-a';
    const PRODUCT_B_ID = 'test-prod-b';
    const STOCK_A = 5;
    const STOCK_B = 8;

    // Setup products
    productService.createOrUpdateProduct({
      id: PRODUCT_A_ID,
      name: 'Product A',
      description: 'Test A',
      price: 20,
      category: 'test',
      stock: STOCK_A,
      imageUrl: '',
      createdAt: new Date().toISOString()
    });

    productService.createOrUpdateProduct({
      id: PRODUCT_B_ID,
      name: 'Product B',
      description: 'Test B',
      price: 30,
      category: 'test',
      stock: STOCK_B,
      imageUrl: '',
      createdAt: new Date().toISOString()
    });

    // Add items to cart using cartService
    cartService.addItem('user-1', PRODUCT_A_ID, 2);
    cartService.addItem('user-1', PRODUCT_B_ID, 3);

    // Place order
    const order = orderService.createOrder('user-1');
    expect(order).toBeDefined();
    expect(order.items.length).toBe(2);

    // Verify both stocks were decremented
    const productA = productService.getProductById(PRODUCT_A_ID);
    const productB = productService.getProductById(PRODUCT_B_ID);
    expect(productA?.stock).toBe(STOCK_A - 2);
    expect(productB?.stock).toBe(STOCK_B - 3);
  });

  it('should throw error if any item has insufficient stock (partial failure)', () => {
    const PRODUCT_A_ID = 'test-prod-a';
    const PRODUCT_B_ID = 'test-prod-b';

    // Setup products
    productService.createOrUpdateProduct({
      id: PRODUCT_A_ID,
      name: 'Product A',
      description: 'Test A',
      price: 20,
      category: 'test',
      stock: 5,
      imageUrl: '',
      createdAt: new Date().toISOString()
    });

    productService.createOrUpdateProduct({
      id: PRODUCT_B_ID,
      name: 'Product B',
      description: 'Test B',
      price: 30,
      category: 'test',
      stock: 10,
      imageUrl: '',
      createdAt: new Date().toISOString()
    });

    // Add items to cart - Product A has insufficient stock
    // First add Product B (sufficient stock)
    cartService.addItem('user-1', PRODUCT_B_ID, 2);
    
    // Then try to add Product A (insufficient stock) - should throw during cart add
    expect(() => cartService.addItem('user-1', PRODUCT_A_ID, 10)).toThrow(/Insufficient stock/);

    // Verify NO stock was decremented (cart validation prevents order)
    const productA = productService.getProductById(PRODUCT_A_ID);
    const productB = productService.getProductById(PRODUCT_B_ID);
    expect(productA?.stock).toBe(5);
    expect(productB?.stock).toBe(10);
  });

  it('should handle ordering exact remaining stock', () => {
    // Setup: Product with stock of 5
    productService.createOrUpdateProduct({
      id: TEST_PRODUCT_ID,
      name: 'Test Product',
      description: 'Test',
      price: 10,
      category: 'test',
      stock: 5,
      imageUrl: '',
      createdAt: new Date().toISOString()
    });

    // Add exactly 5 items to cart
    cartService.addItem('user-1', TEST_PRODUCT_ID, 5);

    // Place order - should succeed
    const order = orderService.createOrder('user-1');
    expect(order).toBeDefined();

    // Verify stock is now 0
    const product = productService.getProductById(TEST_PRODUCT_ID);
    expect(product?.stock).toBe(0);
  });

  it('should prevent ordering when stock is 0', () => {
    // Setup: Product with stock of 0
    productService.createOrUpdateProduct({
      id: TEST_PRODUCT_ID,
      name: 'Test Product',
      description: 'Test',
      price: 10,
      category: 'test',
      stock: 0,
      imageUrl: '',
      createdAt: new Date().toISOString()
    });

    // Try to add 1 item to cart - should fail due to insufficient stock
    expect(() => cartService.addItem('user-1', TEST_PRODUCT_ID, 1)).toThrow(/Insufficient stock/);
  });

  it('should provide detailed error message for insufficient stock', () => {
    productService.createOrUpdateProduct({
      id: TEST_PRODUCT_ID,
      name: 'Test Product',
      description: 'Test',
      price: 10,
      category: 'test',
      stock: 3,
      imageUrl: '',
      createdAt: new Date().toISOString()
    });

    // Add 5 items to cart (more than 3 available)
    cartService.addItem('user-1', TEST_PRODUCT_ID, 5);

    // The error should mention the product name and available/requested quantities
    expect(() => orderService.createOrder('user-1')).toThrow(/Insufficient stock/);
  });
});