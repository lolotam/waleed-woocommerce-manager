
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/Layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import BrandsManager from "./pages/BrandsManager";
import CategoriesPage from "./pages/CategoriesPage";
import Settings from "./pages/Settings";
import LicenseActivation from "./pages/LicenseActivation";
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
import PerformanceComparePage from "./pages/PerformanceComparePage";
import { useEffect, useState } from "react";
import { isLicenseValid } from "./utils/licenseManager";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLicensed, setIsLicensed] = useState(false);

  useEffect(() => {
    const checkLicense = async () => {
      const valid = await isLicenseValid();
      setIsLicensed(valid);
      setIsLoading(false);
    };

    checkLicense();
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
          <Routes>
            {/* License Activation Route (public) */}
            <Route path="/license" element={<LicenseActivation />} />

            {/* Protected Routes */}
            {isLicensed ? (
              <Route element={<MainLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/brands" element={<BrandsManager />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/about" element={<About />} />
                <Route path="/import-export" element={<ImportExportPage />} />
                <Route path="/prompts" element={<PromptsPage />} />
                <Route path="/logs" element={<LogsPage />} />
                <Route path="/scraper" element={<ScraperImporterPage />} />
                <Route path="/brand-logo-uploader" element={<BrandLogoUploader />} />
                <Route path="/web-performance" element={<WebPerformancePage />} />
                <Route path="/web-performance/compare" element={<PerformanceComparePage />} />
              </Route>
            ) : (
              <Route path="*" element={<Navigate to="/license" replace />} />
            )}

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />

            {/* WooCommerce Callback Route */}
            <Route path="/api/woocommerce-callback" element={<WooCommerceCallback />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
