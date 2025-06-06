import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { testConnection } from "@/utils/api";
import { toast } from "sonner";
import { Info, CheckCircle2, AlertCircle, EyeIcon, EyeOffIcon, PlugZap, ExternalLink, Key } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { testOpenAIConnection, testClaudeConnection, testGeminiConnection } from "@/utils/aiService";
import { initiateWooCommerceOAuth } from "@/utils/api/woocommerceAuth";

const Settings = () => {
  // WooCommerce settings
  const [woocommerceUrl, setWoocommerceUrl] = useState('');
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');
  const [wpUsername, setWpUsername] = useState('');
  const [wpAppPassword, setWpAppPassword] = useState('');
  const [authMethod, setAuthMethod] = useState<string>('app_password');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showConsumerKey, setShowConsumerKey] = useState(false);
  const [showAppPassword, setShowAppPassword] = useState(false);
  
  // AI settings
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [claudeApiKey, setClaudeApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [defaultAiModel, setDefaultAiModel] = useState<string>('gpt4o');
  const [testingOpenAI, setTestingOpenAI] = useState(false);
  const [testingClaude, setTestingClaude] = useState(false);
  const [testingGemini, setTestingGemini] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showClaudeKey, setShowClaudeKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [corsProxyUrl, setCorsProxyUrl] = useState('');

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
        setWpUsername(parsed.wpUsername || '');
        setWpAppPassword(parsed.wpAppPassword || '');
        setAuthMethod(parsed.authMethod || 'app_password');
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
        
        const savedProxy = localStorage.getItem('cors_proxy');
        if (savedProxy) {
          setCorsProxyUrl(savedProxy);
          window.CORS_PROXY = savedProxy;
        }
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
    if (!woocommerceUrl) {
      toast.error('Store URL is required');
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
    
    // Validate based on selected auth method
    if (authMethod === 'consumer_keys' && (!consumerKey || !consumerSecret)) {
      toast.error('Consumer Key and Consumer Secret are required for API key authentication');
      return;
    } else if (authMethod === 'app_password' && (!wpUsername || !wpAppPassword)) {
      toast.error('WordPress Username and Application Password are required');
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
    setIsConnecting(true);
    try {
      await testConnection();
    } catch (error) {
      console.error('Connection test failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleOAuthLogin = () => {
    if (!woocommerceUrl) {
      toast.error('Store URL is required to initiate OAuth');
      return;
    }
    
    initiateWooCommerceOAuth(woocommerceUrl);
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
    
    if (corsProxyUrl.trim()) {
      localStorage.setItem('cors_proxy', corsProxyUrl.trim());
      window.CORS_PROXY = corsProxyUrl.trim();
      toast.success('CORS proxy configuration saved and activated');
    } else if (localStorage.getItem('cors_proxy')) {
      localStorage.removeItem('cors_proxy');
      window.CORS_PROXY = '';
      toast.success('CORS proxy configuration cleared');
    }
    
    toast.success('AI settings saved');
  };
  
  const saveAppSettings = () => {
    localStorage.setItem('auto_save', autoSaveEnabled.toString());
    localStorage.setItem('log_ai_requests', logAiRequests.toString());
    toast.success('Application settings saved');
  };
  
  const toggleKeyVisibility = (keyType: 'openai' | 'claude' | 'gemini' | 'consumer' | 'app_password') => {
    switch (keyType) {
      case 'openai':
        setShowOpenAIKey(!showOpenAIKey);
        break;
      case 'claude':
        setShowClaudeKey(!showClaudeKey);
        break;
      case 'gemini':
        setShowGeminiKey(!showGeminiKey);
        break;
      case 'consumer':
        setShowConsumerKey(!showConsumerKey);
        break;
      case 'app_password':
        setShowAppPassword(!showAppPassword);
        break;
    }
  };
  
  const maskValue = (value: string, showFull: boolean) => {
    if (!value) return '';
    if (showFull) return value;
    const firstChars = value.substring(0, 5);
    const lastChars = value.substring(value.length - 5);
    return `${firstChars}${'•'.repeat(10)}${lastChars}`;
  };

  const handleOpenAITest = async () => {
    if (!openaiApiKey) {
      toast.error('OpenAI API key is required');
      return;
    }

    setTestingOpenAI(true);
    try {
      const result = await testOpenAIConnection(openaiApiKey);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('OpenAI connection test error:', error);
      toast.error(`Connection error: ${error.message || 'Network error'}`);
    } finally {
      setTestingOpenAI(false);
    }
  };

  const handleClaudeTest = async () => {
    if (!claudeApiKey) {
      toast.error('Claude API key is required');
      return;
    }

    setTestingClaude(true);
    try {
      if (corsProxyUrl.trim() && corsProxyUrl !== window.CORS_PROXY) {
        window.CORS_PROXY = corsProxyUrl.trim();
        toast("Using new CORS proxy for this test", { 
          description: "Your proxy setting hasn't been saved yet"
        });
      }
      
      const result = await testClaudeConnection(claudeApiKey);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        if (result.message.includes('Network connection issue')) {
          toast.error(result.message, { duration: 12000 });
          
          toast.error(
            "Need more help with Claude connection?", 
            { 
              duration: 15000,
              action: {
                label: "View Docs",
                onClick: () => window.open("https://docs.anthropic.com/claude/reference/getting-started-with-the-api", "_blank")
              }
            }
          );
        } else if (result.message.includes('Detailed network error')) {
          toast.error(result.message, { duration: 12000 });
          
          toast("Try using a CORS proxy for testing", {
            description: "If you're experiencing CORS issues, try a proxy service or ask your IT team for help",
            duration: 10000
          });
        } else {
          toast.error(result.message);
        }
      }
    } catch (error) {
      console.error('Claude connection test error:', error);
      toast.error(`Connection error: ${error.message || 'Network error'}`);
    } finally {
      setTestingClaude(false);
    }
  };

  const handleGeminiTest = async () => {
    if (!geminiApiKey) {
      toast.error('Gemini API key is required');
      return;
    }

    setTestingGemini(true);
    try {
      const result = await testGeminiConnection(geminiApiKey);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Gemini connection test error:', error);
      toast.error(`Connection error: ${error.message || 'Network error'}`);
    } finally {
      setTestingGemini(false);
    }
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
              
              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <Label className="text-base font-medium">Authentication Method</Label>
                <div className="flex flex-col space-y-2">
                  <Select value={authMethod} onValueChange={setAuthMethod}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select authentication method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consumer_keys">Consumer Keys (API Keys)</SelectItem>
                      <SelectItem value="app_password">WordPress Application Password</SelectItem>
                      <SelectItem value="oauth">OAuth (Authorize via WooCommerce)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {authMethod === 'consumer_keys' && 'Use your WooCommerce REST API keys for authentication'}
                    {authMethod === 'app_password' && 'Use WordPress Application Password for more complete access to WordPress features'}
                    {authMethod === 'oauth' && 'Authenticate via OAuth for secure authorization flow'}
                  </p>
                </div>
              </div>
              
              {authMethod === 'consumer_keys' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="consumer-key">Consumer Key</Label>
                    <div className="relative">
                      <Input
                        id="consumer-key"
                        placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        value={maskValue(consumerKey, showConsumerKey)}
                        onChange={(e) => setConsumerKey(e.target.value)}
                        type="text"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => toggleKeyVisibility('consumer')}
                      >
                        {showConsumerKey ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                      </Button>
                    </div>
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
                  
                  <p className="text-sm text-muted-foreground mt-2 flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    Generate API keys in WooCommerce dashboard under Settings → Advanced → REST API.
                  </p>
                </>
              )}
              
              {authMethod === 'app_password' && (
                <>
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
                    <div className="relative">
                      <Input
                        id="wp-app-password"
                        placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                        value={maskValue(wpAppPassword, showAppPassword)}
                        onChange={(e) => setWpAppPassword(e.target.value)}
                        type={showAppPassword ? "text" : "password"}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => toggleKeyVisibility('app_password')}
                      >
                        {showAppPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-2 flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    Create an Application Password in WordPress under Users → Profile → Application Passwords.
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="ml-1 h-auto p-0 text-blue-500"
                      onClick={() => window.open('https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/', '_blank')}
                    >
                      Learn more
                    </Button>
                  </p>
                </>
              )}
              
              {authMethod === 'oauth' && (
                <>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-md space-y-3">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-700 dark:text-blue-300">OAuth Authentication</h4>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          Securely connect to your WooCommerce store without manually entering API keys.
                          This will redirect you to your store to authorize the connection.
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="bg-white dark:bg-blue-900 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800 w-full justify-center"
                      onClick={handleOAuthLogin}
                    >
                      <Key className="mr-2 h-4 w-4" />
                      Authorize with WooCommerce
                    </Button>
                    
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Note: Your site must be accessible from the internet for OAuth to work properly.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mt-2 flex items-start">
                      <Info className="h-4 w-4 mr-1 mt-1" />
                      After authorization, your access credentials will be automatically saved and you'll be redirected back.
                      The OAuth process is more secure as it doesn't require you to copy and paste sensitive API keys.
                    </p>
                  </div>
                </>
              )}
              
              <div className="pt-4 space-y-2">
                <Button 
                  onClick={saveWooCommerceSettings}
                  disabled={isConnecting || (authMethod === 'oauth')}
                >
                  {isConnecting ? 'Connecting...' : 'Save & Test Connection'}
                </Button>
                {authMethod === 'oauth' && (
                  <p className="text-xs text-orange-500 mt-1">
                    For OAuth, use the Authorize button above instead of Save.
                  </p>
                )}
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
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      id="openai-api-key"
                      type={showOpenAIKey ? "text" : "password"}
                      placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={openaiApiKey}
                      onChange={(e) => setOpenaiApiKey(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleKeyVisibility('openai')}
                    >
                      {showOpenAIKey ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleOpenAITest}
                    disabled={testingOpenAI || !openaiApiKey}
                    className="whitespace-nowrap"
                  >
                    <PlugZap className={`h-4 w-4 mr-1 ${testingOpenAI ? 'animate-spin' : ''}`} />
                    {testingOpenAI ? 'Testing...' : 'Test Connection'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your API key from the <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">OpenAI platform</a>
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="claude-api-key">Claude API Key</Label>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      id="claude-api-key"
                      type={showClaudeKey ? "text" : "password"}
                      placeholder="sk-ant-api03-xxxxxxxx"
                      value={claudeApiKey}
                      onChange={(e) => setClaudeApiKey(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleKeyVisibility('claude')}
                    >
                      {showClaudeKey ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleClaudeTest}
                    disabled={testingClaude || !claudeApiKey}
                    className="whitespace-nowrap"
                  >
                    <PlugZap className={`h-4 w-4 mr-1 ${testingClaude ? 'animate-spin' : ''}`} />
                    {testingClaude ? 'Testing...' : 'Test Connection'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your API key from <a href="https://console.anthropic.com/keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Anthropic's console</a>
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="gemini-api-key">Gemini API Key</Label>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      id="gemini-api-key"
                      type={showGeminiKey ? "text" : "password"}
                      placeholder="AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleKeyVisibility('gemini')}
                    >
                      {showGeminiKey ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleGeminiTest}
                    disabled={testingGemini || !geminiApiKey}
                    className="whitespace-nowrap"
                  >
                    <PlugZap className={`h-4 w-4 mr-1 ${testingGemini ? 'animate-spin' : ''}`} />
                    {testingGemini ? 'Testing...' : 'Test Connection'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google AI Studio</a>
                </p>
              </div>
              
              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cors-proxy">CORS Proxy URL (for Claude API)</Label>
                </div>
                <Input
                  id="cors-proxy"
                  type="text"
                  placeholder="https://your-cors-proxy-url.com/"
                  value={corsProxyUrl}
                  onChange={(e) => setCorsProxyUrl(e.target.value)}
                  className="flex-1"
                />
                <p className="text-xs text-muted-foreground">
                  If you're experiencing CORS issues with Claude, enter a proxy URL to route requests through.
                  Example free proxies: <code>https://corsproxy.io/?</code> or <code>https://cors-anywhere.herokuapp.com/</code> (requires activation)
                </p>
                <div className="flex items-center space-x-2 pt-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setCorsProxyUrl('https://corsproxy.io/?');
                    }}
                    className="text-xs"
                  >
                    Use corsproxy.io
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setCorsProxyUrl('https://cors-anywhere.herokuapp.com/');
                    }}
                    className="text-xs"
                  >
                    Use cors-anywhere
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      window.open('https://cors-anywhere.herokuapp.com/corsdemo', '_blank');
                    }}
                    className="text-xs"
                  >
                    Activate cors-anywhere
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 pt-4">
                <Label htmlFor="default-model">Default AI Model</Label>
                <Select value={defaultAiModel} onValueChange={setDefaultAiModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select default AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>OpenAI Models</SelectLabel>
                      <SelectItem value="gpt4o">GPT-4o (Balanced for most tasks)</SelectItem>
                      <SelectItem value="gpt4o_mini">GPT-4o Mini (Fast responses)</SelectItem>
                      <SelectItem value="gpt45">GPT-4.5 (Advanced reasoning)</SelectItem>
                      <SelectItem value="o1">o1 (Strongest reasoning abilities)</SelectItem>
                      <SelectItem value="o1_mini">o1-mini (Fast advanced reasoning)</SelectItem>
                      <SelectItem value="o1_mini_high">o1-mini-high (Great at coding)</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Claude Models</SelectLabel>
                      <SelectItem value="claude37">Claude 3.7 Sonnet (Most intelligent)</SelectItem>
                      <SelectItem value="claude35_sonnet">Claude 3.5 Sonnet (Oct 2024)</SelectItem>
                      <SelectItem value="claude35_haiku">Claude 3.5 Haiku (Fast daily tasks)</SelectItem>
                      <SelectItem value="claude3_opus">Claude 3 Opus (Complex reasoning)</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Gemini Models</SelectLabel>
                      <SelectItem value="gemini_flash">Gemini 2.0 Flash (Everyday help)</SelectItem>
                      <SelectItem value="gemini_flash_thinking">Gemini 2.0 Flash Thinking (Advanced reasoning)</SelectItem>
                      <SelectItem value="gemini_pro">Gemini 2.5 Pro (Complex tasks)</SelectItem>
                      <SelectItem value="gemini_research">Gemini Deep Research (In-depth reports)</SelectItem>
                    </SelectGroup>
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
