
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PerformanceTestConfig } from "@/types/performance";
import { Globe, RefreshCw, Smartphone, Laptop, Wifi } from "lucide-react";

interface PerformanceTestFormProps {
  onSubmit?: (config: PerformanceTestConfig) => void;
  isLoading?: boolean;
}

const PerformanceTestForm: React.FC<PerformanceTestFormProps> = ({ 
  onSubmit, 
  isLoading = false 
}) => {
  const [config, setConfig] = useState<PerformanceTestConfig>({
    url: "",
    device: "desktop",
    connection: "fast",
    location: "us-east",
    browser: "chrome"
  });

  const handleChange = (field: keyof PerformanceTestConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSubmit) {
      onSubmit(config);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Test Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              placeholder="https://example.com"
              value={config.url}
              onChange={(e) => handleChange("url", e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="device">Device</Label>
              <Select 
                value={config.device} 
                onValueChange={(value) => handleChange("device", value)}
              >
                <SelectTrigger id="device">
                  <SelectValue placeholder="Select device" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desktop">
                    <div className="flex items-center">
                      <Laptop className="mr-2 h-4 w-4" />
                      Desktop
                    </div>
                  </SelectItem>
                  <SelectItem value="mobile">
                    <div className="flex items-center">
                      <Smartphone className="mr-2 h-4 w-4" />
                      Mobile
                    </div>
                  </SelectItem>
                  <SelectItem value="tablet">
                    <div className="flex items-center">
                      <Smartphone className="mr-2 h-4 w-4" />
                      Tablet
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="connection">Connection Speed</Label>
              <Select 
                value={config.connection} 
                onValueChange={(value) => handleChange("connection", value as any)}
              >
                <SelectTrigger id="connection">
                  <SelectValue placeholder="Select connection" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">
                    <div className="flex items-center">
                      <Wifi className="mr-2 h-4 w-4" />
                      Fast (Fiber)
                    </div>
                  </SelectItem>
                  <SelectItem value="average">
                    <div className="flex items-center">
                      <Wifi className="mr-2 h-4 w-4" />
                      Average (Cable/DSL)
                    </div>
                  </SelectItem>
                  <SelectItem value="slow">
                    <div className="flex items-center">
                      <Wifi className="mr-2 h-4 w-4" />
                      Slow
                    </div>
                  </SelectItem>
                  <SelectItem value="3g">
                    <div className="flex items-center">
                      <Wifi className="mr-2 h-4 w-4" />
                      3G Mobile
                    </div>
                  </SelectItem>
                  <SelectItem value="4g">
                    <div className="flex items-center">
                      <Wifi className="mr-2 h-4 w-4" />
                      4G Mobile
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Test Location</Label>
              <Select 
                value={config.location} 
                onValueChange={(value) => handleChange("location", value)}
              >
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us-east">
                    <div className="flex items-center">
                      <Globe className="mr-2 h-4 w-4" />
                      US East (N. Virginia)
                    </div>
                  </SelectItem>
                  <SelectItem value="us-west">
                    <div className="flex items-center">
                      <Globe className="mr-2 h-4 w-4" />
                      US West (Oregon)
                    </div>
                  </SelectItem>
                  <SelectItem value="eu-central">
                    <div className="flex items-center">
                      <Globe className="mr-2 h-4 w-4" />
                      EU Central (Frankfurt)
                    </div>
                  </SelectItem>
                  <SelectItem value="asia-east">
                    <div className="flex items-center">
                      <Globe className="mr-2 h-4 w-4" />
                      Asia East (Tokyo)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="browser">Browser</Label>
              <Select 
                value={config.browser} 
                onValueChange={(value) => handleChange("browser", value as any)}
              >
                <SelectTrigger id="browser">
                  <SelectValue placeholder="Select browser" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chrome">Chrome</SelectItem>
                  <SelectItem value="firefox">Firefox</SelectItem>
                  <SelectItem value="safari">Safari</SelectItem>
                  <SelectItem value="edge">Edge</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running test...
              </>
            ) : (
              "Start Performance Test"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PerformanceTestForm;
