import "./footer.css";

import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Left */}
        <div className="footer-left">
          <h2 className="footer-logo">🛒 My Shop</h2>
          <p>© {new Date().getFullYear()} My Shop. All rights reserved.</p>
        </div>

        {/* Center Links */}
        <div className="footer-links">
          <a href="/">Home</a>

          <Link to="/cart">Cart</Link>
          <a href="/checkout">Checkout</a>
        </div>

        {/* Right Socials */}
        <div className="footer-socials">
          <a href="https://github.com" target="_blank" rel="noreferrer">
            <img src="https://cdn-icons-png.flaticon.com/512/25/25231.png" alt="GitHub" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer">
            <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer">
            <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" />
          </a>
        </div>
      </div>
    </footer>
  );
}
