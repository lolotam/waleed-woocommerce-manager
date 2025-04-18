import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Existing imports
import MainLayout from "./components/Layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import BrandsManager from "./pages/BrandsManager";
import CategoriesPage from "./pages/CategoriesPage";
import Settings from "./pages/Settings";
import LicenseActivation from "./pages/LicenseActivation";
import LicenseGenerator from "./pages/LicenseGenerator";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import ImportExportPage from "./pages/ImportExportPage";
import PromptsPage from "./pages/PromptsPage";
import LogsPage from "./pages/LogsPage";
import ProductsPage from "./pages/ProductsPage";
import ScraperImporterPage from "./pages/ScraperImporterPage";
import BrandLogoUploader from "./pages/BrandLogoUploader";
import WooCommerceCallback from "./pages/WooCommerceCallback";
import WebPerformancePage from "./pages/WebPerformancePage";
import BulkProductSeoPage from "./pages/BulkProductSeoPage";
import WebToolsPage from "./pages/WebToolsPage";
import AuthPage from "./pages/AuthPage";
import ActivationPage from "./pages/ActivationPage";
import { useEffect, useState } from "react";
import { isLicenseValid } from "./utils/licenseManager";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLicensed, setIsLicensed] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const checkLicense = async () => {
      try {
        const valid = await isLicenseValid();
        setIsLicensed(valid);
      } catch (error) {
        console.error("License check error:", error);
        setIsLicensed(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkLicense();

    // Cleanup subscription
    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="min-h-screen flex flex-col w-full text-base md:text-base">
            <Routes>
              {/* Authentication Routes */}
              <Route path="/auth" element={!session ? <AuthPage /> : <Navigate to="/" replace />} />
              <Route path="/activation" element={session ? <ActivationPage /> : <Navigate to="/auth" replace />} />
              
              {/* Root Index Route - Handles redirects */}
              <Route path="/" element={<Index />} />
              
              {/* License Activation Route (public) */}
              <Route path="/license" element={<LicenseActivation />} />
              
              {/* License Generator Route (admin only - restrict access) */}
              <Route 
                path="/license-generator" 
                element={isLicensed ? <LicenseGenerator /> : <LicenseActivation />} 
              />

              {/* WooCommerce Callback Route - should be accessible without license for OAuth flow */}
              <Route path="/api/woocommerce-callback" element={<WooCommerceCallback />} />

              {/* Protected Routes */}
              {isLicensed ? (
                <Route element={<MainLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/brands" element={<BrandsManager />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/bulk-product-seo" element={<BulkProductSeoPage />} />
                  <Route path="/brand-logo-uploader" element={<BrandLogoUploader />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/import-export" element={<ImportExportPage />} />
                  <Route path="/prompts" element={<PromptsPage />} />
                  <Route path="/logs" element={<LogsPage />} />
                  <Route path="/web-tools" element={<WebToolsPage />} />
                  <Route path="/scraper" element={<ScraperImporterPage />} />
                  <Route path="/web-performance" element={<WebPerformancePage />} />
                </Route>
              ) : (
                <Route path="*" element={<LicenseActivation />} />
              )}

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
