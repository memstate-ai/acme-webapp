import { Request, Response, NextFunction } from "express";

/**
 * Auth middleware — placeholder for JWT verification (Issue #1)
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const role = req.headers["x-user-role"];
  if (role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
