"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
exports.authRouter = (0, express_1.Router)();
// Placeholder auth routes — JWT implementation needed (Issue #1)
exports.authRouter.post("/login", (req, res) => {
    const { email, password } = req.body;
    // TODO: Implement JWT-based authentication
    res.status(501).json({ error: "Authentication not implemented yet" });
});
exports.authRouter.post("/register", (req, res) => {
    const { email, name, password } = req.body;
    // TODO: Implement user registration
    res.status(501).json({ error: "Registration not implemented yet" });
});
exports.authRouter.get("/profile", (req, res) => {
    // TODO: Return current user profile from JWT
    res.status(501).json({ error: "Not implemented" });
});
