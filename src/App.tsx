import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { MotionConfig } from "framer-motion";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import CatalogPage from "./pages/CatalogPage";
import BookDetailPage from "./pages/BookDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import AboutPage from "./pages/AboutPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminDashboard from "./pages/AdminDashboard";
import LibraryPage from "./pages/LibraryPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import AllBooksPage from "./pages/AllBooksPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

// /search used to be a separate results page; everything now lives in /books.
function LegacySearchRedirect() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const author = params.get("author");
  if (author && !params.get("q")) params.set("q", author);
  params.delete("author");
  const qs = params.toString();
  return <Navigate to={`/books${qs ? `?${qs}` : ""}`} replace />;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MotionConfig reducedMotion="user">
          <div className="min-h-screen bg-cream">
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:font-bold focus:text-white"
            >
              Skip to content
            </a>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  borderRadius: "9999px",
                  background: "#2b2438",
                  color: "#fff",
                  fontWeight: 700,
                },
              }}
            />
            <Navbar />
            <ScrollToTop />
            <main id="main" tabIndex={-1} className="outline-none">
              <Routes>
                <Route path="/" element={<CatalogPage />} />
                <Route path="/books" element={<AllBooksPage />} />
                <Route path="/search" element={<LegacySearchRedirect />} />
                <Route path="/book/:id" element={<BookDetailPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route
                  path="/library"
                  element={
                    <ProtectedRoute>
                      <LibraryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <MyOrdersPage />
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
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </MotionConfig>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
