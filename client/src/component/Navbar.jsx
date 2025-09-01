// Navbar.jsx
import { Link } from "react-router-dom";
import { useCart } from "../cartContext"; // 👈 use cart context
import "./Navbar.css";

export default function Navbar() {
  const { items } = useCart();
  const cartCount = items.reduce((sum, x) => sum + x.qty, 0); // total qty

  return (
    <div className="navbar">
      <Link to="/" className="logo">
        🛒 My Shop
      </Link>

      <div className="navbar-right">
        {/* Cart */}
        <div className="cart">
          <Link to="/cart" className="cart-link">
            <svg
                  id="cart-icon" 
              xmlns="http://www.w3.org/2000/svg"
              className="cart-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293a1 1 0 00.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4m-8 2a2 2 0 11-4 0 2 2 0 014 0"
              />
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        </div>

        {/* Avatar */}
        <div className="avatar">
          <img
            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
            alt="User"
          />
        </div>
      </div>
    </div>
  );
}
