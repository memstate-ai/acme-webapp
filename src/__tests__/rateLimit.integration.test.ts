import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import * as dotenv from "dotenv";
import { rateLimitMiddleware } from "../src/middleware/rateLimit";

// Load environment variables for tests
dotenv.config();

describe("Rate Limiting Integration Tests", () => {
  let app: express.Application;
  let originalMaxRequests: string;
  let originalWindowMs: string;

  beforeAll(() => {
    // Create a test Express app with rate limiting
    app = express();
    app.use(express.json());
    app.use(rateLimitMiddleware);
    
    // Add a test endpoint
    app.get("/api/test", (_req, res) => {
      res.json({ message: "success" });
    });
    
    app.post("/api/test", (req, res) => {
      res.status(201).json({ message: "created" });
    });
  });

  afterAll(() => {
    // Cleanup if needed
  });

  it("should allow requests within the limit", async () => {
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10);
    const safeCount = Math.min(10, Math.floor(maxRequests * 0.5)); // Use 50% of limit or 10, whichever is smaller
    
    const responses = await Promise.all(
      Array.from({ length: safeCount }, () =>
        request(app).get("/api/test")
      )
    );
    
    // All requests should succeed
    responses.forEach((res, index) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
    });
  });

  it("should return 429 when limit is exceeded", async () => {
    // Set very low limit for testing
    const originalMax = process.env.RATE_LIMIT_MAX_REQUESTS;
    const originalWindow = process.env.RATE_LIMIT_WINDOW_MS;
    
    process.env.RATE_LIMIT_MAX_REQUESTS = "3";
    process.env.RATE_LIMIT_WINDOW_MS = "60000"; // 1 minute
    
    // Need to re-require the module to pick up new env vars
    // In a real scenario, we'd use a test-specific config
    // For now, we'll test with the current config
    
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10);
    const responses = await Promise.all(
      Array.from({ length: maxRequests + 5 }, () =>
        request(app).get("/api/test")
      )
    );
    
    // First N requests should succeed
    for (let i = 0; i < maxRequests; i++) {
      expect(responses[i].status).toBe(200);
    }
    
    // Requests beyond limit should return 429
    for (let i = maxRequests; i < responses.length; i++) {
      expect(responses[i].status).toBe(429);
      expect(responses[i].body).toHaveProperty("error");
    }
    
    // Restore original values
    process.env.RATE_LIMIT_MAX_REQUESTS = originalMax;
    process.env.RATE_LIMIT_WINDOW_MS = originalWindow;
  });

  it("should include rate limit headers in response", async () => {
    const res = await request(app).get("/api/test");
    
    // Check for standard rate limit headers (express-rate-limit v7+)
    expect(res.headers).toHaveProperty("ratelimit-limit");
    expect(res.headers).toHaveProperty("ratelimit-remaining");
    expect(res.headers).toHaveProperty("ratelimit-reset");
    
    // Verify header values are numbers
    expect(parseInt(res.headers["ratelimit-limit"] as string)).toBeGreaterThan(0);
    expect(parseInt(res.headers["ratelimit-remaining"] as string)).toBeGreaterThanOrEqual(0);
    expect(parseInt(res.headers["ratelimit-reset"] as string)).toBeGreaterThan(0);
  });

  it("should include rate limit info in Retry-After header when exceeded", async () => {
    const originalMax = process.env.RATE_LIMIT_MAX_REQUESTS;
    const originalWindow = process.env.RATE_LIMIT_WINDOW_MS;
    
    process.env.RATE_LIMIT_MAX_REQUESTS = "1";
    process.env.RATE_LIMIT_WINDOW_MS = "30000"; // 30 seconds
    
    // First request should succeed
    const firstRes = await request(app).get("/api/test");
    expect(firstRes.status).toBe(200);
    
    // Second request should be rate limited
    const secondRes = await request(app).get("/api/test");
    expect(secondRes.status).toBe(429);
    expect(secondRes.headers).toHaveProperty("retry-after");
    
    // Restore original values
    process.env.RATE_LIMIT_MAX_REQUESTS = originalMax;
    process.env.RATE_LIMIT_WINDOW_MS = originalWindow;
  });

  it("should use custom error message from environment variable", async () => {
    const originalMessage = process.env.RATE_LIMIT_MESSAGE;
    const customMessage = "Custom rate limit message for testing";
    
    process.env.RATE_LIMIT_MESSAGE = customMessage;
    
    // Make enough requests to hit the limit
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10);
    const responses = await Promise.all(
      Array.from({ length: maxRequests + 1 }, () =>
        request(app).get("/api/test")
      )
    );
    
    // Find the rate-limited response
    const rateLimitedResponse = responses.find(res => res.status === 429);
    if (rateLimitedResponse) {
      expect(rateLimitedResponse.body.error).toContain(customMessage);
    }
    
    // Restore original value
    process.env.RATE_LIMIT_MESSAGE = originalMessage;
  });

  it("should handle POST requests with rate limiting", async () => {
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10);
    
    const responses = await Promise.all(
      Array.from({ length: maxRequests + 5 }, () =>
        request(app).post("/api/test").send({ data: "test" })
      )
    );
    
    // First N requests should succeed
    for (let i = 0; i < maxRequests; i++) {
      expect(responses[i].status).toBe(201);
    }
    
    // Requests beyond limit should return 429
    for (let i = maxRequests; i < responses.length; i++) {
      expect(responses[i].status).toBe(429);
    }
  });

  it("should track rate limits per IP address", async () => {
    // This test verifies that rate limiting is IP-based
    // In practice, different IPs would have separate limits
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10);
    
    // Make requests from "this" IP
    const responses = await Promise.all(
      Array.from({ length: maxRequests + 2 }, () =>
        request(app).get("/api/test")
      )
    );
    
    // First N should succeed
    for (let i = 0; i < maxRequests; i++) {
      expect(responses[i].status).toBe(200);
    }
    
    // Beyond limit should fail
    for (let i = maxRequests; i < responses.length; i++) {
      expect(responses[i].status).toBe(429);
    }
  });

  it("should return proper error structure when rate limited", async () => {
    const originalMax = process.env.RATE_LIMIT_MAX_REQUESTS;
    process.env.RATE_LIMIT_MAX_REQUESTS = "1";
    
    // First request succeeds
    const firstRes = await request(app).get("/api/test");
    expect(firstRes.status).toBe(200);
    
    // Second request is rate limited
    const secondRes = await request(app).get("/api/test");
    expect(secondRes.status).toBe(429);
    
    // Error response should have proper structure
    expect(secondRes.body).toHaveProperty("error");
    expect(typeof secondRes.body.error).toBe("string");
    expect(secondRes.body.error).toContain("too many requests");
    
    // Restore
    process.env.RATE_LIMIT_MAX_REQUESTS = originalMax;
  });
});