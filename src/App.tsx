import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/cart-context";
import { AuthProvider } from "./context/auth-context";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderReviews from "./pages/OrderReviews";
import OrderSuccess from "./pages/OrderSuccess";
import ProductDetail from "./pages/ProductDetail";
import Contact from "./pages/Contact";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AllProducts from "./pages/AllProducts";
import NewArrivals from "./pages/NewArrivals";
import BestSellers from "./pages/BestSellers";
import Sale from "./pages/Sale";
import Blog from "./pages/Blog";
import AffiliateProgram from "./pages/AffiliateProgram";
import About from "./pages/About";
// --- ROUTE PROTECTION ---
import AdminRoute from "@/routes/AdminRoute";
import UserRoute from "@/routes/UserRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>

              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/products/:productId" element={<ProductDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/products" element={<AllProducts />} />
              <Route path="/products/new" element={<NewArrivals />} />
              <Route path="/products/best-sellers" element={<BestSellers />} />
              <Route path="/products/sale" element={<Sale />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/affiliate" element={<AffiliateProgram />} />
              <Route path="/about" element={<About />} />


              {/* USER DASHBOARD (Protected) */}
              <Route
                path="/dashboard"
                element={
                  <UserRoute>
                    <UserDashboard />
                  </UserRoute>
                }
              />
              <Route
                path="/dashboard/reviews"
                element={
                  <UserRoute>
                    <OrderReviews />
                  </UserRoute>
                }
              />

              {/* ADMIN DASHBOARD (Protected + Admin only) */}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />

            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
