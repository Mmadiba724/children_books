import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import CatalogPage from "./pages/CatalogPage";
import BookDetailPage from "./pages/BookDetailPage";
// import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AboutPage from "./pages/AboutPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import AdminDashboard from "./pages/AdminDashboard";
import LibraryPage from "./pages/LibraryPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <div className="min-h-screen bg-rose-50">
                    <Toaster position="top-right" />
                    <Navbar />
                    <ScrollToTop />
                    <Routes>
                        <Route path="/" element={<CatalogPage />} />
                        <Route path="/search" element={<SearchResultsPage />} />
                        <Route path="/book/:id" element={<BookDetailPage />} />
                        {/* <Route path="/cart" element={<CartPage />} /> */}
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route
                            path="/library"
                            element={
                                <ProtectedRoute>
                                    <LibraryPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="*" element={<CatalogPage />} />
                    </Routes>
                    <Footer />
                </div>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
