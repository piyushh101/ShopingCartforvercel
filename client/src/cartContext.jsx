// src/cartContext.jsx
import { createContext, useContext, useMemo, useState } from "react";

const CartCtx = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // [{id, title, pricePaise, image, qty}]

  const add = (p) => {
    setItems((prev) => {
      const found = prev.find((x) => x.id === p._id);
      if (found) {
        return prev.map((x) =>
          x.id === p._id ? { ...x, qty: x.qty + 1 } : x
        );
      }
      return [
        ...prev,
        {
          id: p._id,
          title: p.title,
          pricePaise: p.pricePaise,
          img: p.img,
          qty: 1,
        },
      ];
    });
  };

  const remove = (id) => setItems((prev) => prev.filter((x) => x.id !== id));

  const inc = (id) =>
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x))
    );

  const dec = (id) =>
    setItems((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, qty: Math.max(1, x.qty - 1) } : x
      )
    );

  const totalPaise = useMemo(
    () => items.reduce((s, x) => s + x.pricePaise * x.qty, 0),
    [items]
  );

  return (
    <CartCtx.Provider value={{ items, add, remove, inc, dec, totalPaise }}>
      {children}
    </CartCtx.Provider>
  );
}

export const useCart = () => useContext(CartCtx);
