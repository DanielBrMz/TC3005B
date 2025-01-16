import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { ProductDetails } from "./pages/ProductDetails";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { Orders } from "./pages/Orders";
import { Admin } from "./pages/Admin";
import "./App.css";
import { ReactNode } from "react";
import { Products } from "./pages/Products.tsx";
import { AdminRoute } from "./components/AdminRoute.tsx";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={(<Home />) as ReactNode} />
        <Route
          path="/product/:id"
          element={(<ProductDetails />) as ReactNode}
        />
        <Route path="/cart" element={(<Cart />) as ReactNode} />
        <Route path="/checkout" element={(<Checkout />) as ReactNode} />
        <Route path="/orders" element={(<Orders />) as ReactNode} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
        <Route path="/products" element={<Products />} />
      </Routes>
      <Footer />
    </Router>
  );
}
