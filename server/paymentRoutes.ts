import type { Express } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { z } from "zod";
import { storage } from "./storage";
import { requireAuth } from "./authUtils";

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || "";
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "";
const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

let razorpay: Razorpay | null = null;

if (razorpayKeyId && razorpayKeySecret) {
  razorpay = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  });
  console.log("✅ Razorpay initialized successfully");
} else {
  console.warn("⚠️  Razorpay credentials not configured. Payment routes will return 503.");
}

export function registerPaymentRoutes(app: Express) {
  app.post("/api/orders/create", requireAuth, async (req: any, res) => {
    try {
      if (!razorpay) {
        return res.status(503).json({ message: "Payment gateway not configured" });
      }

      const userId = req.user.userId;
      
      const cartItems = await storage.getCartItems(userId);
      
      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      const outOfStockItem = cartItems.find(
        (item) => (item.product.stockCount ?? 0) < item.quantity
      );

      if (outOfStockItem) {
        return res.status(400).json({
          message: `${outOfStockItem.product.title} is currently out of stock`,
        });
      }

      const totalAmount = cartItems.reduce((sum, item) => {
        return sum + parseFloat(item.product.price) * item.quantity;
      }, 0);

      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: `order_${Date.now()}`,
        notes: {
          userId: userId,
        },
      });

      const order = await storage.createOrder({
        userId: userId,
        totalAmount: totalAmount.toFixed(2),
        status: "pending",
        paymentIntentId: razorpayOrder.id,
      });

      for (const item of cartItems) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          price: item.product.price,
          quantity: item.quantity,
        });
      }

      res.json({
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: razorpayKeyId,
        internalOrderId: order.id,
      });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.post("/api/payments/verify", requireAuth, async (req: any, res) => {
    try {
      if (!razorpay || !razorpayKeySecret) {
        return res.status(503).json({ message: "Payment gateway not configured" });
      }

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", razorpayKeySecret)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: "Invalid payment signature" });
      }

      const order = await storage.getOrderByPaymentIntentId(razorpay_order_id);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.status === "completed") {
        return res.json({
          success: true,
          message: "Payment already verified",
          orderId: order.id,
        });
      }

      await storage.updateOrderStatus(order.id, "completed");
      await storage.reduceStockForOrder(order.id);
      await storage.clearCart(req.user.userId);

      res.json({
        success: true,
        message: "Payment verified successfully",
        orderId: order.id,
      });
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ message: "Payment verification failed" });
    }
  });

  app.post("/api/webhooks/razorpay", async (req, res) => {
    try {
      if (!razorpay || !razorpayWebhookSecret) {
        return res.status(503).json({ message: "Payment gateway not configured" });
      }

      const webhookSignature = req.headers["x-razorpay-signature"] as string;
      
      if (!webhookSignature) {
        return res.status(400).json({ message: "Missing signature" });
      }

      const expectedSignature = crypto
        .createHmac("sha256", razorpayWebhookSecret)
        .update(JSON.stringify(req.body))
        .digest("hex");

      if (webhookSignature !== expectedSignature) {
        return res.status(400).json({ message: "Invalid webhook signature" });
      }

      const event = req.body;

      if (event.event === "payment.captured") {
        const paymentId = event.payload.payment.entity.id;
        const orderId = event.payload.payment.entity.order_id;

        const order = await storage.getOrderByPaymentIntentId(orderId);

        if (order && order.status !== "completed") {
          await storage.updateOrderStatus(order.id, "completed");
          await storage.reduceStockForOrder(order.id);
          console.log(`✅ Order ${order.id} marked as completed via webhook`);
        }
      } else if (event.event === "payment.failed") {
        const orderId = event.payload.payment.entity.order_id;

        const order = await storage.getOrderByPaymentIntentId(orderId);

        if (order) {
          await storage.updateOrderStatus(order.id, "failed");
          console.log(`❌ Order ${order.id} marked as failed via webhook`);
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });
}
