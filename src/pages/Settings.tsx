import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { testConnection } from "@/utils/woocommerceApi";
import { toast } from "sonner";
import { Info, CheckCircle2, AlertCircle } from "lucide-react";

const Settings = () => {
  // WooCommerce settings
  const [woocommerceUrl, setWoocommerceUrl] = useState('');
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  
  // AI settings
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [claudeApiKey, setClaudeApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [defaultAiModel, setDefaultAiModel] = useState<string>('gpt4o');
  
  // Application settings
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [logAiRequests, setLogAiRequests] = useState(true);
  
  useEffect(() => {
    // Load settings from localStorage
    const loadWooCommerceSettings = () => {
      const config = localStorage.getItem('woocommerce_config');
      if (config) {
        const parsed = JSON.parse(config);
        setWoocommerceUrl(parsed.url || '');
        setConsumerKey(parsed.consumerKey || '');
        setConsumerSecret(parsed.consumerSecret || '');
      }
    };
    
    const loadAiSettings = () => {
      const config = localStorage.getItem('ai_config');
      if (config) {
        const parsed = JSON.parse(config);
        setOpenaiApiKey(parsed.openaiApiKey || '');
        setClaudeApiKey(parsed.claudeApiKey || '');
        setGeminiApiKey(parsed.geminiApiKey || '');
        setDefaultAiModel(parsed.defaultModel || 'gpt4o');
      }
    };
    
    const loadAppSettings = () => {
      const autoSave = localStorage.getItem('auto_save');
      const logRequests = localStorage.getItem('log_ai_requests');
      
      setAutoSaveEnabled(autoSave !== 'false');
      setLogAiRequests(logRequests !== 'false');
    };
    
    loadWooCommerceSettings();
    loadAiSettings();
    loadAppSettings();
  }, []);
  
  const saveWooCommerceSettings = async () => {
    if (!woocommerceUrl || !consumerKey || !consumerSecret) {
      toast.error('All fields are required');
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
    
    // Test connection
    setIsConnecting(true);
    try {
      await testConnection();
    } finally {
      setIsConnecting(false);
    }
  };
  
  const saveAiSettings = () => {
    // Ensure at least one API key is provided
    if (!openaiApiKey && !claudeApiKey && !geminiApiKey) {
      toast.error('At least one AI API key is required');
      return;
    }
    
    const config = {
      openaiApiKey,
      claudeApiKey,
      geminiApiKey,
      defaultModel: defaultAiModel
    };
    
    localStorage.setItem('ai_config', JSON.stringify(config));
    toast.success('AI settings saved');
  };
  
  const saveAppSettings = () => {
    localStorage.setItem('auto_save', autoSaveEnabled.toString());
    localStorage.setItem('log_ai_requests', logAiRequests.toString());
    toast.success('Application settings saved');
  };
  
  const isApiKeyValid = (key: string): boolean => {
    return key.length >= 20;
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your application settings</p>
      </div>
      
      <Tabs defaultValue="woocommerce" className="space-y-4">
        <TabsList>
          <TabsTrigger value="woocommerce">WooCommerce</TabsTrigger>
          <TabsTrigger value="ai">AI Configuration</TabsTrigger>
          <TabsTrigger value="application">Application</TabsTrigger>
        </TabsList>
        
        {/* WooCommerce Settings */}
        <TabsContent value="woocommerce">
          <Card>
            <CardHeader>
              <CardTitle>WooCommerce API Settings</CardTitle>
              <CardDescription>
                Configure your WooCommerce store connection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="woocommerce-url">Store URL</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="woocommerce-url"
                    placeholder="yourstore.com"
                    value={woocommerceUrl}
                    onChange={(e) => setWoocommerceUrl(e.target.value)}
                  />
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {!woocommerceUrl.startsWith('http') && woocommerceUrl && (
                      <span className="flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        https:// will be added
                      </span>
                    )}
                  </div>
                </div>
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
              
              <div className="pt-4 space-y-2">
                <Button 
                  onClick={saveWooCommerceSettings}
                  disabled={isConnecting}
                >
                  {isConnecting ? 'Connecting...' : 'Save & Test Connection'}
                </Button>
                <p className="text-sm text-muted-foreground mt-2 flex items-center">
                  <Info className="h-4 w-4 mr-1" />
                  You can generate API keys in your WooCommerce dashboard under Settings → Advanced → REST API.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* AI Settings */}
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI API Settings</CardTitle>
              <CardDescription>
                Configure your AI model connections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="openai-api-key">OpenAI API Key</Label>
                  {openaiApiKey && isApiKeyValid(openaiApiKey) && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <Input
                  id="openai-api-key"
                  type="password"
                  placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="claude-api-key">Claude API Key</Label>
                  {claudeApiKey && isApiKeyValid(claudeApiKey) && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <Input
                  id="claude-api-key"
                  type="password"
                  placeholder="sk-ant-api03-xxxxxxxx"
                  value={claudeApiKey}
                  onChange={(e) => setClaudeApiKey(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="gemini-api-key">Gemini API Key</Label>
                  {geminiApiKey && isApiKeyValid(geminiApiKey) && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <Input
                  id="gemini-api-key"
                  type="password"
                  placeholder="AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                />
              </div>
              
              <div className="space-y-2 pt-4">
                <Label htmlFor="default-model">Default AI Model</Label>
                <Select value={defaultAiModel} onValueChange={setDefaultAiModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select default AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt4o">OpenAI GPT-4o</SelectItem>
                    <SelectItem value="claude3">Anthropic Claude 3 Sonnet</SelectItem>
                    <SelectItem value="gemini">Google Gemini 1.5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-4">
                <Button onClick={saveAiSettings}>
                  Save AI Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Application Settings */}
        <TabsContent value="application">
          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
              <CardDescription>
                Configure general application settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-save">Auto Save</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save changes when editing
                  </p>
                </div>
                <Switch
                  id="auto-save"
                  checked={autoSaveEnabled}
                  onCheckedChange={setAutoSaveEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label htmlFor="log-requests">Log AI Requests</Label>
                  <p className="text-sm text-muted-foreground">
                    Keep a log of all AI generation requests
                  </p>
                </div>
                <Switch
                  id="log-requests"
                  checked={logAiRequests}
                  onCheckedChange={setLogAiRequests}
                />
              </div>
              
              <div className="pt-4">
                <Button onClick={saveAppSettings}>
                  Save Application Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
