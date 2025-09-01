import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./cartContext";
import Shop from "./pages/Shop";
import CartPage from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyNavbar from "./component/Navbar";
import MyFooter from "./component/Footer";
import { useRef } from "react";

function App() {
  const cartIconRef = useRef(null);

  return (
    <CartProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <MyNavbar ref={cartIconRef} />
          <main className="flex-grow p-4">
            <Routes>
              <Route path="/" element={<Shop cartIconRef={cartIconRef} />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<Checkout />} />
            </Routes>
          </main>
          <MyFooter />
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
