import { Request, Response, NextFunction } from "express";
/**
 * Auth middleware — placeholder for JWT verification (Issue #1)
 */
export declare function requireAuth(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export declare function requireAdmin(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
