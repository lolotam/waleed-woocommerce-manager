
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WebScraper from "@/components/Scraper/WebScraper";
import DataManager from "@/components/Scraper/DataManager";
import ImportSettings from "@/components/Scraper/ImportSettings";
import { ScrapedProduct } from "@/types/scraper";

const ScraperImporterPage = () => {
  const [scrapedProducts, setScrapedProducts] = useState<ScrapedProduct[]>([]);
  const [activeTab, setActiveTab] = useState("scraper");
  
  const handleProductsScraped = (products: ScrapedProduct[]) => {
    setScrapedProducts(products);
    setActiveTab("data");
  };
  
  const handleImportProducts = (products: ScrapedProduct[]) => {
    setActiveTab("import");
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Product Scraper & Importer</h1>
        <p className="text-muted-foreground">
          Scrape product data from e-commerce websites and import to WooCommerce
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scraper">Web Scraper</TabsTrigger>
          <TabsTrigger value="data">Data Manager</TabsTrigger>
          <TabsTrigger value="import">Import Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scraper">
          <WebScraper onProductsScraped={handleProductsScraped} />
        </TabsContent>
        
        <TabsContent value="data">
          <DataManager 
            scrapedProducts={scrapedProducts} 
            setScrapedProducts={setScrapedProducts}
            onImportProducts={handleImportProducts}
          />
        </TabsContent>
        
        <TabsContent value="import">
          <ImportSettings products={scrapedProducts} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScraperImporterPage;
