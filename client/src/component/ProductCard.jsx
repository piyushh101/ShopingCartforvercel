// src/components/ProductCard.jsx
export default function ProductCard({ product, onAdd }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, textAlign: "center" }}>
      <img src={product.img} alt={product.title} width="220" style={{ borderRadius: 8 }} />
      <h3 style={{ margin: "8px 0" }}>{product.title}</h3>
      <p style={{ color: "#555" }}>₹{(product.price / 100).toFixed(2)}</p>
      <button onClick={() => onAdd(product)} style={{ marginTop: 8, padding: "8px 16px", background: "#111", color: "white", borderRadius: 4 }}>
        Add to Cart
      </button>
    </div>
  );
}
