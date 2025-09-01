import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";   // ✅ this needs a default export
      import "./index.css";  
// optional styles if needed

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
