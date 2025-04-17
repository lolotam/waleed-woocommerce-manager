
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScraperPlatform } from "@/types/scraper";
import { ZoomIn, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { detectPlatform, platformConfigs } from "@/config/scraperConfigs";

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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const platform = detectPlatform(url);
      setDetectedPlatform(platform);
      onDetect(platform);
      
    } catch (error) {
      console.error('Error detecting platform:', error);
    } finally {
      setIsDetecting(false);
    }
  };
  
  const getPlatformInfo = (platform: ScraperPlatform) => {
    const config = platformConfigs[platform];
    const requiresProxy = config.use_proxy;
    const scrapingMode = config.scraping_mode;
    
    return {
      requiresProxy,
      scrapingMode,
      color: platform === 'unknown' ? 'gray' : 
             requiresProxy ? 'amber' : 
             scrapingMode === 'headless' ? 'blue' : 'green'
    };
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
              Analyzing URL...
            </>
          ) : (
            <>
              <ZoomIn className="mr-2 h-4 w-4" />
              Detect Platform
            </>
          )}
        </Button>
        
        {detectedPlatform && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-medium flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                Platform Detected
              </div>
              <Badge 
                variant="outline" 
                className={`bg-${getPlatformInfo(detectedPlatform).color}-100 text-${getPlatformInfo(detectedPlatform).color}-800 border-${getPlatformInfo(detectedPlatform).color}-200`}
              >
                {detectedPlatform.charAt(0).toUpperCase() + detectedPlatform.slice(1)}
              </Badge>
            </div>
            
            {getPlatformInfo(detectedPlatform).requiresProxy && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This platform requires proxy and authentication for reliable scraping.
                </AlertDescription>
              </Alert>
            )}
            
            {getPlatformInfo(detectedPlatform).scrapingMode === 'headless' && (
              <Alert>
                <AlertDescription>
                  Using headless browser mode for JavaScript-heavy content.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlatformDetector;
