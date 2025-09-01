const BASE = import.meta.env.VITE_API_BASE;

export async function getProducts() {
  const r = await fetch(`${BASE}/api/products`);
  return r.json();
}

export async function createOrder(payload) {
  const r = await fetch(`${BASE}/api/order/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return r.json();
}

export async function verifyPayment(resp) {
  const r = await fetch(`${BASE}/api/payment/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(resp),
  });
  return r.json();
}
