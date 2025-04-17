
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Globe, 
  Link2, 
  Database, 
  Loader2, 
  FileSpreadsheet, 
  Shield, 
  Server, 
  Check, 
  Code, 
  HardDrive,
  ZoomIn
} from "lucide-react";
import { ScrapedProduct, ScraperPlatform } from "@/types/scraper";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ProxySettings from "./ProxySettings";
import ScrapingModeSelector from "./ScrapingModeSelector";
import PlatformDetector from "./PlatformDetector";

interface WebScraperProps {
  onProductsScraped: (products: ScrapedProduct[]) => void;
}

type ScrapingMode = "auto" | "simple" | "headless" | "authenticated";

const WebScraper = ({ onProductsScraped }: WebScraperProps) => {
  const [url, setUrl] = useState("");
  const [isCategoryPage, setIsCategoryPage] = useState(false);
  const [isScrapingAll, setIsScrapingAll] = useState(false);
  const [maxProducts, setMaxProducts] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [customSelectors, setCustomSelectors] = useState("");
  const [useCustomSelectors, setUseCustomSelectors] = useState(false);
  const [currentTab, setCurrentTab] = useState("basic");
  const [scrapingMode, setScrapingMode] = useState<ScrapingMode>("auto");
  const [detectedPlatform, setDetectedPlatform] = useState<ScraperPlatform | null>(null);
  const [isDetectingPlatform, setIsDetectingPlatform] = useState(false);
  const [useProxy, setUseProxy] = useState(false);
  const [proxyType, setProxyType] = useState<"custom" | "service">("custom");
  const [proxyUrl, setProxyUrl] = useState("");
  const [proxyApiKey, setProxyApiKey] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  
  const detectPlatform = async () => {
    if (!url) {
      toast.error("Please enter a URL to detect platform");
      return;
    }

    setIsDetectingPlatform(true);
    
    try {
      // In a real implementation, this would make a request to a backend API
      // that handles platform detection. For this demo, we'll simulate the response.
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let platform: ScraperPlatform = 'unknown';
      
      if (url.includes('shopify.com') || url.includes('myshopify.com')) {
        platform = 'shopify';
      } else if (url.includes('amazon.com')) {
        platform = 'amazon';
      } else if (url.includes('temu.com')) {
        platform = 'temu';
      } else if (url.includes('shein.com')) {
        platform = 'shein';
      } else if (url.includes('aliexpress.com')) {
        platform = 'aliexpress';
      } else if (url.includes('woocommerce')) {
        platform = 'woocommerce';
      } else {
        // Check for common patterns in the URL
        if (url.includes('/product/') || url.includes('/shop/')) {
          platform = 'woocommerce';
        }
      }
      
      setDetectedPlatform(platform);
      
      // Auto-select the best scraping mode based on the platform
      if (platform === 'amazon' || platform === 'temu' || platform === 'shein') {
        setScrapingMode('authenticated');
        setUseProxy(true);
      } else if (platform === 'shopify') {
        setScrapingMode('headless');
      } else if (platform === 'aliexpress') {
        setScrapingMode('headless');
        setUseProxy(true);
      } else {
        setScrapingMode('auto');
      }
      
      toast.success(`Platform detected: ${platform}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to detect platform: " + (error as Error).message);
    } finally {
      setIsDetectingPlatform(false);
    }
  };
  
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
          source_url: url,
          platform: detectedPlatform || 'unknown'
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
          platform: detectedPlatform || 'unknown'
        }
      ];
      
      toast.success(`Successfully scraped ${mockProducts.length} products using ${scrapingMode} mode`);
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
      <Card className="overflow-hidden border-2 border-blue-100 dark:border-blue-900 shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
            <Globe className="h-6 w-6" />
            Advanced Web Scraper
          </CardTitle>
          <CardDescription>
            Extract product data from any e-commerce platform with intelligent scraping
          </CardDescription>
        </CardHeader>
        
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <div className="px-6 pt-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Settings</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
              <TabsTrigger value="proxies">Proxy Settings</TabsTrigger>
            </TabsList>
          </div>
          
          <CardContent className="space-y-4 p-6">
            <TabsContent value="basic" className="space-y-4 mt-0">
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
                    className="shrink-0"
                  >
                    Clear
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Platform Detection</Label>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={detectPlatform}
                      disabled={!url || isDetectingPlatform}
                      className="w-full"
                    >
                      {isDetectingPlatform ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Detecting...
                        </>
                      ) : (
                        <>
                          <ZoomIn className="mr-2 h-4 w-4" />
                          Detect Platform
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {detectedPlatform && (
                    <div className="text-sm rounded-md p-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                      <div className="font-semibold flex items-center">
                        <Check className="h-4 w-4 mr-1 text-green-500" />
                        Platform: {detectedPlatform.charAt(0).toUpperCase() + detectedPlatform.slice(1)}
                      </div>
                      {(detectedPlatform === 'amazon' || detectedPlatform === 'temu' || detectedPlatform === 'shein') && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          Note: This platform may require proxies and authentication
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scraping-mode">Scraping Mode</Label>
                  <Select 
                    value={scrapingMode} 
                    onValueChange={(value) => setScrapingMode(value as ScrapingMode)}
                  >
                    <SelectTrigger id="scraping-mode">
                      <SelectValue placeholder="Select scraping mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto (Recommended)</SelectItem>
                      <SelectItem value="simple">Simple Request</SelectItem>
                      <SelectItem value="headless">Headless Browser</SelectItem>
                      <SelectItem value="authenticated">Authenticated Session</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {scrapingMode === 'auto' && "Automatically selects the best mode based on the website"}
                    {scrapingMode === 'simple' && "Fast, but only works for static HTML websites"}
                    {scrapingMode === 'headless' && "Handles JavaScript-heavy websites, but slower"}
                    {scrapingMode === 'authenticated' && "For sites requiring login or with bot protection"}
                  </p>
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
                <div className="space-y-2 pl-6 border-l-2 border-blue-100 dark:border-blue-800">
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
              
              <div className="space-y-2">
                <Label htmlFor="prompt">Scraping Instructions (Optional)</Label>
                <Textarea
                  id="prompt"
                  placeholder="Example: Scrape all visible products including: title, price, image URL, and link. Wait for JS to fully load."
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  className="min-h-24"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4 mt-0">
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
              
              <div className="space-y-2">
                <Label>Platform-Specific Settings</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-md border p-3 space-y-2">
                    <div className="font-medium flex items-center">
                      <Shield className="h-4 w-4 mr-1 text-amber-500" />
                      Bypass Bot Protection
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="bypass-protection" />
                      <Label htmlFor="bypass-protection" className="text-sm">Enable stealth mode</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Helps bypass anti-bot measures on sites like Amazon
                    </p>
                  </div>
                  
                  <div className="rounded-md border p-3 space-y-2">
                    <div className="font-medium flex items-center">
                      <HardDrive className="h-4 w-4 mr-1 text-blue-500" />
                      Cache Settings
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="enable-cache" defaultChecked />
                      <Label htmlFor="enable-cache" className="text-sm">Enable request caching</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Reduces bandwidth and improves performance
                    </p>
                  </div>
                </div>
              </div>
              
              <Alert>
                <Code className="h-4 w-4" />
                <AlertTitle>Expert Mode</AlertTitle>
                <AlertDescription>
                  Advanced settings enable precise control over the scraping process but may require technical knowledge of web scraping techniques.
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="proxies" className="space-y-4 mt-0">
              <div className="flex items-center space-x-2">
                <Switch
                  id="use-proxy"
                  checked={useProxy}
                  onCheckedChange={setUseProxy}
                />
                <Label htmlFor="use-proxy">Use proxy for scraping</Label>
              </div>
              
              {useProxy && (
                <div className="space-y-4 pl-6 border-l-2 border-blue-100 dark:border-blue-800">
                  <div className="space-y-2">
                    <Label htmlFor="proxy-type">Proxy Type</Label>
                    <Select 
                      value={proxyType} 
                      onValueChange={(value) => setProxyType(value as "custom" | "service")}
                    >
                      <SelectTrigger id="proxy-type">
                        <SelectValue placeholder="Select proxy type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Custom Proxy</SelectItem>
                        <SelectItem value="service">Proxy Service (ScraperAPI, BrightData, etc.)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {proxyType === "custom" && (
                    <div className="space-y-2">
                      <Label htmlFor="proxy-url">Proxy URL</Label>
                      <Input
                        id="proxy-url"
                        placeholder="http://username:password@proxy.example.com:8080"
                        value={proxyUrl}
                        onChange={(e) => setProxyUrl(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Format: http://username:password@hostname:port
                      </p>
                    </div>
                  )}
                  
                  {proxyType === "service" && (
                    <div className="space-y-2">
                      <Label htmlFor="proxy-api-key">API Key</Label>
                      <Input
                        id="proxy-api-key"
                        type="password"
                        placeholder="Your proxy service API key"
                        value={proxyApiKey}
                        onChange={(e) => setProxyApiKey(e.target.value)}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="country" className="text-xs">Country</Label>
                          <Select defaultValue="us">
                            <SelectTrigger id="country">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="us">United States</SelectItem>
                              <SelectItem value="uk">United Kingdom</SelectItem>
                              <SelectItem value="ca">Canada</SelectItem>
                              <SelectItem value="au">Australia</SelectItem>
                              <SelectItem value="de">Germany</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="session" className="text-xs">Session Type</Label>
                          <Select defaultValue="rotating">
                            <SelectTrigger id="session">
                              <SelectValue placeholder="Session type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="rotating">Rotating IP</SelectItem>
                              <SelectItem value="residential">Residential IP</SelectItem>
                              <SelectItem value="datacenter">Datacenter IP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <Alert>
                <Server className="h-4 w-4" />
                <AlertTitle>Recommended for Bot-Protected Sites</AlertTitle>
                <AlertDescription>
                  Using proxies is recommended for sites like Amazon, Temu, Shein, and AliExpress that have strict bot protection systems.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </CardContent>
        </Tabs>
        
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
    </div>
  );
};

export default WebScraper;
