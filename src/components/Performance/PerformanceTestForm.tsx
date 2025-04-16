
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PerformanceTestConfig } from "@/types/performance";
import { Globe, RefreshCw, Smartphone, Laptop, Wifi, ChevronDown, ChevronUp, Lock, ExternalLink, Code } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

  const [advancedMode, setAdvancedMode] = useState(false);
  const [authEnabled, setAuthEnabled] = useState(false);
  const [apiTestingEnabled, setApiTestingEnabled] = useState(false);

  // Test locations data
  const testLocations = [
    { value: "us-east", label: "US East (N. Virginia)" },
    { value: "us-west", label: "US West (Oregon)" },
    { value: "eu-central", label: "EU Central (Frankfurt)" },
    { value: "asia-east", label: "Asia East (Tokyo)" },
    { value: "ap-southeast", label: "Asia Pacific (Singapore)" }
  ];
  
  // Connection profiles data
  const connectionProfiles = [
    { value: "fast", label: "Fast (Fiber)" },
    { value: "average", label: "Average (Cable/DSL)" },
    { value: "slow", label: "Slow" },
    { value: "4g", label: "4G (9 Mbps)" },
    { value: "3g", label: "3G (1.6 Mbps)" },
    { value: "2g", label: "2G (270 Kbps)" }
  ];

  const handleChange = (field: keyof PerformanceTestConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSubmit) {
      // Include any additional fields for advanced mode
      const enhancedConfig = {
        ...config,
        ...(advancedMode && authEnabled && {
          auth: {
            username: (document.getElementById("username") as HTMLInputElement)?.value,
            password: (document.getElementById("password") as HTMLInputElement)?.value
          }
        }),
        ...(advancedMode && apiTestingEnabled && {
          api: {
            endpoint: (document.getElementById("apiEndpoint") as HTMLInputElement)?.value,
            method: (document.getElementById("requestMethod") as HTMLSelectElement)?.value,
            headers: (document.getElementById("requestHeaders") as HTMLTextAreaElement)?.value,
            body: (document.getElementById("requestBody") as HTMLTextAreaElement)?.value
          }
        }),
        blockAds: advancedMode ? (document.getElementById("blockAds") as HTMLInputElement)?.checked : true
      };
      
      onSubmit(enhancedConfig);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Test Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="url"
                  className="pl-9"
                  placeholder="https://example.com"
                  value={config.url}
                  onChange={(e) => handleChange("url", e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading || !config.url}>
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  "Analyze"
                )}
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label>Device Type</Label>
              <RadioGroup
                className="flex gap-4 mt-2"
                value={config.device}
                onValueChange={(value) => handleChange("device", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="desktop" id="desktop" />
                  <Label htmlFor="desktop" className="flex items-center cursor-pointer">
                    <Laptop className="mr-2 h-4 w-4" />
                    Desktop
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mobile" id="mobile" />
                  <Label htmlFor="mobile" className="flex items-center cursor-pointer">
                    <Smartphone className="mr-2 h-4 w-4" />
                    Mobile
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tablet" id="tablet" />
                  <Label htmlFor="tablet" className="flex items-center cursor-pointer">
                    <Smartphone className="mr-2 h-4 w-4" />
                    Tablet
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setAdvancedMode(!advancedMode)}
              className="w-full"
            >
              {advancedMode ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Hide advanced options
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Show advanced options
                </>
              )}
            </Button>
          </div>
          
          {advancedMode && (
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="test-config">
                <AccordionTrigger>Test Configuration</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          {testLocations.map(location => (
                            <SelectItem key={location.value} value={location.value}>
                              <div className="flex items-center">
                                <Globe className="mr-2 h-4 w-4" />
                                {location.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="connection">Connection Profile</Label>
                      <Select 
                        value={config.connection} 
                        onValueChange={(value) => handleChange("connection", value as any)}
                      >
                        <SelectTrigger id="connection">
                          <SelectValue placeholder="Select connection" />
                        </SelectTrigger>
                        <SelectContent>
                          {connectionProfiles.map(profile => (
                            <SelectItem key={profile.value} value={profile.value}>
                              <div className="flex items-center">
                                <Wifi className="mr-2 h-4 w-4" />
                                {profile.label}
                              </div>
                            </SelectItem>
                          ))}
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="blockAds">Ad Blocking</Label>
                      <RadioGroup
                        className="flex flex-col gap-2 mt-2"
                        defaultValue="true"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="blockAds" />
                          <Label htmlFor="blockAds" className="cursor-pointer">Block Ads</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="dontBlockAds" />
                          <Label htmlFor="dontBlockAds" className="cursor-pointer">Don't Block Ads</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="authentication">
                <AccordionTrigger onClick={() => setAuthEnabled(prev => !prev)}>
                  Authentication (if required)
                </AccordionTrigger>
                <AccordionContent>
                  <Alert className="mb-4">
                    <Lock className="h-4 w-4" />
                    <AlertDescription>
                      These credentials are only used for the test and are not stored
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="api-testing">
                <AccordionTrigger onClick={() => setApiTestingEnabled(prev => !prev)}>
                  API Testing
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="apiEndpoint">API Endpoint</Label>
                      <div className="relative">
                        <ExternalLink className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="apiEndpoint" className="pl-9" placeholder="/api/endpoint" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="requestMethod">Method</Label>
                      <Select defaultValue="GET">
                        <SelectTrigger id="requestMethod">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="requestHeaders">Headers (JSON)</Label>
                      <Textarea 
                        id="requestHeaders" 
                        placeholder='{"Content-Type": "application/json"}'
                        className="font-mono text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="requestBody">Body (JSON)</Label>
                      <Textarea 
                        id="requestBody" 
                        placeholder='{"key": "value"}'
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
          
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
