import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  pricePaise: { type: Number, required: true }, // store in paise
  img: { type: String },   
  sku: String,
  stock: { type: Number, default: 100 },
}, { timestamps: true });

const AddressSchema = new mongoose.Schema({
  name: String,
  phone: String,
  line1: String,
  line2: String,
  city: String,
  state: String,
  pincode: String,
}, { _id: false });

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  title: String,
  pricePaise: Number,
  qty: Number,
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  items: [
    {
      productId: String,
      title: String,
      pricePaise: Number,
      qty: Number,
    }
  ],
  address: {
    name: String,
    phone: String,
    email: String,   // ✅ new field
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
  },
  subtotalPaise: Number,
  rp_order_id: String,
  rp_payment_id: String,
  rp_signature: String,
  status: { type: String, default: "pending" },
}, { timestamps: true });

export const Product = mongoose.model("Product", ProductSchema);
export const Order   = mongoose.model("Order", OrderSchema);
