import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/Layout/Navbar";
import ScrollToTop from "@/components/ScrollToTop";
import Footer from "@/components/Layout/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import ReviewPrompt from "@/components/ReviewPrompt";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import Wishlist from "./pages/Wishlist";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import OrderSuccess from "./pages/OrderSuccess";
import OrderFailed from "./pages/OrderFailed";
import FAQ from "./pages/FAQ";
import About from "./pages/About";
import Careers from "./pages/Careers";
import ShippingReturns from "./pages/ShippingReturns";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import CookiePolicy from "./pages/CookiePolicy";
import TrackOrder from "./pages/TrackOrder";
import Press from "./pages/Press";
import NotFound from "./pages/NotFound";

// Admin imports
import AdminLogin from "@/admin/pages/AdminLogin";
import AdminLayout from "@/admin/components/layout/AdminLayout";
import AdminProtectedRoute from "@/admin/components/AdminProtectedRoute";
import Dashboard from "@/admin/pages/Dashboard";
import Products from "@/admin/pages/Products";
import ProductForm from "@/admin/pages/ProductForm";
import Orders from "@/admin/pages/Orders";
import OrderDetail from "@/admin/pages/OrderDetail";
import Customers from "@/admin/pages/Customers";
import CustomerDetail from "@/admin/pages/CustomerDetail";
import AdminSettings from "@/admin/pages/AdminSettings";
import Reviews from "@/admin/pages/Reviews";
import Analytics from "@/admin/pages/Analytics";
import Notifications from "@/admin/pages/Notifications";
import Inquiries from "@/admin/pages/Inquiries";

import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  const { user, getProfile } = useAuthStore();

  useEffect(() => {
    if (user && user.token) {
      getProfile();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-right" />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <ReviewPrompt />
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout />
                  </AdminProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="products/new" element={<ProductForm />} />
                <Route path="products/:id/edit" element={<ProductForm />} />
                <Route path="orders" element={<Orders />} />
                <Route path="orders/:id" element={<OrderDetail />} />
                <Route path="customers" element={<Customers />} />
                <Route path="customers/:id" element={<CustomerDetail />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="inquiries" element={<Inquiries />} />
              </Route>

              {/* Main Store Routes */}
              <Route path="/*" element={
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main className="flex-1 pt-16 lg:pt-20">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/order-success" element={<OrderSuccess />} />
                      <Route path="/order-failed" element={<OrderFailed />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/careers" element={<Careers />} />
                      <Route path="/shipping-returns" element={<ShippingReturns />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/cookie-policy" element={<CookiePolicy />} />
                      <Route path="/track-order" element={<TrackOrder />} />
                      <Route path="/press" element={<Press />} />
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              } />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;