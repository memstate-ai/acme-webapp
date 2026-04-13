"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
/**
 * Auth middleware — placeholder for JWT verification (Issue #1)
 */
function requireAuth(req, res, next) {
    const userId = req.headers["x-user-id"];
    if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
    }
    next();
}
function requireAdmin(req, res, next) {
    const role = req.headers["x-user-role"];
    if (role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
    }
    next();
}
