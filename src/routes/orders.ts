import { Router, Request, Response } from "express";
import { createOrder, getOrderById, getUserOrders, getAllOrders, updateOrderStatus } from "../services/orders";
import { createObjectCsvWriter } from "csv-writer";
import type { Order } from "../models/types";

export const orderRouter = Router();

orderRouter.post("/", (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string || "anonymous";
    const { discountCode } = req.body;
    const order = createOrder(userId, discountCode);
    res.status(201).json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

orderRouter.get("/", (req, res) => {
  const userId = req.headers["x-user-id"] as string;
  if (userId) return res.json(getUserOrders(userId));
  res.json(getAllOrders());
});

orderRouter.get("/:id", (req, res) => {
  const order = getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

orderRouter.patch("/:id/status", (req, res) => {
  try {
    const { status } = req.body;
    const order = updateOrderStatus(req.params.id, status);
    res.json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/orders/export
 * Exports all orders as a CSV file with columns:
 * orderId, date, customer, items, total, status
 */
orderRouter.get("/export", async (req: Request, res: Response): Promise<void> => {
  try {
    const orders: Order[] = getAllOrders();

    if (!orders || orders.length === 0) {
      res.status(404).json({ message: "No orders found to export." });
      return;
    }

    // Get user information for customer names
    const users: Map<string, string> = new Map();
    // In a real app, fetch from database. For now, use userId as customer name
    orders.forEach(order => {
      if (!users.has(order.userId)) {
        users.set(order.userId, order.userId);
      }
    });

    // Create CSV writer that streams directly to response
    const csvWriter = createObjectCsvWriter({
      path: res,
      header: [
        { id: 'orderId', title: 'ORDER ID' },
        { id: 'date', title: 'DATE' },
        { id: 'customer', title: 'CUSTOMER' },
        { id: 'items', title: 'ITEMS' },
        { id: 'total', title: 'TOTAL' },
        { id: 'status', title: 'STATUS' },
      ],
      append: false,
    });

    // Transform orders to CSV records
    const records = orders.map(order => ({
      orderId: order.id,
      date: order.createdAt.split('T')[0], // YYYY-MM-DD format
      customer: users.get(order.userId) || order.userId,
      items: order.items.map(item => `${item.productName} (x${item.quantity})`).join('; '),
      total: order.total.toFixed(2),
      status: order.status,
    }));

    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="orders_export.csv"');

    // Write records to response stream
    await csvWriter.writeRecords(records);
    res.end();

  } catch (err: any) {
    console.error('Error exporting orders:', err);
    res.status(500).json({ error: 'Failed to export orders: ' + err.message });
  }
});