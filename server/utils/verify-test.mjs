import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const orderId = "order_RB8wj07Mf6NhAE"; // 👈 rpOrder.id from /api/order/create
const paymentId = "test_payment_123";
const secret = process.env.RAZORPAY_KEY_SECRET;

const sig = crypto
  .createHmac("sha256", secret)
  .update(orderId + "|" + paymentId)
  .digest("hex");

console.log("Generated signature:", sig);

const res = await fetch("http://localhost:5174/api/payment/verify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: sig,
  }),
});

console.log("Response:", await res.json());
