import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { validateRequestBody } from './validation';

describe('validateRequestBody Integration Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(validateRequestBody);
  });

  describe('Valid request bodies', () => {
    it('should pass through non-empty object body', async () => {
      app.post('/test', (req, res) => {
        res.status(200).json({ received: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send({ name: 'test', value: 123 });

      expect(response.status).toBe(200);
      expect(response.body.received).toEqual({ name: 'test', value: 123 });
    });

    it('should pass through non-empty array body', async () => {
      app.post('/test', (req, res) => {
        res.status(200).json({ received: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send([1, 2, 3]);

      expect(response.status).toBe(200);
      expect(response.body.received).toEqual([1, 2, 3]);
    });

    it('should pass through empty array body', async () => {
      app.post('/test', (req, res) => {
        res.status(200).json({ received: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send([]);

      expect(response.status).toBe(200);
      expect(response.body.received).toEqual([]);
    });

    it('should pass through non-empty string body', async () => {
      app.post('/test', (req, res) => {
        res.status(200).json({ received: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send('hello world');

      expect(response.status).toBe(200);
      expect(response.body.received).toBe('hello world');
    });

    it('should pass through numeric body', async () => {
      app.post('/test', (req, res) => {
        res.status(200).json({ received: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send(42);

      expect(response.status).toBe(200);
      expect(response.body.received).toBe(42);
    });

    it('should pass through boolean body', async () => {
      app.post('/test', (req, res) => {
        res.status(200).json({ received: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send(true);

      expect(response.status).toBe(200);
      expect(response.body.received).toBe(true);
    });
  });

  describe('Invalid request bodies - null/undefined', () => {
    it('should return 400 for null body', async () => {
      app.post('/test', (req, res) => {
        res.status(200).json({ received: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send(null);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Request body is required',
        code: 'EMPTY_BODY'
      });
    });

    it('should return 400 for undefined body', async () => {
      app.post('/test', (req, res) => {
        res.status(200).json({ received: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send(undefined);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Request body is required',
        code: 'EMPTY_BODY'
      });
    });

    it('should return 400 for no body (undefined)', async () => {
      app.post('/test', (req, res) => {
        res.status(200).json({ received: req.body });
      });

      const response = await request(app)
        .post('/test');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Request body is required',
        code: 'EMPTY_BODY'
      });
    });
  });

  describe('Invalid request bodies - empty object', () => {
    it('should return 400 for empty object body', async () => {
      app.post('/test', (req, res) => {
        res.status(200).json({ received: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Request body cannot be empty',
        code: 'EMPTY_BODY'
      });
    });
  });

  describe('Invalid request bodies - whitespace string', () => {
    it('should return 400 for whitespace-only string body', async () => {
      app.post('/test', (req, res) => {
        res.status(200).json({ received: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send('   ');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Request body cannot be empty or whitespace',
        code: 'EMPTY_BODY'
      });
    });

    it('should return 400 for newline-only string body', async () => {
      app.post('/test', (req, res) => {
        res.status(200).json({ received: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send('\n\n');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Request body cannot be empty or whitespace',
        code: 'EMPTY_BODY'
      });
    });

    it('should return 400 for tab-only string body', async () => {
      app.post('/test', (req, res) => {
        res.status(200).json({ received: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send('\t\t');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Request body cannot be empty or whitespace',
        code: 'EMPTY_BODY'
      });
    });

    it('should return 400 for mixed whitespace string body', async () => {
      app.post('/test', (req, res) => {
        res.status(200).json({ received: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send('  \n\t  ');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Request body cannot be empty or whitespace',
        code: 'EMPTY_BODY'
      });
    });
  });

  describe('URL-encoded body validation', () => {
    it('should return 400 for empty URL-encoded body', async () => {
      app.post('/test', (req, res) => {
        res.status(200).json({ received: req.body });
      });

      const response = await request(app)
        .post('/test')
        .type('urlencoded')
        .send('');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Request body cannot be empty',
        code: 'EMPTY_BODY'
      });
    });

    it('should pass through valid URL-encoded body', async () => {
      app.post('/test', (req, res) => {
        res.status(200).json({ received: req.body });
      });

      const response = await request(app)
        .post('/test')
        .type('urlencoded')
        .send('name=test&value=123');

      expect(response.status).toBe(200);
      expect(response.body.received).toEqual({ name: 'test', value: '123' });
    });
  });
});