import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to validate that the request body is not empty.
 * Checks if the body is null, undefined, an empty object, 
 * or a string containing only whitespace.
 * 
 * Note: This middleware should be used after express.json() and 
 * express.urlencoded() body parsers.
 */
export const validateRequestBody = (req: Request, res: Response, next: NextFunction): void => {
  const body = req.body;

  // 1. Check if body is null or undefined
  if (body === null || body === undefined) {
    res.status(400).json({ 
      error: 'Request body is required',
      code: 'EMPTY_BODY'
    });
    return;
  }

  // 2. Check if body is an empty object (but allow empty arrays)
  if (typeof body === 'object' && !Array.isArray(body) && Object.keys(body).length === 0) {
    res.status(400).json({ 
      error: 'Request body cannot be empty',
      code: 'EMPTY_BODY'
    });
    return;
  }

  // 3. Check if body is a string and contains only whitespace
  if (typeof body === 'string' && body.trim().length === 0) {
    res.status(400).json({ 
      error: 'Request body cannot be empty or whitespace',
      code: 'EMPTY_BODY'
    });
    return;
  }

  next();
};