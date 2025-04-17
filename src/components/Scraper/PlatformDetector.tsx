
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScraperPlatform } from "@/types/scraper";
import { ZoomIn, Loader2, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PlatformDetectorProps {
  url: string;
  onDetect: (platform: ScraperPlatform) => void;
}

const PlatformDetector = ({ url, onDetect }: PlatformDetectorProps) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedPlatform, setDetectedPlatform] = useState<ScraperPlatform | null>(null);
  
  const handleDetect = async () => {
    if (!url) return;
    
    setIsDetecting(true);
    
    try {
      // In a real implementation, this would call a backend API
      // For demo purposes, we'll simulate the response
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
      onDetect(platform);
    } catch (error) {
      console.error('Error detecting platform:', error);
    } finally {
      setIsDetecting(false);
    }
  };
  
  const getPlatformColor = (platform: ScraperPlatform): string => {
    switch (platform) {
      case 'shopify':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300';
      case 'woocommerce':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300';
      case 'amazon':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-300';
      case 'aliexpress':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300';
      case 'temu':
      case 'shein':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <ZoomIn className="h-5 w-5 mr-2" />
          Platform Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleDetect} 
          disabled={!url || isDetecting}
          variant="outline" 
          className="w-full"
        >
          {isDetecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Detecting Platform...
            </>
          ) : (
            <>
              <ZoomIn className="mr-2 h-4 w-4" />
              Detect Platform
            </>
          )}
        </Button>
        
        {detectedPlatform && (
          <div className="rounded-md border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                Platform Detected
              </div>
              <Badge 
                variant="outline" 
                className={getPlatformColor(detectedPlatform)}
              >
                {detectedPlatform.charAt(0).toUpperCase() + detectedPlatform.slice(1)}
              </Badge>
            </div>
            
            {(detectedPlatform === 'amazon' || detectedPlatform === 'temu' || detectedPlatform === 'shein') && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Note: This platform typically requires proxy and authentication for successful scraping.
              </p>
            )}
            
            {detectedPlatform === 'shopify' && (
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Note: Shopify sites work best with headless browser mode due to JavaScript rendering.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlatformDetector;
