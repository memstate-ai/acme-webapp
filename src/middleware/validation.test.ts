import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { validateRequestBody } from './validation';

describe('validateRequestBody Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
  });

  describe('Valid request bodies', () => {
    it('should call next() for non-empty object body', () => {
      mockReq.body = { name: 'test', value: 123 };
      validateRequestBody(mockReq as Request, mockRes as Response, mockNext as NextFunction);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should call next() for non-empty array body', () => {
      mockReq.body = [1, 2, 3];
      validateRequestBody(mockReq as Request, mockRes as Response, mockNext as NextFunction);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should call next() for empty array body', () => {
      mockReq.body = [];
      validateRequestBody(mockReq as Request, mockRes as Response, mockNext as NextFunction);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should call next() for non-empty string body', () => {
      mockReq.body = 'hello world';
      validateRequestBody(mockReq as Request, mockRes as Response, mockNext as NextFunction);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should call next() for numeric body', () => {
      mockReq.body = 42;
      validateRequestBody(mockReq as Request, mockRes as Response, mockNext as NextFunction);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should call next() for boolean body', () => {
      mockReq.body = true;
      validateRequestBody(mockReq as Request, mockRes as Response, mockNext as NextFunction);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe('Invalid request bodies - null/undefined', () => {
    it('should return 400 for null body', () => {
      mockReq.body = null;
      validateRequestBody(mockReq as Request, mockRes as Response, mockNext as NextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Request body is required',
        code: 'EMPTY_BODY'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 for undefined body', () => {
      mockReq.body = undefined;
      validateRequestBody(mockReq as Request, mockRes as Response, mockNext as NextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Request body is required',
        code: 'EMPTY_BODY'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Invalid request bodies - empty object', () => {
    it('should return 400 for empty object body', () => {
      mockReq.body = {};
      validateRequestBody(mockReq as Request, mockRes as Response, mockNext as NextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Request body cannot be empty',
        code: 'EMPTY_BODY'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Invalid request bodies - whitespace string', () => {
    it('should return 400 for whitespace-only string body', () => {
      mockReq.body = '   ';
      validateRequestBody(mockReq as Request, mockRes as Response, mockNext as NextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Request body cannot be empty or whitespace',
        code: 'EMPTY_BODY'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 for newline-only string body', () => {
      mockReq.body = '\n\n';
      validateRequestBody(mockReq as Request, mockRes as Response, mockNext as NextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Request body cannot be empty or whitespace',
        code: 'EMPTY_BODY'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 for tab-only string body', () => {
      mockReq.body = '\t\t';
      validateRequestBody(mockReq as Request, mockRes as Response, mockNext as NextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Request body cannot be empty or whitespace',
        code: 'EMPTY_BODY'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 for mixed whitespace string body', () => {
      mockReq.body = '  \n\t  ';
      validateRequestBody(mockReq as Request, mockRes as Response, mockNext as NextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Request body cannot be empty or whitespace',
        code: 'EMPTY_BODY'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});