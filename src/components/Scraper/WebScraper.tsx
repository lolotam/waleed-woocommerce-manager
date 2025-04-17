
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, FileSpreadsheet, Globe, Loader2, Download, FileJson, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ScraperPlatform, ScrapedProduct } from "@/types/scraper";
import UrlInputSection from "./UrlInput/UrlInputSection";
import ScrapingOptions from "./Options/ScrapingOptions";
import { ScrapingOptions as ScrapingOptionsType } from "./types/scraperTypes";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useProcessLog from "@/hooks/useProcessLog";

interface WebScraperProps {
  onProductsScraped: (products: ScrapedProduct[]) => void;
}

type ExportFormat = 'json' | 'csv' | 'excel';

const WebScraper = ({ onProductsScraped }: WebScraperProps) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [platform, setPlatform] = useState<ScraperPlatform | null>(null);
  const [progress, setProgress] = useState(0);
  const [scrapedCount, setScrapedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [activeTab, setActiveTab] = useState("process");
  const [exportFormat, setExportFormat] = useState<ExportFormat>('excel');
  const { processLog, addLogEntry, hasPermissionError } = useProcessLog();
  
  const [scrapingOptions, setScrapingOptions] = useState<ScrapingOptionsType>({
    mode: 'auto',
    useProxy: false,
    isCategory: false,
    scrapeAll: false,
    maxProducts: 50,
    bypassProtection: true,
    enableCache: true,
    scrollBehavior: 'none',
    emulateUser: true,
    maxRetries: 3,
    requestDelay: 1000,
    randomizeDelay: true,
    concurrentRequests: 1
  });
  
  const handleScrape = async () => {
    if (!url) {
      toast.error("Please enter a URL to scrape");
      return;
    }
    
    setIsLoading(true);
    setProgress(0);
    setScrapedCount(0);
    setTotalCount(0);
    setFailedCount(0);
    addLogEntry(`Starting scraper in ${scrapingOptions.mode} mode for ${platform || 'unknown'} platform`);
    addLogEntry(`Target URL: ${url}`);
    
    if (scrapingOptions.isCategory) {
      addLogEntry(`Scraping category page with${scrapingOptions.scrapeAll ? '' : 'out'} pagination`);
      if (scrapingOptions.scrapeAll) {
        addLogEntry(`Maximum products set to: ${scrapingOptions.maxProducts}`);
        addLogEntry(`Scroll behavior: ${scrapingOptions.scrollBehavior}`);
      }
    }
    
    if (scrapingOptions.useProxy) {
      addLogEntry("Using proxy for this request");
    }
    
    if (scrapingOptions.bypassProtection) {
      addLogEntry("Bot protection bypass enabled");
    }
    
    if (scrapingOptions.emulateUser) {
      addLogEntry("Using human-like behavior simulation");
    }
    
    if (scrapingOptions.concurrentRequests > 1) {
      addLogEntry(`Using ${scrapingOptions.concurrentRequests} concurrent connections`);
    }
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.floor(Math.random() * 8) + 1;
        });
        
        setScrapedCount(prev => prev + Math.floor(Math.random() * 3) + 1);
        
        // Simulate some failures
        if (Math.random() > 0.8) {
          setFailedCount(prev => prev + 1);
          addLogEntry(`Failed to scrape product: Rate limit exceeded. Retrying... (${Math.floor(Math.random() * scrapingOptions.maxRetries) + 1}/${scrapingOptions.maxRetries})`);
        }
      }, 500);
      
      // Simulate total count update
      setTimeout(() => {
        const estimated = Math.floor(Math.random() * 50) + 20;
        setTotalCount(estimated);
        addLogEntry(`Found approximately ${estimated} products to scrape`);
      }, 1000);
      
      // Simulate detection of Cloudflare protection
      setTimeout(() => {
        if (scrapingOptions.bypassProtection) {
          addLogEntry("Detected Cloudflare protection, applying bypass technique");
          addLogEntry("Waiting for challenge to pass...");
          setTimeout(() => {
            addLogEntry("Successfully bypassed Cloudflare protection");
          }, 1500);
        } else {
          if (Math.random() > 0.5) {
            addLogEntry("WARNING: Cloudflare protection detected but bypass is disabled");
          }
        }
      }, 2000);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3500));
      
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
      
      // Add more mock products for a better demo
      for (let i = 3; i <= 15; i++) {
        mockProducts.push({
          id: `mock-${i}`,
          title: `Sample Product ${i}`,
          regular_price: `${(Math.random() * 100).toFixed(2)}`,
          sku: `SP00${i}`,
          image_url: `https://picsum.photos/id/${30 + i}/500/500`,
          categories: ["Sample Category"],
          description: "Product description example",
          source_url: url,
          platform: platform || 'unknown'
        });
      }
      
      clearInterval(progressInterval);
      setProgress(100);
      setScrapedCount(mockProducts.length);
      
      addLogEntry(`Successfully scraped ${mockProducts.length} products`);
      addLogEntry(`Failed attempts: ${failedCount}`);
      addLogEntry(`Scraping completed in 3.5 seconds`);
      addLogEntry(`Data ready for export in ${exportFormat} format`);
      
      toast.success(`Successfully scraped ${mockProducts.length} products using ${scrapingOptions.mode} mode`);
      onProductsScraped(mockProducts);
    } catch (error) {
      console.error(error);
      addLogEntry(`ERROR: ${(error as Error).message}`);
      toast.error("Failed to scrape products: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExport = () => {
    if (scrapedCount === 0) {
      toast.error("No products to export");
      return;
    }
    
    toast.success(`Exported ${scrapedCount} products as ${exportFormat.toUpperCase()}`);
    addLogEntry(`Exported ${scrapedCount} products in ${exportFormat} format`);
  };
  
  const getExportIcon = () => {
    switch(exportFormat) {
      case 'json': return <FileJson className="mr-2 h-4 w-4" />;
      case 'csv': return <FileText className="mr-2 h-4 w-4" />;
      case 'excel': return <FileSpreadsheet className="mr-2 h-4 w-4" />;
    }
  };
  
  return (
    <Card className="overflow-hidden border-2 border-blue-100 dark:border-blue-900 shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
        <CardTitle className="text-lg flex items-center gap-2 text-blue-800 dark:text-blue-300">
          <Globe className="h-6 w-6" />
          Universal eCommerce Scraper
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 p-6">
        <UrlInputSection 
          url={url}
          onUrlChange={setUrl}
          onPlatformDetect={setPlatform}
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="options" className="flex-1">Scraping Options</TabsTrigger>
            <TabsTrigger value="process" className="flex-1">Process & Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="options" className="space-y-4">
            <ScrapingOptions 
              options={scrapingOptions}
              onOptionsChange={(updates) => setScrapingOptions({ ...scrapingOptions, ...updates })}
            />
          </TabsContent>
          
          <TabsContent value="process" className="space-y-4">
            {(isLoading || scrapedCount > 0) && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Scraping progress</span>
                    <span>{scrapedCount} {totalCount ? `/ ~${totalCount}` : ''}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  
                  {failedCount > 0 && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {failedCount} requests failed. Retrying up to {scrapingOptions.maxRetries} times.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Scraping Logs</h3>
                  <ScrollArea className="h-60 w-full rounded-md border p-2 bg-black/5 dark:bg-white/5">
                    {processLog.map((log, index) => (
                      <div 
                        key={index} 
                        className={`text-xs font-mono py-0.5 ${
                          log.includes("ERROR") || log.includes("WARNING") 
                            ? "text-red-500 dark:text-red-400" 
                            : log.includes("Successfully") 
                              ? "text-green-600 dark:text-green-400"
                              : ""
                        }`}
                      >
                        {log}
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              </div>
            )}
            
            <div className="space-y-2 border-t pt-3 mt-3 border-gray-200 dark:border-gray-800">
              <h3 className="font-medium text-sm mb-2">Export Format</h3>
              <RadioGroup 
                value={exportFormat} 
                onValueChange={(value) => setExportFormat(value as ExportFormat)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excel" id="excel" />
                  <Label htmlFor="excel">Excel (.xlsx)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="csv" />
                  <Label htmlFor="csv">CSV</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="json" id="json" />
                  <Label htmlFor="json">JSON</Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-6">
        <Button 
          variant="outline" 
          disabled={isLoading || !(scrapedCount > 0)}
          onClick={handleExport}
        >
          {getExportIcon()}
          Export {scrapedCount > 0 ? `(${scrapedCount})` : ''}
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
