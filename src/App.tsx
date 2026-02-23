import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layouts/AppLayout";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";

import PaymentSuccess from "./pages/PaymentSuccess";
import PublicListing from "./pages/PublicListing";
import PublicListingDirect from "./pages/PublicListingDirect";
import DemoListing from "./pages/DemoListing";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import Dashboard from "./pages/app/Dashboard";
import Listings from "./pages/app/Listings";
import ListingNew from "./pages/app/ListingNew";
import ListingDetail from "./pages/app/ListingDetail";
import Settings from "./pages/app/Settings";
import MySigns from "./pages/app/MySigns";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import AdminListings from "./pages/admin/AdminListings";
import AdminListingDetail from "./pages/admin/AdminListingDetail";
import AdminPurchases from "./pages/admin/AdminPurchases";
import AdminPurchaseDetail from "./pages/admin/AdminPurchaseDetail";
import AdminSigns from "./pages/admin/AdminSigns";
import AdminTemplates from "./pages/admin/AdminTemplates";

import { queryClient } from "@/lib/queryClient";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/s/:signCode" element={<PublicListing />} />
              <Route path="/l/:listingCode" element={<PublicListingDirect />} />
              <Route path="/demo" element={<DemoListing />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/cookies" element={<Cookies />} />

              {/* Protected app routes */}
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="listings" element={<Listings />} />
                <Route path="listings/new" element={<ListingNew />} />
                <Route path="listings/:id" element={<ListingDetail />} />
                <Route path="signs" element={<MySigns />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Admin routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="users/:userId" element={<AdminUserDetail />} />
                <Route path="listings" element={<AdminListings />} />
                <Route path="listings/:listingId" element={<AdminListingDetail />} />
                <Route path="purchases" element={<AdminPurchases />} />
                <Route path="purchases/:purchaseId" element={<AdminPurchaseDetail />} />
                <Route path="signs" element={<AdminSigns />} />
                <Route path="templates" element={<AdminTemplates />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
