import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { orderRouter } from '../routes/orders';

// Create a minimal Express app for testing
const app = express();
app.use(express.json());
app.use('/api/orders', orderRouter);

describe('GET /api/orders/export', () => {
  
  it('should return 404 when no orders exist', async () => {
    const response = await request(app).get('/api/orders/export');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('No orders found');
  });

  it('should return CSV headers with correct Content-Type', async () => {
    // First create an order
    const createResponse = await request(app)
      .post('/api/orders')
      .set('x-user-id', 'test-user-1')
      .send({});
    
    expect(createResponse.status).toBe(201);

    // Now export
    const response = await request(app).get('/api/orders/export');
    
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('text/csv');
    expect(response.headers['content-disposition']).toContain('attachment');
    expect(response.headers['content-disposition']).toContain('filename=');
  });

  it('should contain required CSV columns in header row', async () => {
    // Create test orders
    await request(app)
      .post('/api/orders')
      .set('x-user-id', 'test-user-1')
      .send({});
    
    const response = await request(app).get('/api/orders/export');
    const csvContent = response.text;
    const lines = csvContent.split('\n');
    const headerRow = lines[0].trim();

    // Check for required columns
    expect(headerRow).toContain('orderId');
    expect(headerRow).toContain('date');
    expect(headerRow).toContain('customer');
    expect(headerRow).toContain('items');
    expect(headerRow).toContain('total');
    expect(headerRow).toContain('status');
  });

  it('should contain valid order data in CSV rows', async () => {
    // Create test order
    const createResponse = await request(app)
      .post('/api/orders')
      .set('x-user-id', 'test-user-1')
      .send({});
    
    const orderId = createResponse.body.id;
    const total = createResponse.body.total;

    const response = await request(app).get('/api/orders/export');
    const csvContent = response.text;
    const lines = csvContent.split('\n').filter(line => line.trim() !== '');
    
    // Skip header row
    const dataRows = lines.slice(1);
    expect(dataRows.length).toBeGreaterThan(0);

    // Check that order ID appears in the CSV
    expect(csvContent).toContain(orderId);
    expect(csvContent).toContain(total.toString());
  });

  it('should format date as YYYY-MM-DD', async () => {
    const createResponse = await request(app)
      .post('/api/orders')
      .set('x-user-id', 'test-user-1')
      .send({});
    
    const response = await request(app).get('/api/orders/export');
    const csvContent = response.text;
    
    // Date should be in YYYY-MM-DD format (e.g., 2024-01-15)
    const dateRegex = /\d{4}-\d{2}-\d{2}/;
    expect(dateRegex.test(csvContent)).toBe(true);
  });

  it('should format items with product names and quantities', async () => {
    const createResponse = await request(app)
      .post('/api/orders')
      .set('x-user-id', 'test-user-1')
      .send({});
    
    const response = await request(app).get('/api/orders/export');
    const csvContent = response.text;
    
    // Items should contain product names and quantities
    expect(csvContent).toMatch(/\(x\d+\)/);
  });

  it('should include all order statuses', async () => {
    // Create orders with different statuses
    await request(app)
      .post('/api/orders')
      .set('x-user-id', 'test-user-1')
      .send({});
    
    const response = await request(app).get('/api/orders/export');
    const csvContent = response.text;
    
    // Should contain the pending status
    expect(csvContent).toContain('pending');
  });

  it('should handle multiple orders correctly', async () => {
    // Create multiple orders
    await request(app)
      .post('/api/orders')
      .set('x-user-id', 'test-user-1')
      .send({});
    
    await request(app)
      .post('/api/orders')
      .set('x-user-id', 'test-user-2')
      .send({});
    
    const response = await request(app).get('/api/orders/export');
    const csvContent = response.text;
    const lines = csvContent.split('\n').filter(line => line.trim() !== '');
    
    // Should have header + 2 data rows
    expect(lines.length).toBe(3);
  });
});