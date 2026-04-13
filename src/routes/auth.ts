import { Router } from "express";

export const authRouter = Router();

// Placeholder auth routes — JWT implementation needed (Issue #1)
authRouter.post("/login", (req, res) => {
  const { email, password } = req.body;
  // TODO: Implement JWT-based authentication
  res.status(501).json({ error: "Authentication not implemented yet" });
});

authRouter.post("/register", (req, res) => {
  const { email, name, password } = req.body;
  // TODO: Implement user registration
  res.status(501).json({ error: "Registration not implemented yet" });
});

authRouter.get("/profile", (req, res) => {
  // TODO: Return current user profile from JWT
  res.status(501).json({ error: "Not implemented" });
});
