// src/pages/CartPage.jsx
import { Link } from "react-router-dom";
import { useCart } from "../cartContext";
import "./cart.css";

export default function CartPage() {
  const { items, totalPaise, inc, dec, remove } = useCart();

  if (!items.length) return <p className="empty-cart">🛒 Your cart is empty.</p>;

  return (
    <div className="cart-container">
      <h2 className="cart-title">Your Bag</h2>
      <div className="cart-header">
        <span>Product</span>
        <span>Price</span>
        <span>Quantity</span>
        <span>Total</span>
      </div>

      {items.map((x) => (
        <div className="cart-row" key={x.id}>
          <div className="cart-product">
            <img src={x.img} alt={x.title} />
            <span>{x.title}</span>
          </div>
          <div>₹{(x.pricePaise / 100).toFixed(2)}</div>
          <div className="cart-qty">
            <button onClick={() => dec(x.id)}>-</button>
            <span>{x.qty}</span>
            <button onClick={() => inc(x.id)}>+</button>
          </div>
          <div className="cart-total">
            ₹{((x.pricePaise * x.qty) / 100).toFixed(2)}
          </div>
          <button className="remove-btn" onClick={() => remove(x.id)}>✕</button>
        </div>
      ))}

      <div className="cart-summary">
        <h3>Subtotal: ₹{(totalPaise / 100).toFixed(2)}</h3>
        <Link to="/checkout">
          <button className="checkout-btn">Proceed to Checkout</button>
        </Link>
      </div>
    </div>
  );
}
