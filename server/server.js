// server/server.js
import express from "express";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import cors from "cors";
import crypto from "crypto";
import mongoose from "mongoose";
import { sendOrderEmail } from "./utils/mailer.js";

import { Product, Order } from "./models.js";
import { z } from "zod";

dotenv.config();

// log first 30 chars to confirm it's loaded
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is missing!");
} else {
  console.log("MONGODB_URI loaded:", process.env.MONGODB_URI.slice(0, 30) + "...");
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err.message));
  
const app = express();
app.use(express.static("public")); // serve static files from /server/public

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
  app.get("/api/_debug", (_req, res) => {
  res.json({
    key_id: process.env.RAZORPAY_KEY_ID,
    mode: (process.env.RAZORPAY_KEY_ID || "").startsWith("rzp_test_") ? "test" : "live"
  });
});




// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running 🚀" });
});

// Create Razorpay Order (for Checkout popup)
app.post("/api/orders", async (req, res) => {
  try {
    const { amount, currency = "INR" } = req.body;
    if (!amount) return res.status(400).json({ error: "amount (in paise) required" });

    const order = await razorpay.orders.create({
      amount,                  // e.g. 49900 = ₹499.00
      currency,
      receipt: "rcpt_" + Date.now(),
    });

    res.json(order);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});
app.get("/api/orders/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid order id" });
  }
  const order = await Order.findById(req.params.id).lean();
  if (!order) return res.status(404).json({ error: "Not found" });
  res.json(order);
});


// Create single-use UPI QR (return id + any links available)
app.post("/api/qr", async (req, res) => {
  try {
    const { amount, description = "Cart UPI QR" } = req.body;
    if (!amount) return res.status(400).json({ error: "amount (in paise) required" });

    const qr = await razorpay.qrCode.create({
      type: "upi_qr",
      name: "Cart Payment",
      usage: "single_use",
      fixed_amount: true,
      payment_amount: amount,
      description,
    });

    res.json({ id: qr.id, short_url: qr.short_url, image_url: qr.image_url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Fetch QR by id (to get image_url / short_url after creation)
app.get("/api/qr/:id", async (req, res) => {
  try {
    const qr = await razorpay.qrCode.fetch(req.params.id);
    res.json({ id: qr.id, status: qr.status, short_url: qr.short_url, image_url: qr.image_url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Verify payment signature (Checkout success handler)
// Verify payment signature (Checkout success handler)
app.post("/api/payment/verify", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ ok: false, error: "Missing fields" });
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return res.status(400).json({ ok: false, error: "Invalid signature" });
  }

  // ✅ mark order paid in DB
  const updated = await Order.findOneAndUpdate(
    { rp_order_id: razorpay_order_id },
    { status: "paid", rp_payment_id: razorpay_payment_id, rp_signature: razorpay_signature },
    { new: true }
  );

  if (!updated) return res.status(404).json({ ok: false, error: "Order not found" });
  res.json({ ok: true, orderId: updated._id });
});

// DEV ONLY: seed sample products
// DEV ONLY: seed sample products

app.get("/api/_seed", async (req, res) => {
  await Product.deleteMany({});
  const docs = await Product.insertMany([
    {
      title: "BlackBerry shirt",
      pricePaise: 7999,
      sku: "MOU-001",
      stock: 50,
      img: "https://as1.ftcdn.net/jpg/14/94/47/06/1000_F_1494470662_eP5koeBDg8nVWxTZBNjLtU774tLwOQKt.jpg"
    },
    {
      title: "YourName shirt",
      pricePaise: 3499,
      sku: "KEY-001",
      stock: 25,
      img: "https://as1.ftcdn.net/v2/jpg/04/16/04/24/1000_F_416042466_BX8Ul2bPoxKg6mT7BIeQWZJ7JhnUd89f.jpg"
    },
    {
      title: "Ladies shirt",
      pricePaise: 1999,
      sku: "CHA-065",
      stock: 40,
      img: "https://as2.ftcdn.net/v2/jpg/15/23/63/11/1000_F_1523631107_fQ2tQd1Umm8zmSO5dcMuVNgMPXUnsWxb.jpg"
    },
  ]);
  res.json({ ok: true, count: docs.length });
});



app.get("/api/products", async (req, res) => {
  const products = await Product.find().lean();
  res.json(products);
});

const CreateOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    qty: z.number().int().positive(),
  })).min(1),
  address: z.object({
    name: z.string().min(2),
    phone: z.string().min(8),
    email: z.string().email(),   
    line1: z.string().min(3),
    line2: z.string().optional().default(""),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(4),
  })
});

app.post("/api/order/create", async (req, res) => {
  try {
    const parsed = CreateOrderSchema.parse(req.body);

    const ids = parsed.items.map(i => (i.productId || "").trim());
    const invalid = ids.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalid.length) {
      return res.status(400).json({ error: `Invalid productId format: ${invalid.join(", ")}` });
    }

    const products = await Product.find({ _id: { $in: ids } }).lean();
    const byId = new Map(products.map(p => [String(p._id), p]));
    const missing = ids.filter(id => !byId.has(id));
    if (missing.length) {
      return res.status(400).json({ error: `Product(s) not found: ${missing.join(", ")}` });
    }

    let subtotal = 0;
    const orderItems = parsed.items.map(i => {
      const p = byId.get(i.productId);
      subtotal += p.pricePaise * i.qty;
      return { productId: p._id, title: p.title, pricePaise: p.pricePaise, qty: i.qty };
    });

    const rpOrder = await razorpay.orders.create({
      amount: subtotal,
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
    });

    const order = await Order.create({
      items: orderItems,
      address: parsed.address,
      subtotalPaise: subtotal,
      rp_order_id: rpOrder.id,
      status: "pending",
    });

    // 📧 send order confirmation email
    try {
      await sendOrderEmail({
        to: parsed.address.email,
        subject: `Order received — #${order._id}`,
        html: `
          <h2>Thanks, ${parsed.address.name}!</h2>
          <p>We got your order <b>#${order._id}</b>.</p>
          <p>Amount: ₹${(subtotal / 100).toFixed(2)}</p>
          <p>Status: <b>Pending payment</b></p>
        `,
      });
    } catch (e) {
      console.error("❌ Order email failed:", e.message);
    }

    // ✅ final response
    res.json({ orderId: order._id, rpOrder });

  } catch (e) {
    if (e.errors) return res.status(422).json({ ok: false, errors: e.errors });
    console.error(e);
    res.status(400).json({ error: e.message });
  }
});

