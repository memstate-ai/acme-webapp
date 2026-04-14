import express from "express";
import * as dotenv from "dotenv";
import { rateLimitMiddleware } from "./middleware/rateLimit";
import { cartRouter } from "./routes/cart";
import { productRouter } from "./routes/products";
import { orderRouter } from "./routes/orders";
import { authRouter } from "./routes/auth";
import { adminRouter } from "./routes/admin";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Apply Rate Limiting Middleware globally (before routes)
app.use(rateLimitMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/cart", cartRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);
app.use("/admin", adminRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Acme Webapp running on http://localhost:${PORT}`);
});

export default app;