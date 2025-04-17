import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, FileSpreadsheet, Globe, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ScraperPlatform, ScrapedProduct } from "@/types/scraper";
import UrlInputSection from "./UrlInput/UrlInputSection";
import ScrapingOptions from "./Options/ScrapingOptions";
import { ScrapingOptions as ScrapingOptionsType } from "./types/scraperTypes";

interface WebScraperProps {
  onProductsScraped: (products: ScrapedProduct[]) => void;
}

const WebScraper = ({ onProductsScraped }: WebScraperProps) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [platform, setPlatform] = useState<ScraperPlatform | null>(null);
  const [scrapingOptions, setScrapingOptions] = useState<ScrapingOptionsType>({
    mode: 'auto',
    useProxy: false,
    isCategory: false,
    scrapeAll: false,
    maxProducts: 50,
    bypassProtection: false,
    enableCache: true
  });
  
  const handleScrape = async () => {
    if (!url) {
      toast.error("Please enter a URL to scrape");
      return;
    }
    
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Mock scraped products for demo purposes
      const mockProducts: ScrapedProduct[] = [
        {
          id: "mock-1",
          title: "Sample Product 1",
          regular_price: "29.99",
          sale_price: "19.99",
          sku: "SP001",
          image_url: "https://picsum.photos/id/26/500/500",
          gallery_urls: ["https://picsum.photos/id/26/500/500", "https://picsum.photos/id/27/500/500"],
          tags: ["sample", "demo"],
          categories: ["Electronics", "Gadgets"],
          brand: "SampleBrand",
          description: "This is a sample product description for demonstration purposes.",
          short_description: "A sample product for demo.",
          attributes: [
            { name: "Color", value: "Black" },
            { name: "Size", value: "Medium" }
          ],
          source_url: url,
          platform: platform || 'unknown'
        },
        {
          id: "mock-2",
          title: "Sample Product 2",
          regular_price: "49.99",
          sku: "SP002",
          image_url: "https://picsum.photos/id/30/500/500",
          categories: ["Clothing"],
          brand: "DemoBrand",
          description: "Another sample product description.",
          source_url: url,
          platform: platform || 'unknown'
        }
      ];
      
      toast.success(`Successfully scraped ${mockProducts.length} products using ${scrapingOptions.mode} mode`);
      onProductsScraped(mockProducts);
    } catch (error) {
      console.error(error);
      toast.error("Failed to scrape products: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="overflow-hidden border-2 border-blue-100 dark:border-blue-900 shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
        <CardTitle className="text-lg flex items-center gap-2 text-blue-800 dark:text-blue-300">
          <Globe className="h-6 w-6" />
          Advanced Web Scraper
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 p-6">
        <UrlInputSection 
          url={url}
          onUrlChange={setUrl}
          onPlatformDetect={setPlatform}
        />
        
        <ScrapingOptions 
          options={scrapingOptions}
          onOptionsChange={(updates) => setScrapingOptions({ ...scrapingOptions, ...updates })}
        />
      </CardContent>
      
      <CardFooter className="flex justify-between bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-6">
        <Button variant="outline" disabled={isLoading}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Load Template
        </Button>
        <Button 
          onClick={handleScrape} 
          disabled={isLoading || !url}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scraping...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Start Scraping
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WebScraper;
