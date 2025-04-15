
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
import { initiateWooCommerceOAuth, checkOAuthTimeout } from "@/utils/api/woocommerceAuth";
import { Save, RefreshCw, CheckCircle, Key, Lock, User, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "react-router-dom";

const BrandLogoConfig = ({ config, onUpdateConfig }: BrandLogoConfigProps) => {
  const [woocommerceUrl, setWoocommerceUrl] = useState('');
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');
  const [wpUsername, setWpUsername] = useState('');
  const [wpAppPassword, setWpAppPassword] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [authMethod, setAuthMethod] = useState<'consumer_keys' | 'app_password' | 'oauth'>('app_password');
  const [oauthConnecting, setOauthConnecting] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const savedConfig = getWooCommerceConfig();
    setWoocommerceUrl(savedConfig.url || '');
    setConsumerKey(savedConfig.consumerKey || '');
    setConsumerSecret(savedConfig.consumerSecret || '');
    setWpUsername(savedConfig.wpUsername || '');
    setWpAppPassword(savedConfig.wpAppPassword || '');
    setAuthMethod(savedConfig.authMethod || 'app_password');
    
    // Check for tab query parameter
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab === 'config') {
      // Check if OAuth timed out
      if (checkOAuthTimeout()) {
        toast.error('WooCommerce authentication timed out. Please try again.');
      }
    }
    
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
    if (!woocommerceUrl) {
      toast.error('Site URL is required');
      return;
    }
    
    if (authMethod === 'consumer_keys' && (!consumerKey || !consumerSecret)) {
      toast.error('Consumer Key and Secret are required when using API Keys');
      return;
    }
    
    if (authMethod === 'app_password' && (!wpUsername || !wpAppPassword)) {
      toast.error('WordPress Username and Application Password are required');
      return;
    }
    
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
      consumerSecret,
      wpUsername,
      wpAppPassword,
      authMethod
    };
    
    localStorage.setItem('woocommerce_config', JSON.stringify(config));
    toast.success('WooCommerce settings saved');
    
    // Test connection
    handleTestConnection();
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
  
  const handleOAuthConnect = () => {
    if (!woocommerceUrl) {
      toast.error('Please enter your store URL first');
      return;
    }
    
    setOauthConnecting(true);
    
    // First save the URL so it's available when we return
    let cleanUrl = woocommerceUrl.trim().replace(/\/+$/, '');
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    
    try {
      new URL(cleanUrl);
    } catch (e) {
      toast.error('Please enter a valid URL');
      setOauthConnecting(false);
      return;
    }
    
    // Store the URL for later use
    localStorage.setItem('wc_temp_store_url', cleanUrl);
    
    // Initiate OAuth flow with the specified URL
    try {
      initiateWooCommerceOAuth(cleanUrl);
    } catch (error) {
      console.error("OAuth connection failed:", error);
      toast.error(`OAuth error: ${error.message || 'Failed to connect'}`);
      setOauthConnecting(false);
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
            <Label>Authentication Method</Label>
            <Tabs value={authMethod} onValueChange={(value) => setAuthMethod(value as 'consumer_keys' | 'app_password' | 'oauth')}>
              <TabsList className="w-full">
                <TabsTrigger value="app_password" className="flex-1">
                  <User className="mr-2 h-4 w-4" />
                  WordPress Login
                </TabsTrigger>
                <TabsTrigger value="consumer_keys" className="flex-1">
                  <Key className="mr-2 h-4 w-4" />
                  API Keys
                </TabsTrigger>
                <TabsTrigger value="oauth" className="flex-1">
                  <Lock className="mr-2 h-4 w-4" />
                  OAuth
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="app_password" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="wp-username">WordPress Username</Label>
                  <Input
                    id="wp-username"
                    placeholder="admin"
                    value={wpUsername}
                    onChange={(e) => setWpUsername(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="wp-app-password">Application Password</Label>
                  <Input
                    id="wp-app-password"
                    type="password"
                    placeholder="XXXX XXXX XXXX XXXX XXXX XXXX"
                    value={wpAppPassword}
                    onChange={(e) => setWpAppPassword(e.target.value)}
                  />
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium mb-2">How to create an Application Password</h4>
                  <ol className="list-decimal pl-5 text-sm space-y-1 text-muted-foreground">
                    <li>Go to your WordPress admin dashboard</li>
                    <li>Navigate to Users → Profile</li>
                    <li>Scroll down to "Application Passwords" section</li>
                    <li>Enter "Brand Logo Uploader" as the name</li>
                    <li>Click "Add New Application Password"</li>
                    <li>Copy the generated password and paste it above</li>
                  </ol>
                </div>
              </TabsContent>
              
              <TabsContent value="consumer_keys" className="space-y-4 pt-4">
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
                
                <p className="text-xs text-muted-foreground mt-2">
                  Generate these in WooCommerce → Settings → Advanced → REST API
                </p>
              </TabsContent>
              
              <TabsContent value="oauth" className="space-y-4 pt-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                  <h4 className="font-medium mb-2">Connect with OAuth</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    This method will redirect you to your WooCommerce store where you can authorize access. 
                    No need to create API keys manually.
                  </p>
                  <div className="space-y-4">
                    <Button 
                      onClick={handleOAuthConnect} 
                      className="w-full"
                      disabled={oauthConnecting}
                    >
                      {oauthConnecting ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Connect to WooCommerce
                        </>
                      )}
                    </Button>
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium mb-1">Troubleshooting:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Make sure your store has WooCommerce installed and active</li>
                        <li>You must be logged in to WordPress as an administrator</li>
                        <li>Some security plugins might block this connection</li>
                        <li>
                          <a 
                            href="https://woocommerce.github.io/woocommerce-rest-api-docs/#authentication"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline inline-flex items-center"
                          >
                            Learn more about WooCommerce Auth
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleSaveWooCommerceConfig} 
              className="flex-1"
            >
              <Save className="mr-2 h-4 w-4" />
              Save & Connect
            </Button>
            <Button variant="outline" onClick={handleTestConnection} disabled={isTesting}>
              {isTesting ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Test
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
