import "./App.css";
import { Routes, Route } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import CatalogPage from "./pages/CatalogPage";
import BookDetailPage from "./pages/BookDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AboutPage from "./pages/AboutPage";
import { CartProvider } from "./context/CartContext";

function App() {
    return (
        <CartProvider>
            <div className="min-h-screen bg-rose-50">
                <Navbar />
                <Routes>
                    <Route path="/" element={<CatalogPage />} />
                    <Route path="/book/:id" element={<BookDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="*" element={<CatalogPage />} />
                </Routes>
                <Footer />
            </div>
        </CartProvider>
    );
}

export default App;
