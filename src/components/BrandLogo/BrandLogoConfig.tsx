
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { BrandLogoConfigProps } from "@/types/brandLogo";
import { testConnection } from "@/utils/api";
import { getWooCommerceConfig } from "@/utils/api/woocommerceCore";
import { Save, RefreshCw, CheckCircle } from "lucide-react";

const BrandLogoConfig = ({ config, onUpdateConfig }: BrandLogoConfigProps) => {
  const [woocommerceUrl, setWoocommerceUrl] = useState('');
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  
  useEffect(() => {
    // Load existing WooCommerce configuration
    const savedConfig = getWooCommerceConfig();
    setWoocommerceUrl(savedConfig.url || '');
    setConsumerKey(savedConfig.consumerKey || '');
    setConsumerSecret(savedConfig.consumerSecret || '');
    
    // Load saved brand logo config if available
    const savedBrandLogoConfig = localStorage.getItem('brand_logo_config');
    if (savedBrandLogoConfig && config.saveConfigurations) {
      try {
        const parsedConfig = JSON.parse(savedBrandLogoConfig);
        onUpdateConfig(parsedConfig);
        toast.info("Loaded saved configuration");
      } catch (error) {
        console.error("Error loading saved configuration:", error);
      }
    }
  }, []);
  
  const handleSaveWooCommerceConfig = async () => {
    if (!woocommerceUrl || !consumerKey || !consumerSecret) {
      toast.error('All WooCommerce fields are required');
      return;
    }
    
    // Validate and clean URL format
    let cleanUrl = woocommerceUrl.trim().replace(/\/+$/, '');
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    
    try {
      new URL(cleanUrl);
    } catch (e) {
      toast.error('Please enter a valid URL');
      return;
    }
    
    const config = {
      url: cleanUrl,
      consumerKey,
      consumerSecret
    };
    
    localStorage.setItem('woocommerce_config', JSON.stringify(config));
    toast.success('WooCommerce settings saved');
  };
  
  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      await testConnection();
      toast.success("Connection successful!");
    } catch (error) {
      console.error("Connection test failed:", error);
    } finally {
      setIsTesting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">WooCommerce Connection</h3>
        
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="site-url">Site URL</Label>
            <Input
              id="site-url"
              placeholder="https://your-store.com"
              value={woocommerceUrl}
              onChange={(e) => setWoocommerceUrl(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="consumer-key">Consumer Key</Label>
            <Input
              id="consumer-key"
              placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={consumerKey}
              onChange={(e) => setConsumerKey(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="consumer-secret">Consumer Secret</Label>
            <Input
              id="consumer-secret"
              type="password"
              placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={consumerSecret}
              onChange={(e) => setConsumerSecret(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleSaveWooCommerceConfig}>
              <Save className="mr-2 h-4 w-4" />
              Save API Settings
            </Button>
            <Button variant="outline" onClick={handleTestConnection} disabled={isTesting}>
              {isTesting ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Test Connection
            </Button>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Upload Settings</h3>
        
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="target-type">Target Taxonomy</Label>
            <Select 
              value={config.targetType} 
              onValueChange={(value: "brands" | "categories") => onUpdateConfig({ targetType: value })}
            >
              <SelectTrigger id="target-type">
                <SelectValue placeholder="Select target type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brands">Product Brands</SelectItem>
                <SelectItem value="categories">Product Categories</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="add-description">Add to Description</Label>
              <p className="text-sm text-muted-foreground">
                Include logo in the brand/category description
              </p>
            </div>
            <Switch
              id="add-description"
              checked={config.addToDescription}
              onCheckedChange={(checked) => onUpdateConfig({ addToDescription: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="fuzzy-matching">Fuzzy Name Matching</Label>
              <p className="text-sm text-muted-foreground">
                Use fuzzy matching for special characters and spacing
              </p>
            </div>
            <Switch
              id="fuzzy-matching"
              checked={config.fuzzyMatching}
              onCheckedChange={(checked) => onUpdateConfig({ fuzzyMatching: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="save-config">Save Configuration</Label>
              <p className="text-sm text-muted-foreground">
                Remember settings between sessions
              </p>
            </div>
            <Switch
              id="save-config"
              checked={config.saveConfigurations}
              onCheckedChange={(checked) => onUpdateConfig({ saveConfigurations: checked })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandLogoConfig;
