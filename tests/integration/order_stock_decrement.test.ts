import { describe, it, expect, beforeEach } from 'vitest';
import { orderService } from '../../src/services/orders';
import { productService } from '../../src/services/products';

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

    // Add 2 items to cart
    const cart = productService.getCart('user-1');
    cart.items.push({ productId: TEST_PRODUCT_ID, quantity: 2, price: 10 });
    cart.updatedAt = new Date().toISOString();

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

    const cart = productService.getCart('user-1');
    cart.items.push({ productId: TEST_PRODUCT_ID, quantity: 11, price: 10 });
    cart.updatedAt = new Date().toISOString();

    // Should throw error due to insufficient stock
    expect(() => orderService.createOrder('user-1')).toThrow(/Insufficient stock/);

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

    // Add items to cart
    const cart = productService.getCart('user-1');
    cart.items.push(
      { productId: PRODUCT_A_ID, quantity: 2, price: 20 },
      { productId: PRODUCT_B_ID, quantity: 3, price: 30 }
    );
    cart.updatedAt = new Date().toISOString();

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
    const cart = productService.getCart('user-1');
    cart.items.push(
      { productId: PRODUCT_A_ID, quantity: 10, price: 20 }, // More than available
      { productId: PRODUCT_B_ID, quantity: 2, price: 30 }   // Sufficient stock
    );
    cart.updatedAt = new Date().toISOString();

    // Should throw error due to Product A insufficient stock
    expect(() => orderService.createOrder('user-1')).toThrow(/Insufficient stock/);

    // Verify NO stock was decremented (atomic operation)
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
    const cart = productService.getCart('user-1');
    cart.items.push({ productId: TEST_PRODUCT_ID, quantity: 5, price: 10 });
    cart.updatedAt = new Date().toISOString();

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

    // Add 1 item to cart
    const cart = productService.getCart('user-1');
    cart.items.push({ productId: TEST_PRODUCT_ID, quantity: 1, price: 10 });
    cart.updatedAt = new Date().toISOString();

    // Should throw error
    expect(() => orderService.createOrder('user-1')).toThrow(/Insufficient stock/);
  });
});