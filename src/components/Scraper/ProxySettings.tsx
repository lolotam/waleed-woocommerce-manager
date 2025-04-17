
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Server, Globe } from "lucide-react";

interface ProxySettingsProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

const ProxySettings = ({ enabled, onEnabledChange }: ProxySettingsProps) => {
  const [proxyType, setProxyType] = useState<"custom" | "service">("custom");
  const [proxyUrl, setProxyUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [country, setCountry] = useState("us");
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Server className="h-5 w-5 mr-2" />
          Proxy Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="use-proxy"
            checked={enabled}
            onCheckedChange={onEnabledChange}
          />
          <Label htmlFor="use-proxy">Use proxy for scraping</Label>
        </div>
        
        {enabled && (
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
                  <SelectItem value="service">Proxy Service API</SelectItem>
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
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Your proxy service API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="country" className="text-xs">Country</Label>
                    <Select value={country} onValueChange={setCountry}>
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
                    <Label htmlFor="session-type" className="text-xs">Session Type</Label>
                    <Select defaultValue="rotating">
                      <SelectTrigger id="session-type">
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
                
                <div className="flex items-center space-x-2 mt-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Using geolocation can help with region-restricted content
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProxySettings;
