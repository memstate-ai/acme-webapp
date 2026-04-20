import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index';

describe('GET /api/health', () => {
  it('should return status ok and a valid timestamp', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      timestamp: expect.any(String),
    });
    
    // Verify timestamp is a valid ISO string
    const timestamp = response.body.timestamp;
    const date = new Date(timestamp);
    expect(date.toISOString()).toBe(timestamp);
    
    // Verify timestamp is recent (within last 5 seconds)
    const now = new Date();
    const diff = Math.abs(now.getTime() - date.getTime());
    expect(diff).toBeLessThanOrEqual(5000);
  });
});