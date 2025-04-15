
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Globe, Link2, Database, Loader2, FileSpreadsheet } from "lucide-react";
import { ScrapedProduct } from "@/types/scraper";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface WebScraperProps {
  onProductsScraped: (products: ScrapedProduct[]) => void;
}

const WebScraper = ({ onProductsScraped }: WebScraperProps) => {
  const [url, setUrl] = useState("");
  const [isCategoryPage, setIsCategoryPage] = useState(false);
  const [isScrapingAll, setIsScrapingAll] = useState(false);
  const [maxProducts, setMaxProducts] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [customSelectors, setCustomSelectors] = useState("");
  const [useCustomSelectors, setUseCustomSelectors] = useState(false);
  
  const handleScrape = async () => {
    if (!url) {
      toast.error("Please enter a URL to scrape");
      return;
    }
    
    setIsLoading(true);
    try {
      // In a real implementation, this would make a request to a backend API
      // that handles the actual scraping. For this demo, we'll simulate the response.
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
          source_url: url
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
          source_url: url
        }
      ];
      
      toast.success(`Successfully scraped ${mockProducts.length} products`);
      onProductsScraped(mockProducts);
    } catch (error) {
      console.error(error);
      toast.error("Failed to scrape products: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Web Scraper
          </CardTitle>
          <CardDescription>
            Scrape product data from any e-commerce website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <div className="flex gap-2">
              <Input
                id="url"
                placeholder="https://example.com/products/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <Button 
                variant="outline" 
                onClick={() => setUrl("")}
                disabled={!url}
              >
                Clear
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="category-page"
              checked={isCategoryPage}
              onCheckedChange={setIsCategoryPage}
            />
            <Label htmlFor="category-page">This is a category page (will scrape product links)</Label>
          </div>
          
          {isCategoryPage && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="scrape-all"
                  checked={isScrapingAll}
                  onCheckedChange={setIsScrapingAll}
                />
                <Label htmlFor="scrape-all">Scrape all products (including pagination)</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="max-products">Maximum products to scrape:</Label>
                <Input
                  id="max-products"
                  type="number"
                  className="w-24"
                  value={maxProducts}
                  onChange={(e) => setMaxProducts(parseInt(e.target.value))}
                  min={1}
                  max={1000}
                />
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="custom-selectors"
              checked={useCustomSelectors}
              onCheckedChange={setUseCustomSelectors}
            />
            <Label htmlFor="custom-selectors">Use custom CSS selectors (advanced)</Label>
          </div>
          
          {useCustomSelectors && (
            <div className="space-y-2">
              <Label htmlFor="selectors">Custom CSS Selectors (JSON)</Label>
              <Textarea
                id="selectors"
                placeholder={`{\n  "title": ".product-title",\n  "price": ".product-price",\n  "description": ".product-description"\n}`}
                value={customSelectors}
                onChange={(e) => setCustomSelectors(e.target.value)}
                className="font-mono text-sm h-32"
              />
            </div>
          )}
          
          <Alert>
            <Link2 className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Make sure you have permission to scrape the website. Some websites prohibit scraping in their Terms of Service.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" disabled={isLoading}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Load Template
          </Button>
          <Button onClick={handleScrape} disabled={isLoading}>
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
    </div>
  );
};

export default WebScraper;