// List all orders
app.get("/api/orders", async (_req, res) => {
  try {
    const list = await Order.find().sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get("/test-email", async (req, res) => {
  try {
    await sendOrderEmail({
      to: "testrecipient@example.com",
      subject: "Test Email from My Shop",
      html: "<h1>Hello!</h1><p>This is a test email 🚀</p>",
    });
    res.send("✅ Email sent successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Failed to send email");
  }
});

app.post("/api/payment/verify", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ ok: false, error: "Missing fields" });
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return res.status(400).json({ ok: false, error: "Invalid signature" });
  }

  // ✅ mark order paid in DB
  const updated = await Order.findOneAndUpdate(
    { rp_order_id: razorpay_order_id },
    { status: "paid", rp_payment_id: razorpay_payment_id, rp_signature: razorpay_signature },
    { new: true }
  );

  if (!updated) return res.status(404).json({ ok: false, error: "Order not found" });

  // 📧 send payment success email
  try {
    await sendOrderEmail({
      to: updated.address.email,
      subject: `Payment successful — #${updated._id}`,
      html: `
        <h2>Payment successful ✅</h2>
        <p>Hi ${updated.address.name},</p>
        <p>We received your payment for order <b>#${updated._id}</b>.</p>
        <p>Amount: ₹${(updated.subtotalPaise / 100).toFixed(2)}</p>
        <p>Razorpay Payment ID: <code>${razorpay_payment_id}</code></p>
      `
    });
  } catch (e) {
    console.error("❌ Payment email failed:", e.message);
  }

  res.json({ ok: true, orderId: updated._id });
});


const PORT = process.env.PORT || 5174;
// CORS setup
const allowedOrigins = [
  "http://localhost:5173",          // local dev (Vite)
  "https://bookkaroo.netlify.app"   // production (Netlify)
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like curl, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
